#!/usr/bin/env node
/**
 * Check Existing Barcodes in ERPNext
 * Analyzes what location barcodes and item barcodes already exist
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

const ERPNEXT_URL = process.env.ERPNEXT_URL || 'https://globalspectrumsarl.frappe.cloud';
const API_KEY = process.env.ERPNEXT_API_KEY || '';
const API_SECRET = process.env.ERPNEXT_API_SECRET || '';

const url = new URL(ERPNEXT_URL);
const isHttps = url.protocol === 'https:';
const httpModule = isHttps ? https : http;

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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function checkItemBarcodes() {
  console.log('\n🏷️  Checking Item Barcodes...\n');
  
  try {
    // Get items with barcodes
    const response = await callERPNextAPI('/api/resource/Item?fields=["name","item_code","item_name","has_variants","barcode"]&limit_page_length=500');
    
    const items = response.data;
    const itemsWithBarcodes = items.filter(item => item.barcode);
    
    console.log(`📦 Total Items: ${items.length}`);
    console.log(`🏷️  Items with Barcodes: ${itemsWithBarcodes.length}\n`);
    
    if (itemsWithBarcodes.length > 0) {
      console.log('Sample items with barcodes:');
      itemsWithBarcodes.slice(0, 10).forEach(item => {
        console.log(`   ${item.item_code} → ${item.barcode}`);
      });
      
      if (itemsWithBarcodes.length > 10) {
        console.log(`   ... and ${itemsWithBarcodes.length - 10} more`);
      }
    }
    
    return itemsWithBarcodes;
  } catch (e) {
    console.log('❌ Error fetching item barcodes:', e.message);
    return [];
  }
}

async function checkWarehouseBarcodes() {
  console.log('\n\n📍 Checking Warehouse/Location Codes...\n');
  
  try {
    const response = await callERPNextAPI('/api/resource/Warehouse?fields=["name","warehouse_name","parent_warehouse","warehouse_type","disabled"]&limit_page_length=500');
    
    const warehouses = response.data;
    console.log(`Found ${warehouses.length} warehouses\n`);
    
    // Check for location-style naming (S1-A1, S2-R1-A1, CR-A1)
    const locationPattern = /S\d|CR-|RACK|SECTION/i;
    const locationWarehouses = warehouses.filter(wh => locationPattern.test(wh.name));
    
    console.log(`📊 Analysis:`);
    console.log(`   Total Warehouses: ${warehouses.length}`);
    console.log(`   Location-style names: ${locationWarehouses.length}`);
    
    if (locationWarehouses.length > 0) {
      console.log('\n✅ Found location warehouses:');
      locationWarehouses.slice(0, 20).forEach(wh => {
        const parent = wh.parent_warehouse ? ` (under ${wh.parent_warehouse})` : '';
        console.log(`   📍 ${wh.name}${parent}`);
      });
      
      if (locationWarehouses.length > 20) {
        console.log(`   ... and ${locationWarehouses.length - 20} more`);
      }
    } else {
      console.log('\n⚠️  No location-style warehouses found yet');
      console.log('   This is expected if you haven\'t imported the CSV yet');
    }
    
    return { all: warehouses, locations: locationWarehouses };
  } catch (e) {
    console.log('❌ Error fetching warehouses:', e.message);
    return { all: [], locations: [] };
  }
}

async function checkBinData() {
  console.log('\n\n🗂️  Checking Bin/Location Data...\n');
  
  try {
    // Check if any custom fields exist for location tracking
    const response = await callERPNextAPI('/api/resource/Bin?fields=["name","item_code","warehouse","actual_qty"]&limit_page_length=100');
    
    const bins = response.data;
    console.log(`Found ${bins.length} bins with inventory`);
    
    // Group by warehouse to see distribution
    const byWarehouse = {};
    bins.forEach(bin => {
      if (!byWarehouse[bin.warehouse]) {
        byWarehouse[bin.warehouse] = { count: 0, totalQty: 0 };
      }
      byWarehouse[bin.warehouse].count++;
      byWarehouse[bin.warehouse].totalQty += parseFloat(bin.actual_qty || 0);
    });
    
    console.log('\n📊 Inventory Distribution:');
    Object.keys(byWarehouse).sort((a, b) => byWarehouse[b].count - byWarehouse[a].count).forEach(wh => {
      console.log(`   ${wh}: ${byWarehouse[wh].count} items, ${byWarehouse[wh].totalQty.toFixed(2)} total units`);
    });
    
    return bins;
  } catch (e) {
    console.log('⚠️  Could not fetch bin data:', e.message);
    return [];
  }
}

async function checkItemBarcodeDoctype() {
  console.log('\n\n🔍 Checking Item Barcode Child Table...\n');
  
  try {
    // ERPNext has a separate Item Barcode doctype for multiple barcodes per item
    const response = await callERPNextAPI('/api/resource/Item Barcode?fields=["name","barcode","parent","barcode_type"]&limit_page_length=500');
    
    const barcodes = response.data;
    console.log(`✅ Found ${barcodes.length} item barcodes in Item Barcode table\n`);
    
    if (barcodes.length > 0) {
      console.log('Sample barcodes:');
      
      // Group by barcode type
      const byType = {};
      barcodes.forEach(bc => {
        const type = bc.barcode_type || 'Unknown';
        if (!byType[type]) byType[type] = [];
        byType[type].push(bc);
      });
      
      Object.keys(byType).forEach(type => {
        console.log(`\n   ${type}: ${byType[type].length} barcodes`);
        byType[type].slice(0, 5).forEach(bc => {
          console.log(`      ${bc.barcode} (${bc.parent})`);
        });
        if (byType[type].length > 5) {
          console.log(`      ... and ${byType[type].length - 5} more`);
        }
      });
    }
    
    return barcodes;
  } catch (e) {
    console.log('⚠️  Could not fetch Item Barcode data:', e.message);
    console.log('   This is normal if no barcodes have been created yet');
    return [];
  }
}

async function generateReport() {
  const fs = require('fs');
  
  console.log('='.repeat(70));
  console.log('🔍 ERPNext Barcode & Location Analysis');
  console.log('='.repeat(70));
  console.log(`\nConnecting to: ${ERPNEXT_URL}\n`);
  
  if (!API_KEY || !API_SECRET) {
    console.log('❌ ERROR: Missing API credentials');
    process.exit(1);
  }
  
  try {
    const itemBarcodes = await checkItemBarcodes();
    const itemBarcodeTable = await checkItemBarcodeDoctype();
    const warehouses = await checkWarehouseBarcodes();
    const bins = await checkBinData();
    
    // Generate summary report
    const report = {
      timestamp: new Date().toISOString(),
      erpnext_url: ERPNEXT_URL,
      summary: {
        total_items_with_barcodes: itemBarcodes.length,
        total_barcode_entries: itemBarcodeTable.length,
        total_warehouses: warehouses.all.length,
        location_warehouses: warehouses.locations.length,
        bins_with_inventory: bins.length,
        needs_location_import: warehouses.locations.length === 0
      },
      item_barcodes: itemBarcodes.slice(0, 50),
      barcode_entries: itemBarcodeTable.slice(0, 50),
      warehouses: warehouses.all,
      location_warehouses: warehouses.locations,
      recommendations: []
    };
    
    // Generate recommendations
    console.log('\n\n' + '='.repeat(70));
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(70) + '\n');
    
    if (warehouses.locations.length === 0) {
      console.log('1. ⚠️  IMPORT LOCATION WAREHOUSES');
      console.log('   → Run: Import docs/erpnext-warehouse-import.csv');
      console.log('   → This will create 197 location codes (S1-A1, S2-R1-A1, etc.)');
      report.recommendations.push('Import warehouse locations from CSV');
    } else {
      console.log('1. ✅ Location warehouses exist!');
      console.log(`   → Found ${warehouses.locations.length} location-style warehouses`);
    }
    
    if (itemBarcodes.length > 0 || itemBarcodeTable.length > 0) {
      console.log('\n2. ✅ Item barcodes already exist in ERPNext!');
      console.log(`   → ${itemBarcodes.length} items with barcodes`);
      console.log(`   → ${itemBarcodeTable.length} barcode entries`);
      console.log('   → Your scanning app can use these directly!');
      report.recommendations.push('Use existing item barcodes for scanning');
    } else {
      console.log('\n2. ⚠️  No item barcodes found');
      console.log('   → You may need to add barcodes to your items');
      console.log('   → Or items may use item_code for scanning');
      report.recommendations.push('Add barcodes to items or use item_code');
    }
    
    if (bins.length > 0) {
      console.log('\n3. ✅ Inventory data exists!');
      console.log(`   → ${bins.length} bins with stock`);
      console.log('   → Ready for location-based scanning workflow');
    }
    
    console.log('\n4. 📱 NEXT STEPS FOR PWA:');
    console.log('   → Location barcodes: Use warehouse names (e.g., "Section 1 - A1 - GSS")');
    console.log('   → Item barcodes: Use existing barcodes from Item Barcode table');
    console.log('   → Scan flow: Location → Item → Qty → Create Stock Entry');
    
    // Save report
    fs.writeFileSync('docs/barcode-analysis.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Full report saved to: docs/barcode-analysis.json');
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Analysis Complete!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  generateReport();
}




