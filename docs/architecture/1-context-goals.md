# 1) Context & Goals
- **System of Record:** ERPNext v15 (Frappe Cloud) - all stock movements recorded here
- **ERPNext URL:** https://globalspectrumsarl.frappe.cloud
- **WMS Layer:** Lightweight PWA for scanning + small print microservice (ZPL)
- **Current State:** 393+ items in "Raw Materials - GSS" without location tracking
- **Target State:** 197 location-tracked storage positions across 6 sections
- **Non‑negotiables:** Offline‑first, idempotent writes, barcode‑first, future RFID/IoT‑ready
- **Avoid:** Any second authoritative DB for quantities

---
