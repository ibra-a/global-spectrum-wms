#!/usr/bin/env node
/**
 * ERPNext API Test Script
 * Usage: node scripts/erpnext-api-test.js
 * 
 * This script will:
 * 1. Connect to your ERPNext instance
 * 2. Fetch Warehouse and Bin data
 * 3. Output current inventory structure
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

const ERPNEXT_URL = process.env.ERPNEXT_URL || 'https://your-company.erpnext.com';
const API_KEY = process.env.ERPNEXT_API_KEY || '';
const API_SECRET = process.env.ERPNEXT_API_SECRET || '';

// Parse URL
const url = new URL(ERPNEXT_URL);
const isHttps = url.protocol === 'https:';
const httpModule = isHttps ? https : http;

/**
 * Generic ERPNext API caller
 */
function callERPNextAPI(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      }
    };

    const req = httpModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}\nResponse: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

/**
 * Fetch all warehouses
 */
async function fetchWarehouses() {
  console.log('\n📦 Fetching Warehouses...\n');
  
  const response = await callERPNextAPI('/api/resource/Warehouse?fields=["name","warehouse_name","parent_warehouse","is_group","disabled"]&limit_page_length=500');
  
  const warehouses = response.data;
  console.log(`Found ${warehouses.length} warehouses:\n`);
  
  warehouses.forEach(wh => {
    const prefix = wh.is_group ? '📁' : '📍';
    const parent = wh.parent_warehouse ? ` (parent: ${wh.parent_warehouse})` : '';
    const status = wh.disabled ? ' [DISABLED]' : '';
    console.log(`${prefix} ${wh.name}${parent}${status}`);
  });
  
  return warehouses;
}

/**
 * Fetch bins (location-level tracking)
 */
async function fetchBins() {
  console.log('\n🗂️  Fetching Bins...\n');
  
  try {
    const response = await callERPNextAPI('/api/resource/Bin?fields=["name","item_code","warehouse","actual_qty"]&limit_page_length=1000');
    
    const bins = response.data;
    console.log(`Found ${bins.length} bins with inventory:\n`);
    
    // Group by warehouse
    const byWarehouse = {};
    bins.forEach(bin => {
      if (!byWarehouse[bin.warehouse]) {
        byWarehouse[bin.warehouse] = [];
      }
      byWarehouse[bin.warehouse].push(bin);
    });
    
    Object.keys(byWarehouse).forEach(warehouse => {
      console.log(`\n📦 ${warehouse} (${byWarehouse[warehouse].length} items)`);
      byWarehouse[warehouse].slice(0, 5).forEach(bin => {
        console.log(`   - ${bin.item_code}: ${bin.actual_qty} units`);
      });
      if (byWarehouse[warehouse].length > 5) {
        console.log(`   ... and ${byWarehouse[warehouse].length - 5} more items`);
      }
    });
    
    return bins;
  } catch (e) {
    console.log('⚠️  Bins may not be enabled or accessible');
    console.log(e.message);
    return [];
  }
}

/**
 * Check for custom fields on Stock Entry
 */
async function checkStockEntryCustomFields() {
  console.log('\n🔍 Checking Stock Entry custom fields...\n');
  
  try {
    const response = await callERPNextAPI('/api/resource/DocType/Stock Entry');
    const doctype = response.data;
    
    const customFields = doctype.fields.filter(f => f.fieldname.includes('idempotency') || f.fieldname.includes('external'));
    
    if (customFields.length > 0) {
      console.log('Found custom fields:');
      customFields.forEach(f => {
        console.log(`   ✓ ${f.fieldname} (${f.fieldtype})`);
      });
    } else {
      console.log('⚠️  No idempotency_key or external_ref fields found');
      console.log('   You may need to create these custom fields for offline sync');
    }
    
    return customFields;
  } catch (e) {
    console.log('❌ Could not check custom fields');
    console.log(e.message);
    return [];
  }
}

/**
 * Generate warehouse creation suggestions based on CSV
 */
function generateWarehouseSuggestions(existingWarehouses) {
  console.log('\n💡 Suggested Warehouse Structure (based on your CSV):\n');
  
  const csvStructure = [
    'Raw Material Warehouse (Parent)',
    '├── Section 1 (96 locations: A1-A16, B1-B12, AB13-AB16, C-F 1-16)',
    '├── Section 2 (18 locations: Rack 1-2)',
    '├── Section 3 (30 locations: Rack 1-4)',
    '├── Section 4 (28 locations: A-G 1-4)',
    '├── Section 5 (10 locations: A-E 1-2)',
    '└── Central Rack (15 locations: A-C 1-5)'
  ];
  
  console.log(csvStructure.join('\n'));
  console.log('\n📊 Total: ~197 locations across 6 sections');
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🔌 ERPNext API Connection Test');
  console.log('='.repeat(60));
  console.log(`\nConnecting to: ${ERPNEXT_URL}`);
  
  if (!API_KEY || !API_SECRET) {
    console.log('\n❌ ERROR: Missing API credentials');
    console.log('\nPlease create a .env file with:');
    console.log('ERPNEXT_URL=https://your-company.erpnext.com');
    console.log('ERPNEXT_API_KEY=your_key');
    console.log('ERPNEXT_API_SECRET=your_secret');
    process.exit(1);
  }
  
  try {
    const warehouses = await fetchWarehouses();
    const bins = await fetchBins();
    await checkStockEntryCustomFields();
    generateWarehouseSuggestions(warehouses);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ API Test Complete!');
    console.log('='.repeat(60));
    
    // Write results to file
    const fs = require('fs');
    const results = {
      timestamp: new Date().toISOString(),
      erpnext_url: ERPNEXT_URL,
      warehouses: warehouses,
      bins: bins.length,
      summary: {
        total_warehouses: warehouses.length,
        total_bins: bins.length,
        sections_found: warehouses.filter(w => w.name.toLowerCase().includes('section')).length
      }
    };
    
    fs.writeFileSync('docs/erpnext-structure.json', JSON.stringify(results, null, 2));
    console.log('\n📄 Results saved to: docs/erpnext-structure.json');
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.log('\nPlease check your ERPNext credentials and URL');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { callERPNextAPI, fetchWarehouses, fetchBins };




