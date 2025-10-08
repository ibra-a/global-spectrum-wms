#!/usr/bin/env python3
"""
Generate Location Barcode Labels for Global Spectrum WMS
This script fetches all sub-locations from the WMS backend API
"""

import requests
import csv
from datetime import datetime

# Use local backend API (which already has ERPNext credentials)
BACKEND_URL = "http://localhost:8000"

def get_all_locations():
    """Fetch all warehouse sub-locations from WMS Backend"""
    print("🔍 Fetching locations from WMS Backend...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/locations")
        
        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            return []
        
        all_warehouses = response.json()
        
        # Filter for sub-locations (is_group = 0 and has parent)
        sub_locations = [
            loc for loc in all_warehouses
            if (loc.get("is_group") == 0 or loc.get("is_group") == "0" or loc.get("is_group") == False)
            and loc.get("parent_warehouse")
            and loc.get("parent_warehouse") != "All Warehouses"
            and "Raw Materials - GSS" not in loc.get("name", "")  # Exclude the main Raw Materials warehouse
        ]
        
        print(f"✅ Found {len(sub_locations)} sub-locations")
        return sub_locations
        
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        print("Make sure the WMS backend is running on http://localhost:8000")
        return []

def generate_barcode_csv(locations):
    """Generate CSV file with location barcodes for printing"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"/Users/ibra/Desktop/WMS/docs/location_barcodes_{timestamp}.csv"
    
    print(f"📝 Generating barcode CSV: {filename}")
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow([
            'Section',
            'Location Name',
            'Full Warehouse Name (Barcode Value)',
            'Short Label'
        ])
        
        # Sort by parent warehouse, then by name
        sorted_locations = sorted(
            locations,
            key=lambda x: (x.get('parent_warehouse', ''), x.get('warehouse_name', ''))
        )
        
        for loc in sorted_locations:
            parent = loc.get('parent_warehouse', '')
            name = loc.get('warehouse_name', '')
            full_name = loc.get('name', '')
            
            # Create a short label for the printed barcode
            # e.g., "Section 1 - A1 - GSS" -> "S1-A1"
            short_label = name.replace('Section ', 'S').replace(' - GSS', '').replace(' ', '')
            
            writer.writerow([
                parent,
                name,
                full_name,  # This is what the barcode will encode
                short_label  # This is what we print as human-readable text
            ])
    
    print(f"✅ CSV created: {filename}")
    print(f"📊 Total labels: {len(locations)}")
    return filename

def generate_printing_instructions(csv_file, locations):
    """Generate instructions for printing barcodes"""
    instructions_file = "/Users/ibra/Desktop/WMS/docs/LOCATION_BARCODE_INSTRUCTIONS.md"
    
    # Count locations by section
    by_section = {}
    for loc in locations:
        parent = loc.get('parent_warehouse', 'Unknown')
        by_section[parent] = by_section.get(parent, 0) + 1
    
    with open(instructions_file, 'w', encoding='utf-8') as f:
        f.write("# Location Barcode Printing Instructions\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## 📊 Summary\n\n")
        for section, count in sorted(by_section.items()):
            f.write(f"- **{section}**: {count} locations\n")
        f.write(f"\n**Total Labels to Print:** {len(locations)}\n\n")
        
        f.write("---\n\n")
        f.write("## 🖨️ How to Print Location Barcodes\n\n")
        
        f.write("### Option 1: Online Barcode Generator (Easiest)\n\n")
        f.write("1. Go to **https://www.barcodesinc.com/generator/index.php**\n")
        f.write("2. For each location in the CSV:\n")
        f.write("   - Enter the **Full Warehouse Name** (e.g., `Section 1 - A1 - GSS`)\n")
        f.write("   - Select barcode type: **Code 128** (recommended)\n")
        f.write("   - Generate and download as PNG/PDF\n")
        f.write("   - Print on label paper (2\" x 1\" recommended)\n\n")
        
        f.write("### Option 2: Microsoft Word Mail Merge\n\n")
        f.write(f"1. Open the CSV file: `{csv_file}`\n")
        f.write("2. In Word, go to **Mailings** → **Start Mail Merge** → **Labels**\n")
        f.write("3. Choose label size (Avery 5160 or similar)\n")
        f.write("4. Insert **Barcode** field with `Full Warehouse Name (Barcode Value)` column\n")
        f.write("5. Insert **Short Label** as human-readable text below barcode\n")
        f.write("6. Preview and print\n\n")
        
        f.write("### Option 3: Barcode Label Software\n\n")
        f.write("If you have a label printer (Zebra, Brother, Dymo):\n")
        f.write(f"1. Import the CSV: `{csv_file}`\n")
        f.write("2. Map fields:\n")
        f.write("   - **Barcode:** `Full Warehouse Name (Barcode Value)` column\n")
        f.write("   - **Text:** `Short Label` column\n")
        f.write("3. Use **Code 128** barcode symbology\n")
        f.write("4. Print all labels\n\n")
        
        f.write("### Option 4: Free Online Bulk Generator ✨ (Recommended!)\n\n")
        f.write("1. Go to **https://barcode.tec-it.com/en/Code128**\n")
        f.write("2. Or use **https://www.labelary.com/viewer.html** (for ZPL format)\n")
        f.write("3. Upload the CSV file\n")
        f.write("4. Generate all barcodes at once\n")
        f.write("5. Download as PDF and print!\n\n")
        
        f.write("---\n\n")
        f.write("## 📋 Label Format Recommendation\n\n")
        f.write("```\n")
        f.write("┌─────────────────────┐\n")
        f.write("│  ▐ ▌ ▐▌▐ ▌ ▐▌▐ ▌  │  <- Barcode (Code 128)\n")
        f.write("│  Section 1 - A1 - GSS │  <- Full warehouse name (encoded)\n")
        f.write("│      S1-A1          │  <- Short label (human-readable)\n")
        f.write("└─────────────────────┘\n")
        f.write("```\n\n")
        
        f.write("- **Size:** 2\" x 1\" or 50mm x 25mm\n")
        f.write("- **Barcode Type:** Code 128 (best for alphanumeric)\n")
        f.write("- **Material:** Durable adhesive labels\n")
        f.write("- **Placement:** Eye-level on each rack/shelf location\n\n")
        
        f.write("---\n\n")
        f.write("## ✅ After Printing\n\n")
        f.write("1. **Organize labels by section** (Section 1, Section 2, etc.)\n")
        f.write("2. **Physically place labels** at each location in your warehouse\n")
        f.write("3. **Test scanning** with your EasyPOS scanner\n")
        f.write("4. **Verify** the WMS recognizes each location correctly\n\n")
        
        f.write("---\n\n")
        f.write("## 🧪 Testing Your Location Barcodes\n\n")
        f.write("1. Go to `http://localhost:3000/scanner-test`\n")
        f.write("2. Scan a location barcode\n")
        f.write("3. It should show the full warehouse name (e.g., `Section 1 - A1 - GSS`)\n")
        f.write("4. Then test in a real workflow:\n")
        f.write("   - Go to **Inbound** page\n")
        f.write("   - Scan item barcode\n")
        f.write("   - When prompted for location, click **\"Scan Instead\"**\n")
        f.write("   - Scan the location barcode\n")
        f.write("   - Complete the transaction!\n\n")
        
        f.write("---\n\n")
        f.write("## 📞 Need Help?\n\n")
        f.write("If you have issues:\n")
        f.write("- Check that barcode type is **Code 128**\n")
        f.write("- Ensure the full warehouse name is encoded (with ` - GSS` suffix)\n")
        f.write("- Test scanner on the `/scanner-test` page first\n")
        f.write("- Make sure labels are clean and well-lit when scanning\n\n")
    
    print(f"✅ Instructions created: {instructions_file}")
    return instructions_file

def main():
    print("=" * 60)
    print("🏭 Global Spectrum WMS - Location Barcode Generator")
    print("=" * 60)
    print()
    
    # Fetch locations
    locations = get_all_locations()
    
    if not locations:
        print("❌ No locations found!")
        print()
        print("💡 Make sure:")
        print("   - WMS backend is running: http://localhost:8000")
        print("   - ERPNext connection is working")
        return
    
    # Generate CSV
    csv_file = generate_barcode_csv(locations)
    
    # Generate instructions
    instructions_file = generate_printing_instructions(csv_file, locations)
    
    print()
    print("=" * 60)
    print("✅ COMPLETE!")
    print("=" * 60)
    print()
    print(f"📁 Files created:")
    print(f"   1. {csv_file}")
    print(f"   2. {instructions_file}")
    print()
    print("📖 Next steps:")
    print("   1. Open the CSV file to see all locations")
    print("   2. Read the instructions file for printing options")
    print("   3. Print your location barcodes!")
    print()

if __name__ == "__main__":
    main()
