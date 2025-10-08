#!/usr/bin/env python3
"""
Automatically update all warehouse locations with barcodes via ERPNext API
"""

import requests
import csv
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/Users/ibra/Desktop/WMS/wms-backend/.env')

ERPNEXT_URL = os.getenv("ERPNEXT_URL", "https://globalspectrumsarl.frappe.cloud")
API_KEY = os.getenv("ERPNEXT_API_KEY")
API_SECRET = os.getenv("ERPNEXT_API_SECRET")

if not API_KEY or not API_SECRET:
    print("❌ Error: API credentials not found!")
    print("Make sure ERPNEXT_API_KEY and ERPNEXT_API_SECRET are set in your environment")
    exit(1)

def update_warehouse_barcode(warehouse_name, barcode_value):
    """Update a single warehouse with its barcode"""
    headers = {
        "Authorization": f"token {API_KEY}:{API_SECRET}",
        "Content-Type": "application/json"
    }
    
    url = f"{ERPNEXT_URL}/api/resource/Warehouse/{warehouse_name}"
    
    payload = {
        "custom_location_barcode": barcode_value
    }
    
    try:
        response = requests.put(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            return True, "Success"
        else:
            return False, f"HTTP {response.status_code}: {response.text[:100]}"
    except Exception as e:
        return False, str(e)

def main():
    print("=" * 70)
    print("🏭 Global Spectrum WMS - Location Barcode Auto-Updater")
    print("=" * 70)
    print()
    
    # Read the CSV
    csv_file = "/Users/ibra/Desktop/WMS/docs/location_barcodes_20251007_174727.csv"
    
    print(f"📄 Reading: {csv_file}")
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        locations = list(reader)
    
    print(f"✅ Found {len(locations)} locations to update")
    print()
    
    # Update each warehouse
    success_count = 0
    error_count = 0
    
    print("🚀 Starting bulk update...")
    print()
    
    for i, loc in enumerate(locations, 1):
        warehouse_name = loc['Full Warehouse Name (Barcode Value)']
        barcode = loc['Full Warehouse Name (Barcode Value)']  # Use full name as barcode
        
        # Show progress
        print(f"[{i}/{len(locations)}] Updating: {warehouse_name[:50]}...", end=" ")
        
        success, message = update_warehouse_barcode(warehouse_name, barcode)
        
        if success:
            print("✅")
            success_count += 1
        else:
            print(f"❌ {message}")
            error_count += 1
        
        # Small delay to avoid rate limiting
        time.sleep(0.1)
    
    print()
    print("=" * 70)
    print("✅ COMPLETE!")
    print("=" * 70)
    print()
    print(f"📊 Results:")
    print(f"   ✅ Successfully updated: {success_count}")
    print(f"   ❌ Errors: {error_count}")
    print()
    
    if success_count > 0:
        print("🎉 Location barcodes are now set in ERPNext!")
        print()
        print("📋 Next steps:")
        print("   1. Print your location barcode labels")
        print("   2. Test scanning with your handheld scanner")
        print("   3. Use in WMS workflows (Inbound/Outbound/Transfer)")
        print()

if __name__ == "__main__":
    main()
