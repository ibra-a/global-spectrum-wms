# Architecture Document – Global Spectrum WMS (v1.0)

## 1) Context & Goals
- **System of Record:** ERPNext v15 (Frappe Cloud) - all stock movements recorded here
- **ERPNext URL:** https://globalspectrumsarl.frappe.cloud
- **WMS Layer:** Lightweight PWA for scanning + small print microservice (ZPL)
- **Current State:** 393+ items in "Raw Materials - GSS" without location tracking
- **Target State:** 197 location-tracked storage positions across 6 sections
- **Non‑negotiables:** Offline‑first, idempotent writes, barcode‑first, future RFID/IoT‑ready
- **Avoid:** Any second authoritative DB for quantities

---

## 2) High‑Level Architecture (Logical)
**Clients**
- **PWA (React/Next):** scanning, label preview, pick tasks
- **(Phase 2) React Native:** Zebra SDK, kiosk mode (optional)

**Services**
- **ERPNext (Frappe):** Items, Bins, Locations, Pick Lists, Stock Entries
- **Print Service (Flask/Express):** accepts jobs → renders ZPL → sends to Zebra ZD220t
- **(Optional) Realtime Gateway:** WebSocket/Socket.IO or Redis pub/sub for live boards

**Storage**
- **Authoritative:** ERPNext (MariaDB)
- **Client‑side:** IndexedDB (offline queue, retry buffer)
- **Config/Static:** ZPL templates (Git repo or ERPNext File doctype)

**Infra**
- Dockerized stack: `erpnext`, `print-service`, `reverse-proxy`, `(optional) redis`
- On‑prem (warehouse) for resilience; optional cloud mirror for dashboards

---

## 3) Component Responsibilities
### 3.1 PWA (React/Next)
- Auth via ERPNext
- Flows: Location → Item → Qty; Inbound, Outbound, Transfer; Cycle counts
- Offline queue with **idempotency_key**; background sync; exponential backoff
- Validation on client; re‑validation on server
- UX: global scan capture, focus lock, feedback toasts, error hints

### 3.2 Print Service (Flask/Express)
- **Endpoints:** `POST /print/label`, `POST /print/batch`, `GET /print/status/:jobId`
- Merge payload + template → raw ZPL; stream to printer via USB (CUPS/RAW) or LAN (9100/TCP)
- Preview mode, checksum, operator confirm; exposes simple job state

### 3.3 ERPNext
- **DocTypes:** Item, Warehouse, Bin, Purchase Order, Sales Order, Pick List, Stock Entry (Receipt/Issue/Transfer), Stock Reconciliation
- **Custom fields:** `Stock Entry.idempotency_key` (unique index), `Pick List.external_ref`
- **Server scripts:** Enforce idempotency; validate bin/location code formats

### 3.4 Realtime Gateway (Optional)
- Live pick boards & print‑queue status without polling
- Publishes events on successful commits in ERPNext / print service

---

## 4) Data Design (Conceptual)
- **No new authoritative tables** for stock; use ERPNext schema
- **Warehouse Hierarchy (Actual):**
  ```
  Raw Materials - GSS (Parent)
  ├── Section 1 - GSS (96 locations: S1-A1 to S1-F16)
  ├── Section 2 - GSS (18 locations: S2-R1-A1 to S2-R2-E4)
  ├── Section 3 - GSS (30 locations: S3-R1-A1 to S3-R4-E1)
  ├── Section 4 - GSS (28 locations: S4-A1 to S4-G4) *pending labels*
  ├── Section 5 - GSS (10 locations: S5-A1 to S5-E2)
  └── Central Rack - GSS (15 locations: CR-A1 to CR-C5)
  ```
- **Codes (barcode‑optimized):**
  - **Location:** `S1A1`, `S2R1A1`, `CR-A1` (barcode value often without dashes → `S2R1A1`)
  - **Item:** `item_code` (Code128‑safe, e.g., 1000001, 1000002)
  - **Physical labels:** Already printed for S1, S2, S3, S5, CR (169 locations)
  - **Shipment/Carton (optional):** short UUID for staging
- **Idempotency:** `idempotency_key = hash(device_id, user_id, timestamp, action, payload_crc32)`

---

## 5) API Contracts (Lean)
### 5.1 ERPNext (preferred direct REST)
- **POST** `/api/resource/Stock Entry`
  - Body: `{ purpose, items:[{item_code, qty, s_warehouse?, t_warehouse?, s_location?, t_location?}], idempotency_key }`
  - Behavior: Upsert on `idempotency_key` (return existing doc if duplicate)
- **GET** `/api/resource/Purchase Order?filters=...`
- **GET** `/api/resource/Pick List/<name>`

### 5.2 Print Service
- **POST** `/print/label` → `{ template: "ITEM"|"LOCATION"|"SHIPMENT", data:{...}, copies?:1 }` → `{ jobId }`
- **GET** `/print/status/:jobId` → `{ status, message? }`
- **POST** `/print/batch` → `[{...}, {...}]`

---

## 6) Sequence Flows
### 6.1 Inbound (PO → Receipt)
1. Scan **PO** → load expected lines  
2. Scan **Item** → Scan **Location** → Input **Qty**  
3. Create **Stock Entry (Material Receipt)** with `idempotency_key`  
4. Online: commit now; Offline: queue & retry  
5. (Optional) Print shelf/bin labels via print service  
6. UI confirms; cache invalidated

### 6.2 Outbound (Pick → Pack → Issue)
1. Generate **Pick List** in ERPNext  
2. Guided picking: scan **Location** → **Item** → **Qty**  
3. Create **Stock Entry (Material Issue)** (or Delivery Note) with `idempotency_key`  
4. Stage & pack; print shipment labels; dispatch

### 6.3 Transfers (Location/Warehouse)
- Scan **source location** → **item/qty** → **destination location**  
- Create **Stock Entry (Material Transfer)** with `idempotency_key`

---

## 7) Security & Compliance
- **AuthN:** ERPNext session or API key/secret → short‑lived JWT for PWA
- **AuthZ:** ERPNext Roles (Picker, Supervisor, Admin) with server‑side checks
- **Transport:** HTTPS; TLS termination at reverse proxy; printer VLAN/VPN
- **Audit:** All stock moves as ERPNext docs; user & timestamp recorded

---

## 8) Reliability, Offline & Idempotency
- IndexedDB FIFO queue; background sync; exponential backoff
- Unique index on `Stock Entry.idempotency_key` prevents double movements
- “Stale pick” warning if local snapshot outdated; ERPNext remains truth
- Print jobs resilient: `queued/printing/done/failed` with re‑send support

---

## 9) Performance & Capacity
- **Target:** <2s scan→confirmation online; ~100ms local ACK offline
- **Throughput:** Zebra ZD220t ≈240 labels/min (raw port 9100 streaming)
- **Concurrency:** Safe via ERPNext doc locks & line‑level updates
- **Caching:** Pick Lists & Item meta cached client‑side; invalidate on success

---

## 10) Monitoring & Ops
- **Metrics:** API latency, retry counts, idempotency collisions, print failures
- **Logs:** JSON logs (print service/gateway) → centralized (ELK/Loki)
- **Dashboards:** Grafana (system), ERPNext reports (ops KPIs)
- **Alerts:** Printer offline, API error spikes, high retry backlog

---

## 11) Deployment (Reference)
- **docker‑compose:** `erpnext`, `reverse-proxy`, `print-service`, `(optional) redis`, `wms-pwa`
- **Environments:** On‑prem primary; optional cloud for read‑only dashboards
- **Networking:** Internal VLAN for printers; TLS at proxy; allowlist WMS origins

---

## 12) Labeling (ZPL) Standards
**Item (4"×2")**
- Code128: `item_code`
- Text: item name (truncated), UOM, optional batch/expiry
- QR (optional): deep link to ERPNext item

**Location (4"×2")**
- Code128: compact code (`S2R1A1`)
- Text: full name (`SECTION 2 – RACK 1 – A1`)
- Footer: Global Spectrum branding

**Print Safety:** 3–5 mm quiet zones; 203 DPI; verify‑scan before mass run

---

## 13) Risk Register (Tech)
| Risk | Impact | Mitigation |
|---|---|---|
| Wi‑Fi dead zones | Delayed commits | Offline‑first; site survey; add APs |
| Double posts | Quantity divergence | Idempotency key + unique index |
| Bad labels | Scan failures | Preview + verify scan; quality ribbons |
| Printer downtime | Ops stall | Secondary printer; spare consumables |
| Over‑permissive clients | Security | Minimal roles; server‑side validation only |
| User resistance | Adoption | Pilot CR+S1; micro‑training; friendly UX |

---

## 14) Phase Plan (Build Order)
1. **PWA MVP:** Auth, scan flows, offline queue, idempotency  
2. **Print Service + ZPL:** Templates, preview, batch, job status  
3. **Pilot:** Central Rack + Section 1 rollout; tune UX  
4. **Full Warehouse:** Sections 2–5; cycle counts; simple dashboards  
5. **Optional:** Realtime boards; native app; IoT/RFID groundwork

---

## 15) Acceptance Criteria (Go‑Live MVP)
- End‑to‑end inbound & outbound **scan → ERPNext Stock Entry**
- **Idempotent** under retries; no duplicate movements
- **<2s** online confirmations; offline queue recoverable
- Print service outputs **scannable labels** (spot‑checked)
- Pilot (CR + S1) error rate **<1%** after 2 weeks
