# 9) Performance & Capacity
- **Target:** <2s scan→confirmation online; ~100ms local ACK offline
- **Throughput:** Zebra ZD220t ≈240 labels/min (raw port 9100 streaming)
- **Concurrency:** Safe via ERPNext doc locks & line‑level updates
- **Caching:** Pick Lists & Item meta cached client‑side; invalidate on success

---
