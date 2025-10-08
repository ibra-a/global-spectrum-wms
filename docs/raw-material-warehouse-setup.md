# Raw Materials Warehouse - Location Setup

## Overview
This document details the physical location structure for the **Raw Materials - GSS** warehouse.

**Total Locations:** 197 storage positions across 6 main areas
**System of Record:** ERPNext (globalspectrumsarl.frappe.cloud)
**Current Status:** 393 items stored without location-level tracking

---

## Location Hierarchy

### Structure Approach: **Hybrid (Sub-Warehouses + Bins)**

```
Raw Materials - GSS (Parent Warehouse)
├── Section 1 - GSS (Sub-Warehouse) - 96 locations
├── Section 2 - GSS (Sub-Warehouse) - 18 locations  
├── Section 3 - GSS (Sub-Warehouse) - 30 locations
├── Section 4 - GSS (Sub-Warehouse) - 28 locations
├── Section 5 - GSS (Sub-Warehouse) - 10 locations
└── Central Rack - GSS (Sub-Warehouse) - 15 locations
```

---

## Detailed Location Breakdown

### **Section 1 - GSS** (96 locations)

**Physical Layout:** Open shelving with labeled positions

| Row | Positions | Barcode Format | ERPNext Location |
|-----|-----------|----------------|------------------|
| A   | A1-A16    | S1-A1 to S1-A16 | Section 1 - GSS → Bin: S1-A1 |
| B   | B1-B12    | S1-B1 to S1-B12 | Section 1 - GSS → Bin: S1-B1 |
| AB  | AB13-AB16 | S1-AB13 to S1-AB16 | Section 1 - GSS → Bin: S1-AB13 |
| C   | C1-C16    | S1-C1 to S1-C16 | Section 1 - GSS → Bin: S1-C1 |
| D   | D1-D16    | S1-D1 to S1-D16 | Section 1 - GSS → Bin: S1-D1 |
| E   | E1-E16    | S1-E1 to S1-E16 | Section 1 - GSS → Bin: S1-E1 |
| F   | F1-F16    | S1-F1 to S1-F16 | Section 1 - GSS → Bin: S1-F1 |

**Total:** 96 positions

---

### **Section 2 - GSS** (18 locations)

**Physical Layout:** Industrial racking system with 2 racks

#### Rack 1 (9 positions)
| Level | Positions | Barcode Format | ERPNext Location |
|-------|-----------|----------------|------------------|
| A     | A1-A3     | S2-R1-A1, S2-R1-A2, S2-R1-A3 | Section 2 - GSS → Bin: S2-R1-A1 |
| B     | B1-B3     | S2-R1-B1 to S2-R1-B3 | Section 2 - GSS → Bin: S2-R1-B1 |
| C     | C1-C3     | S2-R1-C1 to S2-R1-C3 | Section 2 - GSS → Bin: S2-R1-C1 |
| D     | D1-D3     | S2-R1-D1 to S2-R1-D3 | Section 2 - GSS → Bin: S2-R1-D1 |
| E     | E1-E3     | S2-R1-E1 to S2-R1-E3 | Section 2 - GSS → Bin: S2-R1-E1 |

#### Rack 2 (9 positions)
| Level | Positions | Barcode Format | Notes |
|-------|-----------|----------------|-------|
| A     | A1234     | S2-R2-A1234 | Combined large position |
| B     | B1-B4     | S2-R2-B1 to S2-R2-B4 | 4 standard positions |
| C     | C1-C4     | S2-R2-C1 to S2-R2-C4 | 4 standard positions |
| D     | D1-D4     | S2-R2-D1 to S2-R2-D4 | 4 standard positions |
| E     | E1-E4     | S2-R2-E1 to S2-R2-E4 | 4 standard positions |

**Total:** 18 positions (Rack 1: 9, Rack 2: 9)

---

### **Section 3 - GSS** (30 locations)

**Physical Layout:** Heavy-duty racking with 4 racks

#### Rack 1 (10 positions)
- Levels: A, B, C, D, E (2 positions each)
- Barcode: S3-R1-A1, S3-R1-A2, etc.

#### Rack 2 (10 positions)  
- Levels: A (combined A12), B-E (2 positions each)
- Barcode: S3-R2-A12, S3-R2-B1, S3-R2-B2, etc.

#### Rack 3 (18 positions)
- Level A: S3-R3-A123456 (combined)
- Levels B-E: 6 positions each
- Barcode: S3-R3-B1 to S3-R3-B6, etc.

#### Rack 4 (5 positions)
- Levels: A, B, C, D, E (1 position each)
- Barcode: S3-R4-A1, S3-R4-B1, etc.

**Total:** 30 positions (varies by rack capacity)

---

### **Section 4 - GSS** (28 locations)

**Physical Layout:** Open floor storage with grid system

| Row | Positions | Barcode Format |
|-----|-----------|----------------|
| A   | A1-A4     | S4-A1 to S4-A4 |
| B   | B1-B4     | S4-B1 to S4-B4 |
| C   | C1-C4     | S4-C1 to S4-C4 |
| D   | D1-D4     | S4-D1 to S4-D4 |
| E   | E1-E4     | S4-E1 to S4-E4 |
| F   | F1-F4     | S4-F1 to S4-F4 |
| G   | G1-G4     | S4-G1 to S4-G4 |

**Total:** 28 positions (7 rows × 4 columns)

---

### **Section 5 - GSS** (10 locations)

**Physical Layout:** Compact shelving unit

| Row | Positions | Barcode Format |
|-----|-----------|----------------|
| A   | A1-A2     | S5-A1, S5-A2   |
| B   | B1-B2     | S5-B1, S5-B2   |
| C   | C1-C2     | S5-C1, S5-C2   |
| D   | D1-D2     | S5-D1, S5-D2   |
| E   | E1-E2     | S5-E1, S5-E2   |

**Total:** 10 positions (5 rows × 2 columns)

---

### **Central Rack - GSS** (15 locations)

**Physical Layout:** High-traffic central access point

| Level | Positions | Barcode Format |
|-------|-----------|----------------|
| A     | A1-A5     | CR-A1 to CR-A5 |
| B     | B1-B5     | CR-B1 to CR-B5 |
| C     | C1-C5     | CR-C1 to CR-C5 |

**Total:** 15 positions (3 levels × 5 positions)

---

## ERPNext Implementation Strategy

### Phase 1: Create Sub-Warehouses (Week 1)

**Manual Creation in ERPNext:**
1. Go to: **Stock → Warehouse → New Warehouse**
2. Create 6 sub-warehouses under "Raw Materials - GSS":
   - Section 1 - GSS
   - Section 2 - GSS
   - Section 3 - GSS
   - Section 4 - GSS
   - Section 5 - GSS
   - Central Rack - GSS

### Phase 2: Bulk Import Bins (Week 1)

**Use CSV Import** (see `erpnext-warehouse-import.csv`)
- 197 locations created as bins or additional sub-warehouses

### Phase 3: Label Printing & Rollout (Weeks 2-4)

**Priority Order:**
1. **Central Rack** (15 labels) - High traffic, pilot area
2. **Section 1** (96 labels) - Largest area
3. **Sections 2-5** (86 labels) - Complete rollout

---

## Barcode Standards

### Format Convention
- **Simple Sections:** `S[Section]-[Row][Position]`
  - Example: `S1-A1`, `S4-G4`, `S5-E2`
  
- **Racked Sections:** `S[Section]-R[Rack]-[Level][Position]`
  - Example: `S2-R1-A1`, `S3-R4-B1`
  
- **Central Rack:** `CR-[Level][Position]`
  - Example: `CR-A1`, `CR-C5`

### Label Specifications
- **Size:** 4" × 2" (101.6mm × 50.8mm)
- **Printer:** Zebra ZD220t (203 DPI)
- **Format:** ZPL II
- **Barcode Type:** Code128
- **Quiet Zone:** 3-5mm

---

## Migration Considerations

### Current State
- ✅ 393 items currently in "Raw Materials - GSS"
- ❌ No location-level tracking
- ❌ No barcode system

### Migration Path
1. **Create location structure** (this document)
2. **Label all locations** (Phase 1: CR + S1)
3. **Pilot with new inbound receipts** (scan to location on arrival)
4. **Cycle count existing inventory** (move to locations gradually)
5. **Full cutover** (all movements require location scan)

### Risk Mitigation
- **Dual system period:** Allow non-scanned movements during transition
- **Training:** 2-hour sessions per user group
- **Support:** On-floor assistance during Week 1

---

## Next Steps

1. ✅ **Review this structure** - Confirm locations match physical layout
2. 📋 **Generate import files** - CSV ready for ERPNext bulk import
3. 🏗️ **Create warehouses** - Set up 6 sub-warehouses in ERPNext
4. 🏷️ **Print labels** - Start with Central Rack (15 labels)
5. 📱 **Configure PWA** - Location scanning workflow
6. 🧪 **Pilot test** - Central Rack + Section 1 rollout

---

*Last Updated: October 6, 2025*
*System: ERPNext v15 (Frappe Cloud)*
*Status: Planning Phase*




