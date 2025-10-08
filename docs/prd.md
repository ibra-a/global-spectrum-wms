# Product Requirements Document (PRD) – Global Spectrum WMS

## 1. Overview
- **Project Name:** Global Spectrum WMS – Barcode Inventory System  
- **Owner:** Global Spectrum Operations  
- **System of Record:** ERPNext (single source of truth)  
- **Purpose:** Replace manual inventory tracking with a barcode-driven system to improve accuracy, speed, and scalability.  

---

## 2. Problem Statement
- Manual inventory processes are error-prone.  
- No standard barcode system for raw materials and finished goods.  
- Physical counts are slow and disrupt operations.  
- No real-time visibility of inventory across 228+ storage locations.  

---

## 3. Objectives
- Implement barcode system integrated with ERPNext.  
- Achieve **99.5%+ inventory accuracy**.  
- Reduce cycle count time by **70%**.  
- Standardize inbound (entry) and outbound (exit) workflows.  
- Lay foundation for future RFID and IoT adoption.  

---

## 4. Scope
**In Scope (Phase 1–3):**  
- Barcode labeling system (ZPL templates, Zebra printers)  
- Scanning app (PWA → React Native later)  
- Inbound, outbound, and transfer workflows integrated with ERPNext  
- Warehouse layout coding (S1–S5 + CR) - **197 physical locations**  
- Offline-first data capture with ERPNext sync  
- Training and adoption for warehouse staff  

**Raw Materials Warehouse - Location Breakdown:**  
- **Section 1:** 96 locations (open shelving: A1-A16, B1-B12, AB13-AB16, C-F 1-16)  
- **Section 2:** 18 locations (2 racks with hierarchical levels)  
- **Section 3:** 30 locations (4 racks with varying positions)  
- **Section 4:** 28 locations (7×4 floor grid: A-G 1-4) - *Labels pending*  
- **Section 5:** 10 locations (compact shelving: A-E 1-2)  
- **Central Rack:** 15 locations (3 levels × 5 positions)  

**Current ERPNext Status:**  
- 393+ items currently in "Raw Materials - GSS"  
- No location-level tracking (to be implemented)  
- ERPNext instance: https://globalspectrumsarl.frappe.cloud  

**Out of Scope (for now):**  
- RFID-based tracking  
- Robotics/conveyor automation  
- AI-based vision scanning  

---

## 5. Stakeholders
- **Sponsor:** Global Spectrum Management  
- **Product Owner:** Warehouse Operations Head  
- **Users:** Warehouse staff (pickers, supervisors), Admin team  
- **Developers:** ERPNext + Frontend engineers  
- **PM:** Project Manager  

---

## 6. Functional Requirements
1. **Labeling System** – ZPL templates, batch printing, preview validation  
2. **Inbound Workflow** – Scan PO → Scan Item → Scan Location → ERPNext Receipt  
3. **Outbound Workflow** – Pick List → Scan Location → Scan Item → Stage/Pack → ERPNext Issue  
4. **Transfers** – Location-to-location or warehouse-to-warehouse via ERPNext Transfer Entry  
5. **Cycle Counts** – Section-based counts with ERPNext reconciliation  
6. **App Features** – PWA scanning, offline-first queue, roles, error alerts  

---

## 7. Non-Functional Requirements
- **Performance:** <2s scan-to-confirmation  
- **Reliability:** Offline sync retries with idempotency  
- **Usability:** Training <2 hours per user  
- **Scalability:** Expandable to 500+ locations  
- **Durability:** Labels last 12–18 months  

---

## 8. KPIs
- Inventory accuracy > 99.5%  
- Inbound/outbound scan errors < 1%  
- Pick-to-pack SLA improved by 30%  
- Cycle count duration reduced by 70%  
- User adoption > 90% within 3 months  

---

## 9. Timeline (Phased Rollout)

**Phase 1A - Pilot (Week 1):**  
- Import warehouse structure to ERPNext (169 locations)  
- Deploy Central Rack (15 locations) + Section 5 (10 locations)  
- PWA MVP: Basic scanning workflows  
- User training and validation  

**Phase 1B - Expand (Week 2):**  
- Deploy Section 1 (96 locations)  
- Deploy Section 2 (18 locations) + Section 3 (30 locations)  
- Refine PWA based on pilot feedback  
- Scale training to all warehouse staff  

**Phase 2 - Complete & Enhance (Weeks 3-4):**  
- Print and deploy Section 4 labels (28 locations)  
- Print service integration  
- Dashboards and reporting  
- Cycle count workflows  

**Phase 3 - Advanced Features (Month 2-3):**  
- Native mobile app (React Native)  
- Offline queue optimization  
- Replenishment alerts  
- Advanced analytics  

**Phase 4 - Future (Month 4-6):**  
- RFID-ready infrastructure  
- IoT sensor integration  
- Predictive analytics  

---

## 10. Risks & Mitigations
- **User adoption resistance** → Early training + pilot with Central Rack  
- **Label printer downtime** → Backup printer + consumables stock  
- **WiFi coverage issues** → Offline-first design, sync retries  
- **Dual system confusion** → ERPNext as the single source of truth  

---

## 11. Future Enhancements
- RFID integration for high-value goods  
- IoT (temperature/humidity sensors) → ERPNext  
- AI-based misplacement detection  
- Shipping carrier label integration (DHL, Aramex)  
