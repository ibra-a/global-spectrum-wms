#!/usr/bin/env node
/**
 * Add Custom Fields to ERPNext for WMS - Version 2
 * Uses direct doc creation instead of filtering
 */

require('dotenv').config();
const https = require('https');

const ERPNEXT_URL = process.env.ERPNEXT_URL;
const API_KEY = process.env.ERPNEXT_API_KEY;
const API_SECRET = process.env.ERPNEXT_API_SECRET;

const url = new URL(ERPNEXT_URL);

function callERPNextAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          if (responseData) {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(parsed)}`));
            }
          } else {
            resolve({ success: true });
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, raw: responseData });
          } else {
            reject(new Error(`Parse Error: ${e.message}\nResponse: ${responseData}`));
          }
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function createCustomField(doctype, fieldData) {
  console.log(`\n📝 Creating custom field: ${doctype}.${fieldData.fieldname}`);
  
  try {
    // Try to create directly
    const endpoint = '/api/resource/Custom Field';
    const payload = {
      dt: doctype,
      ...fieldData,
      docstatus: 0,
      __islocal: 1,
      __unsaved: 1
    };
    
    console.log(`   📤 Sending request...`);
    const response = await callERPNextAPI(endpoint, 'POST', payload);
    
    console.log(`   ✅ Created successfully!`);
    return { created: true, data: response };
    
  } catch (error) {
    // Check if it's a duplicate error
    if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
      console.log(`   ⚠️  Field already exists: ${fieldData.fieldname}`);
      console.log(`   ✅ This is OK - field is already configured`);
      return { skipped: true, reason: 'already_exists' };
    }
    
    console.log(`   ❌ Error: ${error.message}`);
    
    // Check if it's a permission error
    if (error.message.includes('permission') || error.message.includes('403')) {
      console.log(`   ℹ️  Your API user may need "System Manager" role`);
    }
    
    throw error;
  }
}

async function testConnection() {
  console.log('🔌 Testing API connection...\n');
  
  try {
    const response = await callERPNextAPI('/api/method/frappe.auth.get_logged_user');
    console.log(`   ✅ Connected as: ${response.message || 'API User'}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 ERPNext Custom Fields Setup for WMS (v2)');
  console.log('='.repeat(70));
  console.log(`\nConnecting to: ${ERPNEXT_URL}\n`);

  if (!API_KEY || !API_SECRET) {
    console.log('❌ ERROR: Missing API credentials in .env file');
    process.exit(1);
  }

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without API connection');
    process.exit(1);
  }

  console.log('\n' + '-'.repeat(70));
  
  const results = [];

  try {
    // Field 1: Stock Entry - idempotency_key
    console.log('\n📋 Field 1 of 2: Stock Entry.idempotency_key');
    
    const stockEntryField = {
      fieldname: 'idempotency_key',
      label: 'Idempotency Key',
      fieldtype: 'Data',
      insert_after: 'naming_series',
      unique: 1,
      read_only: 1,
      hidden: 0,
      print_hide: 1,
      allow_in_quick_entry: 0,
      description: 'Unique key to prevent duplicate entries during offline sync',
      translatable: 0,
      mandatory_depends_on: '',
      read_only_depends_on: '',
      depends_on: ''
    };
    
    const result1 = await createCustomField('Stock Entry', stockEntryField);
    results.push({ field: 'Stock Entry.idempotency_key', ...result1 });
    
  } catch (error) {
    console.log(`\n⚠️  Could not create Stock Entry field: ${error.message}`);
    results.push({ field: 'Stock Entry.idempotency_key', failed: true, error: error.message });
  }

  try {
    // Field 2: Pick List - external_ref
    console.log('\n📋 Field 2 of 2: Pick List.external_ref');
    
    const pickListField = {
      fieldname: 'external_ref',
      label: 'External Reference',
      fieldtype: 'Data',
      insert_after: 'name',
      unique: 0,
      read_only: 0,
      hidden: 0,
      print_hide: 1,
      allow_in_quick_entry: 0,
      description: 'Reference ID from external scanning application (PWA)',
      translatable: 0,
      mandatory_depends_on: '',
      read_only_depends_on: '',
      depends_on: ''
    };
    
    const result2 = await createCustomField('Pick List', pickListField);
    results.push({ field: 'Pick List.external_ref', ...result2 });
    
  } catch (error) {
    console.log(`\n⚠️  Could not create Pick List field: ${error.message}`);
    results.push({ field: 'Pick List.external_ref', failed: true, error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary');
  console.log('='.repeat(70));
  
  const created = results.filter(r => r.created).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => r.failed).length;
  
  console.log(`\n✅ Created: ${created}`);
  console.log(`⚠️  Skipped (already exist): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  
  results.forEach(r => {
    const status = r.created ? '✅ Created' : r.skipped ? '⚠️  Exists' : '❌ Failed';
    console.log(`   ${status}: ${r.field}`);
  });
  
  if (failed > 0) {
    console.log('\n⚠️  Some fields could not be created via API');
    console.log('\n📋 Manual Creation Required:');
    console.log('   1. Go to ERPNext → Search "Customize Form"');
    console.log('   2. Select "Stock Entry"');
    console.log('   3. Add custom field: idempotency_key (Data, Unique, Read Only)');
    console.log('   4. Click Update');
    console.log('\n   See docs/IMPORT_GUIDE.md for detailed instructions');
  } else {
    console.log('\n🎯 Next Steps:');
    console.log('   1. ✅ Warehouse locations imported (207 locations)');
    console.log('   2. ✅ Custom fields added for offline sync');
    console.log('   3. 📋 Ready to create epics and start development!');
    console.log('\n✨ ERPNext setup complete!\n');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
}




