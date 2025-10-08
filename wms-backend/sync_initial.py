"""
Initial Sync Script: ERPNext -> Supabase
Run this once to populate Supabase with all data from ERPNext
"""

import os
import sys
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# ERPNext API client
class ERPNextClient:
    def __init__(self):
        self.base_url = os.getenv("ERPNEXT_URL")
        self.headers = {
            "Authorization": f"token {os.getenv('ERPNEXT_API_KEY')}:{os.getenv('ERPNEXT_API_SECRET')}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def get(self, endpoint, params=None):
        """Make GET request to ERPNext"""
        url = f"{self.base_url}{endpoint}"
        print(f"   GET {url}")
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"ERPNext API error: {e}")

erpnext = ERPNextClient()

def sync_items():
    """Sync all items from ERPNext to Supabase"""
    print("🔄 Syncing items from ERPNext...")
    
    try:
        # Fetch all items from ERPNext
        response = erpnext.get("/api/resource/Item", params={
            "fields": '["item_code","item_name","item_group","stock_uom","description","custom_stock_location","barcode"]',
            "limit_page_length": 5000
        })
        
        items = response.get("data", [])
        print(f"   Found {len(items)} items in ERPNext")
        
        if not items:
            print("   ⚠️  No items found!")
            return
        
        # Transform for Supabase
        supabase_items = []
        for item in items:
            supabase_items.append({
                "item_code": item["item_code"],
                "item_name": item.get("item_name", item["item_code"]),
                "barcode": item.get("barcode"),
                "stock_uom": item.get("stock_uom"),
                "custom_stock_location": item.get("custom_stock_location"),
                "item_group": item.get("item_group"),
                "description": item.get("description"),
                "last_synced": datetime.utcnow().isoformat()
            })
        
        # Upsert to Supabase (insert or update)
        result = supabase.table('items').upsert(supabase_items).execute()
        print(f"   ✅ Synced {len(result.data)} items to Supabase")
        
    except Exception as e:
        print(f"   ❌ Error syncing items: {e}")

def sync_warehouses():
    """Sync all warehouses from ERPNext to Supabase"""
    print("🔄 Syncing warehouses from ERPNext...")
    
    try:
        # Fetch all warehouses from ERPNext
        response = erpnext.get("/api/resource/Warehouse", params={
            "fields": '["name","warehouse_name","parent_warehouse","is_group","custom_warehouse_barcode","company"]',
            "limit_page_length": 5000
        })
        
        warehouses = response.get("data", [])
        print(f"   Found {len(warehouses)} warehouses in ERPNext")
        
        if not warehouses:
            print("   ⚠️  No warehouses found!")
            return
        
        # Transform for Supabase
        supabase_warehouses = []
        for wh in warehouses:
            supabase_warehouses.append({
                "name": wh["name"],
                "warehouse_name": wh.get("warehouse_name", wh["name"]),
                "parent_warehouse": wh.get("parent_warehouse"),
                "is_group": wh.get("is_group", 0) == 1,
                "custom_warehouse_barcode": wh.get("custom_warehouse_barcode"),
                "company": wh.get("company"),
                "last_synced": datetime.utcnow().isoformat()
            })
        
        # Upsert to Supabase
        result = supabase.table('warehouses').upsert(supabase_warehouses).execute()
        print(f"   ✅ Synced {len(result.data)} warehouses to Supabase")
        
    except Exception as e:
        print(f"   ❌ Error syncing warehouses: {e}")

def sync_stock_balance():
    """Sync stock balance from ERPNext to Supabase"""
    print("🔄 Syncing stock balance from ERPNext...")
    
    try:
        # Fetch all stock levels from ERPNext
        response = erpnext.get("/api/resource/Bin", params={
            "fields": '["item_code","warehouse","actual_qty","reserved_qty"]',
            "filters": '[["actual_qty",">",0]]',  # Only non-zero stock
            "limit_page_length": 5000
        })
        
        stock_data = response.get("data", [])
        print(f"   Found {len(stock_data)} stock records in ERPNext")
        
        if not stock_data:
            print("   ⚠️  No stock data found!")
            return
        
        # Transform for Supabase
        supabase_stock = []
        for stock in stock_data:
            actual_qty = float(stock.get("actual_qty", 0))
            reserved_qty = float(stock.get("reserved_qty", 0))
            
            supabase_stock.append({
                "item_code": stock["item_code"],
                "warehouse": stock["warehouse"],
                "actual_qty": actual_qty,
                "reserved_qty": reserved_qty,
                "available_qty": actual_qty - reserved_qty,
                "last_updated": datetime.utcnow().isoformat()
            })
        
        # Upsert to Supabase
        result = supabase.table('stock_balance').upsert(supabase_stock).execute()
        print(f"   ✅ Synced {len(result.data)} stock records to Supabase")
        
    except Exception as e:
        print(f"   ❌ Error syncing stock: {e}")

def main():
    print("\n" + "="*60)
    print("🚀 INITIAL SYNC: ERPNext → Supabase")
    print("="*60 + "\n")
    
    # Step 1: Sync items (must be first for foreign keys)
    sync_items()
    
    # Step 2: Sync warehouses (must be second for foreign keys)
    sync_warehouses()
    
    # Step 3: Sync stock balance (depends on items & warehouses)
    sync_stock_balance()
    
    print("\n" + "="*60)
    print("✅ INITIAL SYNC COMPLETE!")
    print("="*60 + "\n")
    
    # Print summary
    items_count = supabase.table('items').select('item_code', count='exact').execute()
    warehouses_count = supabase.table('warehouses').select('name', count='exact').execute()
    stock_count = supabase.table('stock_balance').select('item_code', count='exact').execute()
    
    print("📊 SUMMARY:")
    print(f"   Items in Supabase: {items_count.count}")
    print(f"   Warehouses in Supabase: {warehouses_count.count}")
    print(f"   Stock records in Supabase: {stock_count.count}")
    print()

if __name__ == "__main__":
    main()
