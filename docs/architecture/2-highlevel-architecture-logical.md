# 2) High‑Level Architecture (Logical)
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
