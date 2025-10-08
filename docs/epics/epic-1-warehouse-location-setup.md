# Epic 1: Warehouse Location Setup - Brownfield Enhancement

**Status:** Ready for Development  
**Priority:** P0 - Blocker (All other epics depend on this)  
**Estimated Effort:** 1-2 days  
**Phase:** Phase 1A - Foundation

---

## Epic Goal

Establish the complete warehouse location structure in ERPNext to enable location-based inventory tracking for 169 pilot locations across 5 sections (Central Rack, Section 1, 2, 3, 5).

---

## Epic Description

### Existing System Context

**Current State:**
- ERPNext v15 running on Frappe Cloud (https://globalspectrumsarl.frappe.cloud)
- 393+ items stored in "Raw Materials - GSS" warehouse
- NO location-level tracking (all items at warehouse level only)
- No barcode system in place
- Manual inventory processes

**Technology Stack:**
- ERPNext v15 (Frappe Cloud)
- MariaDB (managed by Frappe)
- REST API authentication via API key/secret
- Existing warehouse hierarchy: All Warehouses → Raw Materials, Finished Goods, etc.

**Integration Points:**
- ERPNext Warehouse DocType
- ERPNext Stock Entry DocType (will use locations in future stories)
- ERPNext Bin tracking (optional, for location-level stock)

### Enhancement Details

**What's Being Added:**
1. **6 section group warehouses** under Raw Materials - GSS:
   - Section 1 - GSS (parent for 96 locations)
   - Section 2 - GSS (parent for 18 locations)
   - Section 3 - GSS (parent for 30 locations)
   - Section 5 - GSS (parent for 10 locations)
   - Central Rack - GSS (parent for 15 locations)
   - *(Section 4 excluded - labels not printed yet)*

2. **169 physical storage location warehouses**:
   - Central Rack: CR-A1 to CR-C5 (15 locations)
   - Section 1: S1-A1 to S1-F16 (96 locations)
   - Section 2: S2-R1-A1 to S2-R2-E4 (18 locations)
   - Section 3: S3-R1-A1 to S3-R4-E1 (30 locations)
   - Section 5: S5-A1 to S5-E2 (10 locations)

3. **Custom fields for future sync** (optional for this epic):
   - Stock Entry.idempotency_key (prevents duplicate entries)
   - Pick List.external_ref (links PWA sessions)

**How It Integrates:**
- Uses ERPNext's native Warehouse hierarchy (parent/child relationships)
- Warehouse names match physical barcode labels already printed
- Enables future Stock Entry operations to specify exact locations
- Prepares for location-based Pick Lists and cycle counts

**Success Criteria:**
- ✅ All 174 warehouses imported (5 groups + 169 locations)
- ✅ Warehouse hierarchy visible in ERPNext tree view
- ✅ Can create test Stock Entry with location selection
- ✅ Location codes match physical labels (S1-A1, CR-B3, etc.)
- ✅ No disruption to existing 393 items in Raw Materials

---

## Stories

### Story 1: Import Section Groups
**Goal:** Create the 5 parent section warehouses

**Tasks:**
- Run CSV import for section groups (erpnext-step1-sections.csv)
- Verify parent warehouse "Raw Materials - GSS" exists
- Confirm all 5 sections created with is_group=1
- Validate hierarchy: All Warehouses → Raw Materials → Sections

**Acceptance Criteria:**
- 5 section warehouses visible under Raw Materials - GSS
- Each section marked as Group (folder icon)
- Can expand sections (no child locations yet)

**Estimated:** 30 minutes

---

### Story 2: Import Physical Locations
**Goal:** Create all 169 storage location warehouses

**Tasks:**
- Run CSV import for locations (erpnext-step2-locations.csv)
- Verify each location has correct parent section
- Spot-check location names match barcode format
- Test warehouse selection in Stock Entry form

**Acceptance Criteria:**
- 169 location warehouses created successfully
- Locations appear under correct section parents
- Can select locations in Stock Entry source/target warehouse dropdowns
- Warehouse list shows 213 total warehouses (6 base + 5 groups + 169 locations + existing)

**Estimated:** 1 hour (including verification)

---

### Story 3: Validation & Documentation
**Goal:** Verify setup and document for operations team

**Tasks:**
- Create test Stock Entry using new locations
- Verify warehouse tree structure is correct
- Document location naming conventions
- Create quick reference card for warehouse staff
- Add custom fields guide to documentation (optional)

**Acceptance Criteria:**
- Can successfully create Stock Entry moving item between two locations
- Warehouse structure matches physical layout documentation
- Quick reference created showing barcode→warehouse name mapping
- No errors or warnings in ERPNext logs

**Estimated:** 1 hour

---

## Compatibility Requirements

- ✅ **Existing APIs remain unchanged** - Standard ERPNext Warehouse API
- ✅ **Database schema changes backward compatible** - Using native Warehouse doctype
- ✅ **UI changes follow existing patterns** - Standard ERPNext warehouse tree view
- ✅ **Performance impact minimal** - 200 warehouses is well within ERPNext capacity
- ✅ **Existing 393 items unaffected** - Still in "Raw Materials - GSS" until moved

---

## Risk Mitigation

### Primary Risk
**Incorrect warehouse hierarchy** - If parent/child relationships are wrong, locations may not be usable in Stock Entries

**Mitigation:**
- CSV files pre-generated and validated
- Two-step import (groups first, then children)
- Test with small subset before full import
- Verification checklist in Story 3

### Secondary Risk
**Name collisions** - Warehouse names might conflict with existing data

**Mitigation:**
- All new warehouses have " - GSS" suffix
- Section names are unique (Section 1, Section 2, etc.)
- Import process will show errors for duplicates

### Rollback Plan
If import fails or creates issues:
1. Delete child location warehouses first (no stock, safe to delete)
2. Delete section group warehouses
3. Re-run import with corrected CSV
4. ERPNext allows warehouse deletion if no stock transactions exist

---

## Definition of Done

- ✅ All 5 section groups created in ERPNext
- ✅ All 169 location warehouses created
- ✅ Warehouse hierarchy matches physical layout
- ✅ Can create Stock Entry with location selection
- ✅ Location names match printed barcode labels
- ✅ Existing functionality unaffected (393 items still accessible)
- ✅ Documentation complete (quick reference, custom fields guide)
- ✅ No errors in ERPNext system logs
- ✅ Warehouse tree loads in <2 seconds (performance check)

---

## Dependencies

### Blocks These Epics:
- Epic 2: Scanning PWA Core (needs locations to scan)
- Epic 3: Inbound Receipt Workflow (needs locations for putaway)
- Epic 4: Outbound Pick Workflow (needs locations for picking)
- Epic 5: Transfer Workflow (needs source/dest locations)
- Epic 6: Offline Sync (needs locations for stock movements)

### Depends On:
- ✅ ERPNext access with API credentials (COMPLETE)
- ✅ Physical barcode labels printed (COMPLETE for 169 locations)
- ✅ CSV import files generated (COMPLETE)

---

## Technical Notes

### Import Files
- `docs/erpnext-step1-sections.csv` - 5 section groups
- `docs/erpnext-step2-locations.csv` - 169 locations
- `docs/erpnext-pilot-import-fixed.csv` - Full file (all-in-one, if needed)

### Warehouse Naming Convention
- **Groups:** `Section {N} - GSS` or `Central Rack - GSS`
- **Locations:** `Section {N} - {Row}{Position} - GSS` (e.g., Section 1 - A1 - GSS)
- **Rack Sections:** `Section {N} - Rack {R} - {Level}{Position} - GSS`

### ERPNext Configuration
- **Parent Warehouse:** Raw Materials - GSS
- **Company:** Global Spectrum SARL
- **Is Group:** 1 for sections, 0 for locations
- **Disabled:** 0 (all active)

---

## Next Epic
**Epic 2: Scanning PWA - Core Workflows** (Authentication, Barcode Input, Basic UI)

---

*Created: October 6, 2025*  
*Product Owner: Sarah*  
*Status: Ready for Story Development*




