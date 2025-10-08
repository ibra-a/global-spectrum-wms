#!/usr/bin/env node
/**
 * Add Custom Fields to ERPNext for WMS
 * 
 * Creates:
 * 1. Stock Entry.idempotency_key (for offline sync)
 * 2. Pick List.external_ref (for PWA reference)
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
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${responseData}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}\nResponse: ${responseData}`));
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

async function addCustomField(doctype, fieldData) {
  console.log(`\n📝 Adding custom field: ${doctype}.${fieldData.fieldname}`);
  
  try {
    // Check if field already exists
    const filters = encodeURIComponent(JSON.stringify([["dt","=",doctype],["fieldname","=",fieldData.fieldname]]));
    const checkEndpoint = `/api/resource/Custom Field?filters=${filters}`;
    const existing = await callERPNextAPI(checkEndpoint);
    
    if (existing.data && existing.data.length > 0) {
      console.log(`   ⚠️  Field already exists: ${fieldData.fieldname}`);
      console.log(`   ✅ Skipping creation`);
      return { skipped: true, existing: existing.data[0] };
    }
    
    // Create the custom field
    const createEndpoint = '/api/resource/Custom Field';
    const response = await callERPNextAPI(createEndpoint, 'POST', fieldData);
    
    console.log(`   ✅ Created successfully!`);
    return { created: true, data: response.data };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 ERPNext Custom Fields Setup for WMS');
  console.log('='.repeat(70));
  console.log(`\nConnecting to: ${ERPNEXT_URL}\n`);

  if (!API_KEY || !API_SECRET) {
    console.log('❌ ERROR: Missing API credentials in .env file');
    process.exit(1);
  }

  try {
    // Field 1: Stock Entry - idempotency_key
    const stockEntryField = {
      dt: 'Stock Entry',
      fieldname: 'idempotency_key',
      label: 'Idempotency Key',
      fieldtype: 'Data',
      insert_after: 'naming_series',  // Place near top
      unique: 1,
      read_only: 1,
      hidden: 0,
      print_hide: 1,
      description: 'Unique key to prevent duplicate entries during offline sync',
      translatable: 0
    };
    
    const result1 = await addCustomField('Stock Entry', stockEntryField);
    
    // Field 2: Pick List - external_ref (optional)
    console.log('\n---\n');
    
    const pickListField = {
      dt: 'Pick List',
      fieldname: 'external_ref',
      label: 'External Reference',
      fieldtype: 'Data',
      insert_after: 'name',
      unique: 0,
      read_only: 0,
      hidden: 0,
      print_hide: 1,
      description: 'Reference ID from external scanning application (PWA)',
      translatable: 0
    };
    
    const result2 = await addCustomField('Pick List', pickListField);
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Summary');
    console.log('='.repeat(70));
    
    console.log('\n✅ Custom Fields Setup:');
    console.log(`   1. Stock Entry.idempotency_key: ${result1.created ? 'Created' : 'Already exists'}`);
    console.log(`   2. Pick List.external_ref: ${result2.created ? 'Created' : 'Already exists'}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. ✅ Warehouse locations imported (169 pilot locations)');
    console.log('   2. ✅ Custom fields added for offline sync');
    console.log('   3. 📋 Ready to create epics and start development!');
    
    console.log('\n✨ ERPNext is now ready for WMS development!\n');
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.log('\nTroubleshooting:');
    console.log('   - Ensure API user has "Customize Form" permission');
    console.log('   - Check that API credentials are correct in .env');
    console.log('   - You may need "System Manager" role to create custom fields');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addCustomField };

