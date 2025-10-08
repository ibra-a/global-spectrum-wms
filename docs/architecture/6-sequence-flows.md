# 6) Sequence Flows
## 6.1 Inbound (PO → Receipt)
1. Scan **PO** → load expected lines  
2. Scan **Item** → Scan **Location** → Input **Qty**  
3. Create **Stock Entry (Material Receipt)** with `idempotency_key`  
4. Online: commit now; Offline: queue & retry  
5. (Optional) Print shelf/bin labels via print service  
6. UI confirms; cache invalidated

## 6.2 Outbound (Pick → Pack → Issue)
1. Generate **Pick List** in ERPNext  
2. Guided picking: scan **Location** → **Item** → **Qty**  
3. Create **Stock Entry (Material Issue)** (or Delivery Note) with `idempotency_key`  
4. Stage & pack; print shipment labels; dispatch

## 6.3 Transfers (Location/Warehouse)
- Scan **source location** → **item/qty** → **destination location**  
- Create **Stock Entry (Material Transfer)** with `idempotency_key`

---
