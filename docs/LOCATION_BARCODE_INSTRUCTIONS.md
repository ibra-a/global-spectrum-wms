# Location Barcode Printing Instructions

**Generated:** 2025-10-07 17:47:27

## 📊 Summary

- **All Warehouses - GSS**: 4 locations
- **Central Rack - GSS**: 15 locations
- **Section 1 - GSS**: 96 locations
- **Section 2 - GSS**: 32 locations
- **Section 3 - GSS**: 49 locations
- **Section 4 - GSS**: 28 locations
- **Section 5 - GSS**: 10 locations

**Total Labels to Print:** 234

---

## 🖨️ How to Print Location Barcodes

### Option 1: Online Barcode Generator (Easiest)

1. Go to **https://www.barcodesinc.com/generator/index.php**
2. For each location in the CSV:
   - Enter the **Full Warehouse Name** (e.g., `Section 1 - A1 - GSS`)
   - Select barcode type: **Code 128** (recommended)
   - Generate and download as PNG/PDF
   - Print on label paper (2" x 1" recommended)

### Option 2: Microsoft Word Mail Merge

1. Open the CSV file: `/Users/ibra/Desktop/WMS/docs/location_barcodes_20251007_174727.csv`
2. In Word, go to **Mailings** → **Start Mail Merge** → **Labels**
3. Choose label size (Avery 5160 or similar)
4. Insert **Barcode** field with `Full Warehouse Name (Barcode Value)` column
5. Insert **Short Label** as human-readable text below barcode
6. Preview and print

### Option 3: Barcode Label Software

If you have a label printer (Zebra, Brother, Dymo):
1. Import the CSV: `/Users/ibra/Desktop/WMS/docs/location_barcodes_20251007_174727.csv`
2. Map fields:
   - **Barcode:** `Full Warehouse Name (Barcode Value)` column
   - **Text:** `Short Label` column
3. Use **Code 128** barcode symbology
4. Print all labels

### Option 4: Free Online Bulk Generator ✨ (Recommended!)

1. Go to **https://barcode.tec-it.com/en/Code128**
2. Or use **https://www.labelary.com/viewer.html** (for ZPL format)
3. Upload the CSV file
4. Generate all barcodes at once
5. Download as PDF and print!

---

## 📋 Label Format Recommendation

```
┌─────────────────────┐
│  ▐ ▌ ▐▌▐ ▌ ▐▌▐ ▌  │  <- Barcode (Code 128)
│  Section 1 - A1 - GSS │  <- Full warehouse name (encoded)
│      S1-A1          │  <- Short label (human-readable)
└─────────────────────┘
```

- **Size:** 2" x 1" or 50mm x 25mm
- **Barcode Type:** Code 128 (best for alphanumeric)
- **Material:** Durable adhesive labels
- **Placement:** Eye-level on each rack/shelf location

---

## ✅ After Printing

1. **Organize labels by section** (Section 1, Section 2, etc.)
2. **Physically place labels** at each location in your warehouse
3. **Test scanning** with your EasyPOS scanner
4. **Verify** the WMS recognizes each location correctly

---

## 🧪 Testing Your Location Barcodes

1. Go to `http://localhost:3000/scanner-test`
2. Scan a location barcode
3. It should show the full warehouse name (e.g., `Section 1 - A1 - GSS`)
4. Then test in a real workflow:
   - Go to **Inbound** page
   - Scan item barcode
   - When prompted for location, click **"Scan Instead"**
   - Scan the location barcode
   - Complete the transaction!

---

## 📞 Need Help?

If you have issues:
- Check that barcode type is **Code 128**
- Ensure the full warehouse name is encoded (with ` - GSS` suffix)
- Test scanner on the `/scanner-test` page first
- Make sure labels are clean and well-lit when scanning

