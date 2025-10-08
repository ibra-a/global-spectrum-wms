# 3) Component Responsibilities
## 3.1 PWA (React/Next)
- Auth via ERPNext
- Flows: Location → Item → Qty; Inbound, Outbound, Transfer; Cycle counts
- Offline queue with **idempotency_key**; background sync; exponential backoff
- Validation on client; re‑validation on server
- UX: global scan capture, focus lock, feedback toasts, error hints

## 3.2 Print Service (Flask/Express)
- **Endpoints:** `POST /print/label`, `POST /print/batch`, `GET /print/status/:jobId`
- Merge payload + template → raw ZPL; stream to printer via USB (CUPS/RAW) or LAN (9100/TCP)
- Preview mode, checksum, operator confirm; exposes simple job state

## 3.3 ERPNext
- **DocTypes:** Item, Warehouse, Bin, Purchase Order, Sales Order, Pick List, Stock Entry (Receipt/Issue/Transfer), Stock Reconciliation
- **Custom fields:** `Stock Entry.idempotency_key` (unique index), `Pick List.external_ref`
- **Server scripts:** Enforce idempotency; validate bin/location code formats

## 3.4 Realtime Gateway (Optional)
- Live pick boards & print‑queue status without polling
- Publishes events on successful commits in ERPNext / print service

---
