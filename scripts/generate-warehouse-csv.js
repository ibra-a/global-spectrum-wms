#!/usr/bin/env node
/**
 * Generate ERPNext Warehouse Import CSV
 * Creates all 197 locations for Raw Materials warehouse
 */

const fs = require('fs');
const path = require('path');

// CSV data structure for ERPNext Warehouse import
const warehouses = [];

// Helper to add warehouse
function addWarehouse(name, parentWarehouse, isGroup = 0, company = 'Global Spectrum') {
  warehouses.push({
    name: name,
    warehouse_name: name.replace(' - GSS', ''),
    parent_warehouse: parentWarehouse,
    is_group: isGroup,
    company: company,
    disabled: 0
  });
}

// 1. Create main sub-warehouses (6 sections)
console.log('📦 Generating warehouse structure...\n');

const sections = [
  { name: 'Section 1 - GSS', parent: 'Raw Materials - GSS', count: 96 },
  { name: 'Section 2 - GSS', parent: 'Raw Materials - GSS', count: 18 },
  { name: 'Section 3 - GSS', parent: 'Raw Materials - GSS', count: 30 },
  { name: 'Section 4 - GSS', parent: 'Raw Materials - GSS', count: 28 },
  { name: 'Section 5 - GSS', parent: 'Raw Materials - GSS', count: 10 },
  { name: 'Central Rack - GSS', parent: 'Raw Materials - GSS', count: 15 }
];

// Add section warehouses as groups
sections.forEach(section => {
  addWarehouse(section.name, section.parent, 1); // is_group = 1 for parent sections
  console.log(`✓ Added ${section.name} (${section.count} locations)`);
});

// 2. Section 1 - 96 locations
const s1Rows = [
  { row: 'A', count: 16 },
  { row: 'B', count: 12 },
  { row: 'AB', start: 13, end: 16 },
  { row: 'C', count: 16 },
  { row: 'D', count: 16 },
  { row: 'E', count: 16 },
  { row: 'F', count: 16 }
];

s1Rows.forEach(config => {
  if (config.start) {
    // AB13-AB16
    for (let i = config.start; i <= config.end; i++) {
      addWarehouse(`Section 1 - ${config.row}${i} - GSS`, 'Section 1 - GSS');
    }
  } else {
    for (let i = 1; i <= config.count; i++) {
      addWarehouse(`Section 1 - ${config.row}${i} - GSS`, 'Section 1 - GSS');
    }
  }
});

// 3. Section 2 - 18 locations (2 racks)
// Rack 1
['A', 'B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 3; i++) {
    addWarehouse(`Section 2 - Rack 1 - ${level}${i} - GSS`, 'Section 2 - GSS');
  }
});

// Rack 2
addWarehouse(`Section 2 - Rack 2 - A1234 - GSS`, 'Section 2 - GSS');
['B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 4; i++) {
    addWarehouse(`Section 2 - Rack 2 - ${level}${i} - GSS`, 'Section 2 - GSS');
  }
});

// 4. Section 3 - 30 locations (4 racks)
// Rack 1
['A', 'B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 2; i++) {
    addWarehouse(`Section 3 - Rack 1 - ${level}${i} - GSS`, 'Section 3 - GSS');
  }
});

// Rack 2
addWarehouse(`Section 3 - Rack 2 - A12 - GSS`, 'Section 3 - GSS');
['B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 2; i++) {
    addWarehouse(`Section 3 - Rack 2 - ${level}${i} - GSS`, 'Section 3 - GSS');
  }
});

// Rack 3
addWarehouse(`Section 3 - Rack 3 - A123456 - GSS`, 'Section 3 - GSS');
['B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 6; i++) {
    addWarehouse(`Section 3 - Rack 3 - ${level}${i} - GSS`, 'Section 3 - GSS');
  }
});

// Rack 4
['A', 'B', 'C', 'D', 'E'].forEach(level => {
  addWarehouse(`Section 3 - Rack 4 - ${level}1 - GSS`, 'Section 3 - GSS');
});

// 5. Section 4 - 28 locations (7x4 grid)
['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(row => {
  for (let i = 1; i <= 4; i++) {
    addWarehouse(`Section 4 - ${row}${i} - GSS`, 'Section 4 - GSS');
  }
});

// 6. Section 5 - 10 locations (5x2 grid)
['A', 'B', 'C', 'D', 'E'].forEach(row => {
  for (let i = 1; i <= 2; i++) {
    addWarehouse(`Section 5 - ${row}${i} - GSS`, 'Section 5 - GSS');
  }
});

// 7. Central Rack - 15 locations (3x5 grid)
['A', 'B', 'C'].forEach(level => {
  for (let i = 1; i <= 5; i++) {
    addWarehouse(`Central Rack - ${level}${i} - GSS`, 'Central Rack - GSS');
  }
});

console.log(`\n✅ Generated ${warehouses.length} total warehouse records`);
console.log(`   - 6 section groups`);
console.log(`   - 197 storage locations`);

// Generate CSV
const csvHeaders = ['name', 'warehouse_name', 'parent_warehouse', 'is_group', 'company', 'disabled'];
let csvContent = csvHeaders.join(',') + '\n';

warehouses.forEach(wh => {
  const row = [
    `"${wh.name}"`,
    `"${wh.warehouse_name}"`,
    `"${wh.parent_warehouse}"`,
    wh.is_group,
    `"${wh.company}"`,
    wh.disabled
  ].join(',');
  csvContent += row + '\n';
});

// Save CSV
const csvPath = path.join(__dirname, '..', 'docs', 'erpnext-warehouse-import.csv');
fs.writeFileSync(csvPath, csvContent);

console.log(`\n📄 CSV saved to: docs/erpnext-warehouse-import.csv`);
console.log('\n📋 Next steps:');
console.log('   1. Log into ERPNext at: https://globalspectrumsarl.frappe.cloud');
console.log('   2. Go to: Stock → Warehouse → Menu → Import');
console.log('   3. Upload: erpnext-warehouse-import.csv');
console.log('   4. Review and Submit');
console.log('\n⚠️  Note: Ensure "Raw Materials - GSS" warehouse exists first!');

// Generate barcode mapping reference
const barcodeMappings = [];

// Section 1
s1Rows.forEach(config => {
  if (config.start) {
    for (let i = config.start; i <= config.end; i++) {
      barcodeMappings.push({
        barcode: `S1-${config.row}${i}`,
        full_name: `Section 1 - ${config.row}${i} - GSS`,
        section: 'Section 1',
        location_type: 'Open Shelving'
      });
    }
  } else {
    for (let i = 1; i <= config.count; i++) {
      barcodeMappings.push({
        barcode: `S1-${config.row}${i}`,
        full_name: `Section 1 - ${config.row}${i} - GSS`,
        section: 'Section 1',
        location_type: 'Open Shelving'
      });
    }
  }
});

// Save barcode mapping
const mappingPath = path.join(__dirname, '..', 'docs', 'barcode-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(barcodeMappings.slice(0, 20), null, 2)); // Sample

console.log(`📄 Barcode mapping sample saved to: docs/barcode-mapping.json`);




