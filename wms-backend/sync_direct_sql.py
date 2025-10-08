"""Sync warehouses via direct SQL - bypassing PostgREST cache"""
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv('.env')

# Fetch from backend
print("🔄 Fetching warehouses from backend...")
response = requests.get("http://localhost:8000/api/locations")
warehouses = response.json()
print(f"   Found {len(warehouses)} warehouses\n")

# Generate SQL
print("📝 Generating SQL INSERT statement...")
values = []
for wh in warehouses:
    name = wh['name'].replace("'", "''")
    wh_name = wh.get('warehouse_name', wh['name']).replace("'", "''")
    parent = wh.get('parent_warehouse')
    barcode = wh.get('custom_warehouse_barcode')
    company = wh.get('company', 'Global Spectrum SARL')
    
    parent_sql = f"'{parent.replace(chr(39), chr(39)*2)}'" if parent else 'NULL'
    barcode_sql = f"'{barcode.replace(chr(39), chr(39)*2)}'" if barcode else 'NULL'
    company_sql = f"'{company.replace(chr(39), chr(39)*2)}'"
    is_group = 'true' if wh.get('is_group') else 'false'
    
    values.append(f"('{name}', '{wh_name}', {parent_sql}, {barcode_sql}, {company_sql}, {is_group}, NOW())")

sql = f"""INSERT INTO warehouses (name, warehouse_name, parent_warehouse, custom_warehouse_barcode, company, is_group, last_synced)
VALUES {','.join(values)}
ON CONFLICT (name) DO UPDATE SET
  warehouse_name = EXCLUDED.warehouse_name,
  parent_warehouse = EXCLUDED.parent_warehouse,
  custom_warehouse_barcode = EXCLUDED.custom_warehouse_barcode,
  company = EXCLUDED.company,
  is_group = EXCLUDED.is_group,
  last_synced = EXCLUDED.last_synced;"""

with open('/tmp/warehouse_insert.sql', 'w') as f:
    f.write(sql)

print(f"✅ SQL written to /tmp/warehouse_insert.sql")
print(f"   {len(values)} warehouses ready to insert")
print(f"\n📊 Sample SQL (first 200 chars):")
print(f"   {sql[:200]}...")
