#!/usr/bin/env node
/**
 * Generate ERPNext Warehouse Import CSV - PILOT ONLY
 * Excludes Section 4 (no labels printed yet)
 * Creates: CR, S1, S2, S3, S5 = 169 locations
 */

const fs = require('fs');
const path = require('path');

const warehouses = [];

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

console.log('📦 Generating PILOT warehouse structure (excluding Section 4)...\n');

// Add section warehouses as groups (excluding Section 4)
const pilotSections = [
  { name: 'Section 1 - GSS', parent: 'Raw Materials - GSS', count: 96 },
  { name: 'Section 2 - GSS', parent: 'Raw Materials - GSS', count: 18 },
  { name: 'Section 3 - GSS', parent: 'Raw Materials - GSS', count: 30 },
  { name: 'Section 5 - GSS', parent: 'Raw Materials - GSS', count: 10 },
  { name: 'Central Rack - GSS', parent: 'Raw Materials - GSS', count: 15 }
];

pilotSections.forEach(section => {
  addWarehouse(section.name, section.parent, 1);
  console.log(`✓ Added ${section.name} (${section.count} locations)`);
});

// Section 1 - 96 locations
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
    for (let i = config.start; i <= config.end; i++) {
      addWarehouse(`Section 1 - ${config.row}${i} - GSS`, 'Section 1 - GSS');
    }
  } else {
    for (let i = 1; i <= config.count; i++) {
      addWarehouse(`Section 1 - ${config.row}${i} - GSS`, 'Section 1 - GSS');
    }
  }
});

// Section 2 - 18 locations (2 racks)
['A', 'B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 3; i++) {
    addWarehouse(`Section 2 - Rack 1 - ${level}${i} - GSS`, 'Section 2 - GSS');
  }
});

addWarehouse(`Section 2 - Rack 2 - A1234 - GSS`, 'Section 2 - GSS');
['B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 4; i++) {
    addWarehouse(`Section 2 - Rack 2 - ${level}${i} - GSS`, 'Section 2 - GSS');
  }
});

// Section 3 - 30 locations (4 racks)
['A', 'B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 2; i++) {
    addWarehouse(`Section 3 - Rack 1 - ${level}${i} - GSS`, 'Section 3 - GSS');
  }
});

addWarehouse(`Section 3 - Rack 2 - A12 - GSS`, 'Section 3 - GSS');
['B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 2; i++) {
    addWarehouse(`Section 3 - Rack 2 - ${level}${i} - GSS`, 'Section 3 - GSS');
  }
});

addWarehouse(`Section 3 - Rack 3 - A123456 - GSS`, 'Section 3 - GSS');
['B', 'C', 'D', 'E'].forEach(level => {
  for (let i = 1; i <= 6; i++) {
    addWarehouse(`Section 3 - Rack 3 - ${level}${i} - GSS`, 'Section 3 - GSS');
  }
});

['A', 'B', 'C', 'D', 'E'].forEach(level => {
  addWarehouse(`Section 3 - Rack 4 - ${level}1 - GSS`, 'Section 3 - GSS');
});

// Section 5 - 10 locations (5x2 grid)
['A', 'B', 'C', 'D', 'E'].forEach(row => {
  for (let i = 1; i <= 2; i++) {
    addWarehouse(`Section 5 - ${row}${i} - GSS`, 'Section 5 - GSS');
  }
});

// Central Rack - 15 locations (3x5 grid)
['A', 'B', 'C'].forEach(level => {
  for (let i = 1; i <= 5; i++) {
    addWarehouse(`Central Rack - ${level}${i} - GSS`, 'Central Rack - GSS');
  }
});

console.log(`\n✅ Generated ${warehouses.length} total warehouse records (PILOT ONLY)`);
console.log(`   - 5 section groups (CR, S1, S2, S3, S5)`);
console.log(`   - 169 storage locations with printed labels`);
console.log(`   - ⚠️  Section 4 (28 locations) EXCLUDED - labels not printed yet\n`);

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

// Save pilot CSV
const csvPath = path.join(__dirname, '..', 'docs', 'erpnext-pilot-import.csv');
fs.writeFileSync(csvPath, csvContent);

console.log(`📄 PILOT CSV saved to: docs/erpnext-pilot-import.csv`);
console.log('\n📋 Import Instructions:');
console.log('   1. Log into ERPNext: https://globalspectrumsarl.frappe.cloud');
console.log('   2. Go to: Stock → Warehouse → Menu → Import');
console.log('   3. Upload: erpnext-pilot-import.csv');
console.log('   4. Review and Submit');
console.log('\n🎯 Pilot Rollout Order:');
console.log('   Phase 1A: Central Rack (15) + Section 5 (10) = 25 locations');
console.log('   Phase 1B: Section 1 (96) + Section 2 (18) + Section 3 (30) = 144 locations');
console.log('   Phase 2:  Section 4 (28) - After pilot success & label printing');

console.log('\n✅ Ready for pilot deployment!');




