# 4) Data Design (Conceptual)
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
