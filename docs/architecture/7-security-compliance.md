# 7) Security & Compliance
- **AuthN:** ERPNext session or API key/secret → short‑lived JWT for PWA
- **AuthZ:** ERPNext Roles (Picker, Supervisor, Admin) with server‑side checks
- **Transport:** HTTPS; TLS termination at reverse proxy; printer VLAN/VPN
- **Audit:** All stock moves as ERPNext docs; user & timestamp recorded

---
