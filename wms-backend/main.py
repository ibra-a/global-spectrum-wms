"""
Global Spectrum WMS - FastAPI Backend
Handles all ERPNext communication
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from functools import lru_cache

# Load environment variables
load_dotenv()

ERPNEXT_URL = os.getenv("ERPNEXT_URL")
API_KEY = os.getenv("ERPNEXT_API_KEY")
API_SECRET = os.getenv("ERPNEXT_API_SECRET")

# Simple in-memory cache
class SimpleCache:
    def __init__(self):
        self.cache = {}
    
    def get(self, key):
        if key in self.cache:
            data, expiry = self.cache[key]
            if datetime.now() < expiry:
                return data
            else:
                del self.cache[key]
        return None
    
    def set(self, key, data, ttl_seconds=300):
        expiry = datetime.now() + timedelta(seconds=ttl_seconds)
        self.cache[key] = (data, expiry)
    
    def clear(self, key=None):
        if key:
            if key in self.cache:
                del self.cache[key]
        else:
            self.cache.clear()

# Initialize cache
cache = SimpleCache()

# Initialize FastAPI
app = FastAPI(
    title="Global Spectrum WMS API",
    description="Warehouse Management System Backend for ERPNext Integration",
    version="1.0.0"
)

# CORS middleware - allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ERPNext API client
class ERPNextClient:
    def __init__(self):
        self.base_url = ERPNEXT_URL
        self.headers = {
            "Authorization": f"token {API_KEY}:{API_SECRET}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def get(self, endpoint, params=None):
        """Make GET request to ERPNext"""
        url = f"{self.base_url}{endpoint}"
        print(f"GET {url}")
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            raise HTTPException(status_code=500, detail=f"ERPNext API error: {str(e)}")
    
    def post(self, endpoint, data=None):
        """Make POST request to ERPNext"""
        url = f"{self.base_url}{endpoint}"
        print(f"POST {url}")
        print(f"Payload: {data}")
        try:
            response = requests.post(url, headers=self.headers, json=data, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            print(f"Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
            error_detail = str(e)
            if hasattr(e, 'response') and e.response:
                try:
                    error_json = e.response.json()
                    error_detail = error_json.get('message') or error_json.get('exc') or str(e)
                except:
                    error_detail = e.response.text
            raise HTTPException(status_code=500, detail=f"ERPNext Error: {error_detail}")

# Initialize ERPNext client
erpnext = ERPNextClient()

# Pydantic models
class StockEntryItem(BaseModel):
    item_code: str
    qty: float
    s_warehouse: Optional[str] = None
    t_warehouse: Optional[str] = None
    basic_rate: Optional[float] = 0

class StockEntryCreate(BaseModel):
    purpose: str  # "Material Receipt", "Material Issue", "Material Transfer"
    items: List[StockEntryItem]
    from_warehouse: Optional[str] = None
    to_warehouse: Optional[str] = None
    idempotency_key: Optional[str] = None
    user_name: Optional[str] = None  # Name of user performing the transaction

# API Routes

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "ok",
        "service": "Global Spectrum WMS API",
        "version": "1.0.0",
        "erpnext_url": ERPNEXT_URL,
        "caching": "enabled ⚡",
        "cache_ttl": {
            "locations": "10 minutes",
            "items": "5 minutes"
        }
    }

@app.post("/api/cache/clear")
async def clear_cache(key: Optional[str] = None):
    """Clear cache - useful for testing or manual refresh"""
    if key:
        cache.clear(key)
        return {"message": f"Cache cleared for key: {key}"}
    else:
        cache.clear()
        return {"message": "All cache cleared"}

@app.get("/api/test-connection")
async def test_connection():
    """Test ERPNext connection"""
    try:
        result = erpnext.get("/api/resource/Warehouse", params={"limit_page_length": 1})
        return {
            "connected": True,
            "message": "Successfully connected to ERPNext",
            "url": ERPNEXT_URL
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/warehouses")
async def get_warehouses():
    """Get all warehouses"""
    result = erpnext.get("/api/resource/Warehouse", params={
        "fields": '["name","warehouse_name","parent_warehouse","is_group"]',
        "limit_page_length": 500
    })
    return result.get("data", [])

@app.get("/api/locations")
async def get_locations():
    """Get all warehouses (both parent sections and sub-locations) - CACHED"""
    # Check cache first (10 minute TTL)
    cache_key = "locations_all"
    cached_data = cache.get(cache_key)
    
    if cached_data is not None:
        print(f"✅ Cache HIT: {cache_key}")
        return cached_data
    
    print(f"🔄 Cache MISS: {cache_key} - Fetching from ERPNext...")
    result = erpnext.get("/api/resource/Warehouse", params={
        "fields": '["name","warehouse_name","parent_warehouse","is_group","custom_warehouse_barcode","company"]',
        "limit_page_length": 500
    })
    
    data = result.get("data", [])
    
    # Cache for 10 minutes (600 seconds)
    cache.set(cache_key, data, ttl_seconds=600)
    print(f"💾 Cached {len(data)} locations")
    
    return data

@app.get("/api/items/search")
async def search_items(q: str):
    """Search items by custom_barcode, item_code, or item_name - CACHED"""
    # Check cache first (5 minute TTL for item searches)
    cache_key = f"item_search_{q}"
    cached_data = cache.get(cache_key)
    
    if cached_data is not None:
        print(f"✅ Cache HIT: {cache_key}")
        return cached_data
    
    print(f"🔄 Cache MISS: {cache_key} - Searching ERPNext...")
    
    # First, try exact match on custom_barcode (this is your GSS-RM-XXXXXX format)
    result = erpnext.get("/api/resource/Item", params={
        "fields": '["name","item_code","item_name","stock_uom","custom_barcode","custom_stock_location"]',
        "filters": f'[["custom_barcode","=","{q}"]]',
        "limit_page_length": 1
    })
    
    # If barcode found, cache and return it
    if result.get("data") and len(result["data"]) > 0:
        data = result.get("data", [])
        cache.set(cache_key, data, ttl_seconds=300)  # 5 minutes
        print(f"💾 Cached item search result")
        return data
    
    # If no barcode match, search by item_code (partial match)
    result = erpnext.get("/api/resource/Item", params={
        "fields": '["name","item_code","item_name","stock_uom","custom_barcode","custom_stock_location"]',
        "filters": f'[["item_code","like","%{q}%"]]',
        "limit_page_length": 20
    })
    
    # If no item_code match, try item_name
    if not result.get("data") or len(result["data"]) == 0:
        result = erpnext.get("/api/resource/Item", params={
            "fields": '["name","item_code","item_name","stock_uom","custom_barcode","custom_stock_location"]',
            "filters": f'[["item_name","like","%{q}%"]]',
            "limit_page_length": 20
        })
    
    data = result.get("data", [])
    
    # Cache for 5 minutes
    cache.set(cache_key, data, ttl_seconds=300)
    print(f"💾 Cached {len(data)} item(s)")
    
    return data

@app.get("/api/items/{item_code}")
async def get_item(item_code: str):
    """Get item details"""
    result = erpnext.get(f"/api/resource/Item/{item_code}")
    return result.get("data", {})

@app.get("/api/stock-balance")
async def get_stock_balance(item_code: str, warehouse: str):
    """Get stock balance at location"""
    result = erpnext.get("/api/resource/Bin", params={
        "fields": '["actual_qty","reserved_qty"]',
        "filters": f'[["item_code","=","{item_code}"],["warehouse","=","{warehouse}"]]'
    })
    bins = result.get("data", [])
    if bins:
        return {
            "actual_qty": bins[0].get("actual_qty", 0),
            "reserved_qty": bins[0].get("reserved_qty", 0),
            "available_qty": bins[0].get("actual_qty", 0) - bins[0].get("reserved_qty", 0)
        }
    return {"actual_qty": 0, "reserved_qty": 0, "available_qty": 0}

@app.post("/api/stock-entry")
async def create_stock_entry(entry: StockEntryCreate):
    """Create stock entry (Receipt/Issue/Transfer)"""
    from datetime import datetime
    import uuid
    import time
    
    # Build the payload according to ERPNext's expected format
    unique_ref = uuid.uuid4().hex[:12]
    timestamp_ms = int(time.time() * 1000)
    
    # Use a COMPLETELY CUSTOM naming series for WMS to avoid conflicts
    payload = {
        "doctype": "Stock Entry",
        "naming_series": "WMS-STE-.YYYY.-.#####",  # CUSTOM WMS series
        "stock_entry_type": entry.purpose,
        "purpose": entry.purpose,
        "company": "Global Spectrum SARL",
        "posting_date": datetime.now().strftime("%Y-%m-%d"),
        "posting_time": datetime.now().strftime("%H:%M:%S"),
        "docstatus": 0,  # Create as DRAFT
        "items": [
            {
                "item_code": item.item_code,
                "qty": item.qty,
                "s_warehouse": item.s_warehouse or entry.from_warehouse,
                "t_warehouse": item.t_warehouse or entry.to_warehouse,
                "basic_rate": item.basic_rate or 0,
                "uom": "PCs",
                "stock_uom": "PCs",
                "conversion_factor": 1.0,
                "transfer_qty": item.qty,
                "allow_zero_valuation_rate": 1,
            }
            for item in entry.items
        ],
        "remarks": f"WMS Transaction by {entry.user_name or 'Unknown'} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Ref: {unique_ref}"
    }
    
    try:
        # Step 1: Create as DRAFT (this should auto-generate a fresh name)
        print(f"Creating Stock Entry as DRAFT...")
        result = erpnext.post("/api/resource/Stock%20Entry", data=payload)
        doc_name = result.get("data", {}).get("name")
        print(f"Created draft: {doc_name}")
        
        # Return the draft - user will submit manually in ERPNext for now
        # TODO: Fix auto-submit in future version
        print(f"✅ Draft Stock Entry {doc_name} created successfully")
        print(f"📋 User needs to submit manually in ERPNext")
        
        return result.get("data", {})
    except Exception as e:
        print(f"❌ Full error: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response text: {e.response.text}")
        raise

@app.get("/api/purchase-orders")
async def get_purchase_orders():
    """Get open purchase orders"""
    result = erpnext.get("/api/resource/Purchase Order", params={
        "fields": '["name","supplier","transaction_date","grand_total","status"]',
        "filters": '[["docstatus","=","1"],["status","!=","Completed"]]',
        "limit_page_length": 50
    })
    return result.get("data", [])

@app.get("/api/pick-lists")
async def get_pick_lists():
    """Get pick lists"""
    result = erpnext.get("/api/resource/Pick List", params={
        "fields": '["name","customer","date","status"]',
        "filters": '[["docstatus","=","1"],["status","!=","Completed"]]',
        "limit_page_length": 50
    })
    return result.get("data", [])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)


@app.get("/api/locations/search")
async def search_locations(q: str):
    """Search locations by custom_warehouse_barcode or warehouse name - USES CACHE!"""
    print(f"🔍 Searching locations for: {q}")
    
    try:
        # Get ALL locations from cache (instant! no API calls!)
        all_locations = await get_locations()
        
        if not all_locations:
            return []
        
        matching_warehouses = []
        
        # Search through CACHED data (super fast!)
        for location in all_locations:
            barcode = location.get("custom_warehouse_barcode", "")
            name = location.get("name", "")
            warehouse_name = location.get("warehouse_name", "")
            
            # Check if barcode matches query (case-insensitive, exact match)
            if barcode and barcode.lower() == q.lower():
                print(f"   ✅ Found by barcode: {warehouse_name}")
                matching_warehouses.append(location)
                break  # Found exact barcode match, stop searching
            
            # Also check if warehouse name contains query (fallback)
            elif q.lower() in name.lower() or q.lower() in warehouse_name.lower():
                matching_warehouses.append(location)
        
        print(f"   📍 Found {len(matching_warehouses)} matching location(s)")
        return matching_warehouses[:20]  # Limit to 20 results
        
    except Exception as e:
        print(f"❌ Error in search_locations: {e}")
        raise HTTPException(status_code=500, detail=str(e))
