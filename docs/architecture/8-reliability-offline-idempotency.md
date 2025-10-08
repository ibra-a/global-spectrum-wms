# 8) Reliability, Offline & Idempotency
- IndexedDB FIFO queue; background sync; exponential backoff
- Unique index on `Stock Entry.idempotency_key` prevents double movements
- “Stale pick” warning if local snapshot outdated; ERPNext remains truth
- Print jobs resilient: `queued/printing/done/failed` with re‑send support

---
