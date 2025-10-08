# 5) API Contracts (Lean)
## 5.1 ERPNext (preferred direct REST)
- **POST** `/api/resource/Stock Entry`
  - Body: `{ purpose, items:[{item_code, qty, s_warehouse?, t_warehouse?, s_location?, t_location?}], idempotency_key }`
  - Behavior: Upsert on `idempotency_key` (return existing doc if duplicate)
- **GET** `/api/resource/Purchase Order?filters=...`
- **GET** `/api/resource/Pick List/<name>`

## 5.2 Print Service
- **POST** `/print/label` → `{ template: "ITEM"|"LOCATION"|"SHIPMENT", data:{...}, copies?:1 }` → `{ jobId }`
- **GET** `/print/status/:jobId` → `{ status, message? }`
- **POST** `/print/batch` → `[{...}, {...}]`

---
