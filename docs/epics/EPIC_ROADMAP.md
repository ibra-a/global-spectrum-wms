# WMS Epic Roadmap - Global Spectrum

**Project:** Barcode Warehouse Management System  
**System of Record:** ERPNext v15 (Frappe Cloud)  
**Approach:** Phased rollout with pilot validation

---

## Epic Overview

| # | Epic Name | Priority | Est. Effort | Phase | Status |
|---|-----------|----------|-------------|-------|--------|
| 1 | Warehouse Location Setup | P0 | 1-2 days | 1A | ✅ Ready |
| 2 | Scanning PWA - Core Workflows | P0 | 1-2 weeks | 1A | Planned |
| 3 | Inbound Receipt Workflow | P1 | 1 week | 1A-1B | Planned |
| 4 | Outbound Pick Workflow | P1 | 1 week | 1B | Planned |
| 5 | Transfer Workflow | P2 | 3-5 days | 1B | Planned |
| 6 | Offline Sync & Idempotency | P1 | 1 week | 1B-2 | Planned |
| 7 | Print Service Integration | P3 | 1 week | 2 | Future |

**Total Estimated Effort:** 6-8 weeks for MVP (Epics 1-6)

---

## Epic 1: Warehouse Location Setup ✅

**Status:** COMPLETE  
**Goal:** Import 169 pilot warehouse locations into ERPNext

### Key Deliverables
- ✅ 5 section groups created
- ✅ 169 storage locations imported
- ✅ Warehouse hierarchy established
- ✅ Documentation and guides

### Stories (3)
1. Import Section Groups
2. Import Physical Locations  
3. Validation & Documentation

**Dependencies:** None (foundation epic)  
**Blocks:** All other epics

---

## Epic 2: Scanning PWA - Core Workflows

**Goal:** Build the Progressive Web App with core scanning functionality

### Scope
- User authentication with ERPNext
- Responsive mobile-first UI
- Barcode scanning (camera + manual input)
- Location and item selection
- Basic navigation and layout
- Role-based access (Picker, Supervisor, Admin)

### Key Features
1. **Authentication**
   - Login with ERPNext credentials
   - Session management
   - API key storage (secure)

2. **Barcode Input**
   - Camera-based scanning (HTML5 media)
   - Manual text input fallback
   - QR code support
   - Scan feedback (beep/vibrate)

3. **Core UI Components**
   - Navigation bar
   - Scan input component
   - Location/Item selection
   - Quantity entry
   - Action buttons

4. **ERPNext Integration**
   - API client library
   - Warehouse list fetching
   - Item search/lookup
   - Stock Entry creation (basic)

### Tech Stack
- **Frontend:** React + Next.js (PWA mode)
- **State:** React Context or Zustand
- **API:** Fetch/Axios for ERPNext REST
- **Scanning:** html5-qrcode library
- **Styling:** Tailwind CSS
- **Deployment:** Vercel/Netlify or self-hosted

### Stories (8-10)
1. Project setup & PWA configuration
2. ERPNext API client library
3. Authentication & session management
4. Barcode scanner component
5. Location selection UI
6. Item search & selection
7. Quantity input component
8. Navigation & layout
9. Error handling & feedback
10. Role-based access control

**Dependencies:** Epic 1 (needs warehouses)  
**Blocks:** Epics 3-6 (workflows need UI)

**Estimated:** 1-2 weeks

---

## Epic 3: Inbound Receipt Workflow

**Goal:** Enable scanning items into specific locations during receipt

### Scope
- Load Purchase Order
- Scan incoming items
- Select storage location
- Create Stock Entry (Material Receipt)
- Confirm putaway

### User Flow
```
1. Scan/Select PO
2. View expected items
3. For each item:
   a. Scan item barcode → b. Scan location → c. Enter qty
4. Review & confirm
5. Create Stock Entry in ERPNext
6. Success confirmation
```

### Features
1. **PO Selection**
   - List open POs
   - Search by PO number
   - View PO details & items

2. **Item Scanning**
   - Scan item code
   - Verify against PO
   - Show item details (name, UOM)
   - Handle over-receipt warnings

3. **Location Assignment**
   - Scan location barcode
   - Validate location exists
   - Suggest based on item type (optional)
   - Allow multi-location split

4. **Stock Entry Creation**
   - Build Stock Entry payload
   - Set purpose: Material Receipt
   - Include PO reference
   - API call to ERPNext
   - Handle success/errors

### Stories (6-8)
1. PO list & selection
2. PO line item display
3. Item scanning & validation
4. Location scan & validation
5. Quantity entry with UOM
6. Stock Entry API integration
7. Review & confirmation screen
8. Error handling & retry

**Dependencies:** Epics 1, 2  
**Estimated:** 1 week

---

## Epic 4: Outbound Pick Workflow

**Goal:** Enable guided picking with location-based pick lists

### Scope
- Load Pick List from ERPNext
- Guided picking (show location)
- Scan confirmation
- Create Stock Entry (Material Issue)
- Mark Pick List as completed

### User Flow
```
1. Load Pick List
2. View items to pick
3. For each item:
   a. Go to location (guided)
   b. Scan location (verify)
   c. Scan item (verify)
   d. Enter qty picked
4. Review picks
5. Create Stock Entry (Issue)
6. Mark Pick List complete
```

### Features
1. **Pick List Loading**
   - List open Pick Lists
   - Filter by Sales Order
   - Show priority

2. **Guided Picking**
   - Sort by location (optimize route)
   - Show location on map (optional)
   - Highlight current pick
   - Progress indicator

3. **Scan Confirmation**
   - Verify location matches
   - Verify item matches
   - Handle partial picks
   - Handle substitutions (with approval)

4. **Stock Issue**
   - Build Stock Entry (Issue)
   - Link to Pick List
   - Update Pick List status
   - Generate packing slip (optional)

### Stories (7-9)
1. Pick List API integration
2. Pick List selection UI
3. Pick item display & sorting
4. Location verification
5. Item scan confirmation
6. Quantity adjustment
7. Stock Entry (Issue) creation
8. Pick List completion
9. Packing slip generation (optional)

**Dependencies:** Epics 1, 2  
**Estimated:** 1 week

---

## Epic 5: Transfer Workflow

**Goal:** Move inventory between locations

### Scope
- Select source location
- Scan items to transfer
- Select destination location
- Create Stock Entry (Transfer)

### User Flow
```
1. Scan source location
2. View items at location (optional)
3. Scan item(s) to transfer
4. Enter quantities
5. Scan destination location
6. Confirm transfer
7. Create Stock Entry (Transfer)
```

### Features
1. **Location Selection**
   - Scan or browse locations
   - Show current stock (optional)
   - Validate locations exist

2. **Item Transfer**
   - Scan multiple items
   - Batch transfer support
   - Quantity validation

3. **Stock Entry (Transfer)**
   - Set source & target warehouses
   - Create transfer record
   - Update bin quantities

### Stories (4-5)
1. Source location selection
2. Item scan & qty entry
3. Destination location selection
4. Transfer confirmation
5. Stock Entry (Transfer) API

**Dependencies:** Epics 1, 2  
**Estimated:** 3-5 days

---

## Epic 6: Offline Sync & Idempotency

**Goal:** Enable reliable offline operation with duplicate prevention

### Scope
- IndexedDB queue for offline actions
- Background sync with retry
- Idempotency key generation
- Conflict resolution
- Queue management UI

### Features
1. **Offline Queue**
   - Store pending actions in IndexedDB
   - FIFO processing
   - Persist across sessions

2. **Idempotency**
   - Generate unique keys (device + user + timestamp + action)
   - Add to Stock Entry
   - Server-side duplicate detection (requires custom field)

3. **Sync Logic**
   - Background sync on network restore
   - Exponential backoff retry
   - Max retry limit
   - Manual retry option

4. **Conflict Resolution**
   - Detect stale data
   - Warn on conflicts
   - Allow user override

5. **Queue UI**
   - Show pending actions
   - Retry failed items
   - Clear successful items

### Stories (6-8)
1. IndexedDB queue implementation
2. Idempotency key generation
3. Background sync service
4. Retry logic with backoff
5. Queue management UI
6. Conflict detection
7. Custom field setup (ERPNext)
8. Testing & validation

**Dependencies:** Epics 1, 2, 3, 4, 5 (needs workflows to queue)  
**Requires:** Custom field `Stock Entry.idempotency_key`

**Estimated:** 1 week

---

## Epic 7: Print Service Integration (Optional Phase 2)

**Goal:** Print barcode labels on-demand from PWA

### Scope
- ZPL template management
- Label print API
- Zebra printer integration
- Print queue & status

### Features
1. **ZPL Templates**
   - Item labels
   - Location labels
   - Shipment labels
   - Template editor (optional)

2. **Print Service**
   - Flask/Express microservice
   - Accepts print jobs
   - Renders ZPL
   - Sends to Zebra ZD220t (USB/LAN)

3. **PWA Integration**
   - Print location labels
   - Print item labels
   - Reprint on demand
   - Print job status

4. **Printer Management**
   - Printer discovery
   - Status monitoring
   - Job queue
   - Error handling

### Stories (6-8)
1. ZPL template library
2. Print service setup
3. Zebra printer integration
4. Print API endpoints
5. PWA print UI
6. Job queue & status
7. Template management
8. Batch printing

**Dependencies:** Epic 2 (PWA needs to be built)  
**Estimated:** 1 week

---

## Dependencies Graph

```
Epic 1 (Warehouse Setup)
  │
  ├─→ Epic 2 (PWA Core)
  │     │
  │     ├─→ Epic 3 (Inbound)
  │     ├─→ Epic 4 (Outbound)
  │     ├─→ Epic 5 (Transfer)
  │     │
  │     └─→ Epic 6 (Offline Sync)
  │           │
  │           └─→ Epic 7 (Print Service)
  │
  └─→ All other epics depend on Epic 1
```

---

## Phase Mapping

### Phase 1A: Foundation & Pilot (Weeks 1-2)
- ✅ Epic 1: Warehouse Setup
- Epic 2: PWA Core
- Epic 3: Inbound (basic)
- **Pilot:** Central Rack + Section 5 (25 locations)

### Phase 1B: Expand & Refine (Weeks 3-4)
- Epic 4: Outbound
- Epic 5: Transfer
- Epic 6: Offline Sync
- **Rollout:** Sections 1, 2, 3 (144 additional locations)

### Phase 2: Complete & Enhance (Weeks 5-8)
- Section 4 labels & import (28 locations)
- Epic 7: Print Service
- Dashboards & reporting
- Training materials

### Phase 3: Advanced Features (Months 2-3)
- Native mobile app (React Native)
- Advanced analytics
- Replenishment alerts
- Integration refinements

---

## Success Metrics

### Phase 1A (Pilot)
- ✅ 25 locations operational
- Scan success rate > 95%
- Average scan-to-confirm < 2 seconds
- User satisfaction 4/5+
- Error rate < 1%

### Phase 1B (Full Pilot)
- 169 locations operational
- Inventory accuracy > 99%
- Pick-to-pack time reduced 30%
- User adoption > 80%

### Phase 2 (Complete)
- All 197 locations operational
- Cycle count time reduced 70%
- Full offline capability
- Training < 2 hours per user

---

## Risk Register

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| User resistance | High | Pilot approach, training | PM |
| WiFi dead zones | Medium | Offline-first design | Architect |
| Label quality issues | Medium | Test before mass print | Ops |
| API rate limits | Low | Caching, batch operations | Dev |
| Printer downtime | Medium | Backup printer, manual entry | Ops |

---

## Next Steps

1. ✅ **Epic 1 Complete** - Warehouses imported
2. 📋 **Create Stories for Epic 1** - Detail implementation steps
3. 🚀 **Hand off to Scrum Master** - Begin story refinement
4. 👨‍💻 **Start Epic 2** - PWA development can begin
5. 🧪 **Plan pilot testing** - Central Rack validation

---

*Roadmap Version: 1.0*  
*Last Updated: October 6, 2025*  
*Product Owner: Sarah*




