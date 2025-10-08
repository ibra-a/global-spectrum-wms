# ERPNext Warehouse Import Guide

## Overview
This guide walks you through importing 169 warehouse locations (pilot phase) into your ERPNext instance at https://globalspectrumsarl.frappe.cloud.

**Import File:** `docs/erpnext-pilot-import.csv`  
**Sections Included:** Central Rack, Section 1, 2, 3, 5 (excludes Section 4 - labels not printed yet)  
**Total Records:** 207 (5 section groups + 169 storage locations + 33 sub-locations)

---

## Prerequisites

✅ **ERPNext Access**
- Login credentials for https://globalspectrumsarl.frappe.cloud
- User must have "Stock Manager" or "Warehouse Manager" role

✅ **Parent Warehouse Exists**
- Confirm "Raw Materials - GSS" exists in your warehouse list
- Path: Stock → Warehouse → Find "Raw Materials - GSS"

✅ **Import File Ready**
- File location: `/Users/ibra/Desktop/WMS/docs/erpnext-pilot-import.csv`
- 207 lines (including header)

---

## Step-by-Step Import Instructions

### Step 1: Access ERPNext

1. Open browser and go to: **https://globalspectrumsarl.frappe.cloud**
2. Log in with your credentials
3. You should see the ERPNext workspace

### Step 2: Navigate to Warehouse Import

1. Click on **Stock** module (sidebar or search "Stock")
2. Click on **Warehouse** (under Masters section)
3. You'll see the warehouse list view
4. Click the **three-dot menu (⋮)** in the top right
5. Select **Import** from the dropdown

### Step 3: Upload CSV File

1. Click **Choose File** or **Upload File**
2. Browse to: `/Users/ibra/Desktop/WMS/docs/erpnext-pilot-import.csv`
3. Click **Open** to upload
4. Wait for file to upload (~1-2 seconds)

### Step 4: Map Columns

ERPNext will attempt to auto-map columns. Verify the mapping:

| CSV Column | ERPNext Field | Required | Notes |
|------------|---------------|----------|-------|
| name | Name | ✅ Yes | Unique warehouse identifier |
| warehouse_name | Warehouse Name | ✅ Yes | Display name |
| parent_warehouse | Parent Warehouse | ⚠️ Optional | Must exist if specified |
| is_group | Is Group | ⚠️ Optional | 1 = group, 0 = storage location |
| company | Company | ✅ Yes | Must match your company name |
| disabled | Disabled | ⚠️ Optional | 0 = active, 1 = disabled |

**Important:** If your company name is NOT "Global Spectrum":
- You'll need to edit the CSV first
- Find/Replace "Global Spectrum" with your actual company name
- Or manually map during import

### Step 5: Import Settings

1. **Import Type:** Select **Insert New Records**
2. **Submit After Import:** ☑️ **Check this box** (auto-submit after import)
3. **Don't Send Emails:** ☑️ **Check this box** (prevent notification spam)

### Step 6: Start Import

1. Review the preview (first few rows shown)
2. Click **Start Import** button
3. ERPNext will begin processing the 207 records
4. Progress bar will show import status

**Expected time:** 2-3 minutes for 207 records

### Step 7: Monitor Import

Watch for:
- ✅ **Green checkmarks** = Successful imports
- ❌ **Red X marks** = Errors (see error messages)
- 📊 **Progress percentage**

**Common Errors and Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Parent Warehouse not found" | Missing parent | Create "Raw Materials - GSS" first |
| "Duplicate entry" | Warehouse already exists | Skip or update existing |
| "Company not found" | Wrong company name | Edit CSV with correct company |
| "Permission denied" | Insufficient rights | Contact admin for Stock Manager role |

### Step 8: Verify Import

After import completes:

1. Go back to **Stock → Warehouse** list
2. You should see:
   - ✅ Section 1 - GSS (group)
   - ✅ Section 2 - GSS (group)
   - ✅ Section 3 - GSS (group)
   - ✅ Section 5 - GSS (group)
   - ✅ Central Rack - GSS (group)

3. Click on **Section 1 - GSS** to expand
4. Verify child locations exist:
   - Section 1 - A1 - GSS
   - Section 1 - A2 - GSS
   - ... (96 total locations)

5. Repeat for other sections

### Step 9: Quick Test

**Test that locations are usable:**

1. Go to **Stock → Stock Entry → New**
2. Select **Material Transfer** as purpose
3. In the items table, try to select a location:
   - Source Warehouse: Type "Section 1" → Should show dropdown with all S1 locations
   - Target Warehouse: Type "Central Rack" → Should show CR locations
4. **Don't submit** - this is just a test
5. If you see the locations in dropdowns = ✅ Success!

---

## Rollback Instructions

**If import fails or you need to undo:**

### Option A: Delete Individual Warehouses (Safe)

1. Go to **Stock → Warehouse**
2. Find imported warehouses (e.g., "Section 1 - GSS")
3. Click warehouse name to open
4. Click **Delete** button
5. Repeat for all imported warehouses

⚠️ **Note:** You can only delete warehouses with no stock transactions

### Option B: Bulk Delete via Script (Advanced)

If many warehouses need deletion, use the ERPNext console:

1. Go to **Developer → Console**
2. Run this script:

```python
# Delete pilot warehouses
import frappe

warehouses_to_delete = [
    "Section 1 - GSS", "Section 2 - GSS", "Section 3 - GSS",
    "Section 5 - GSS", "Central Rack - GSS"
]

for wh_name in warehouses_to_delete:
    try:
        # Delete child warehouses first
        children = frappe.get_all("Warehouse", filters={"parent_warehouse": wh_name})
        for child in children:
            frappe.delete_doc("Warehouse", child.name, force=1)
        
        # Delete parent
        frappe.delete_doc("Warehouse", wh_name, force=1)
        print(f"✅ Deleted {wh_name}")
    except Exception as e:
        print(f"❌ Error deleting {wh_name}: {e}")

frappe.db.commit()
```

⚠️ **Use with caution!** This force-deletes warehouses.

---

## Post-Import Checklist

After successful import:

- [ ] All 5 section groups visible in warehouse list
- [ ] Can expand sections and see child locations
- [ ] Location dropdowns work in Stock Entry form
- [ ] No error messages in ERPNext log
- [ ] Warehouse tree structure looks correct
- [ ] Ready to start pilot testing with Central Rack

---

## Next Steps After Import

### Immediate (Day 1):
1. ✅ **Verify physical labels** - Check Central Rack has all 15 labels
2. ✅ **Test scanning** - Use phone camera to scan one barcode (CR-A1)
3. ✅ **Create test Stock Entry** - Manually enter one item to a location

### Week 1 (Pilot):
1. 📱 **Deploy PWA** - Scanning application for warehouse staff
2. 👥 **Train pilot users** - Central Rack and Section 5 staff
3. 📊 **Monitor errors** - Track scan failures and user feedback

### Week 2 (Scale):
1. 📦 **Deploy Sections 1-3** - Expand to larger areas
2. 🔧 **Refine workflows** - Adjust based on pilot learnings
3. 📈 **Measure KPIs** - Accuracy, speed, adoption rates

---

## Troubleshooting

### Problem: Import stuck or slow

**Solution:**
- Refresh browser page
- Check ERPNext system status
- Try importing in smaller batches (50 records at a time)

### Problem: Parent warehouse "Raw Materials - GSS" not found

**Solution:**
1. Create it manually first:
   - Go to Stock → Warehouse → New
   - Name: Raw Materials - GSS
   - Parent: All Warehouses - GSS
   - Is Group: Yes
   - Save
2. Re-run import

### Problem: Company name mismatch

**Solution:**
1. Check your company name: Setup → Company
2. Edit CSV file, replace "Global Spectrum" with actual company name
3. Re-upload and import

### Problem: Duplicate warehouses

**Solution:**
- During import, ERPNext will show which records are duplicates
- Choose to skip duplicates or update existing records

---

## Support

**Need help?**
- ERPNext Community: https://discuss.erpnext.com
- Frappe Support: support@frappe.io
- Project Team: Check with warehouse operations head

---

## Summary

**What you just imported:**
- ✅ 5 section groups (organizational structure)
- ✅ 169 storage locations (physical positions)
- ✅ Ready for scanning and tracking

**What's next:**
- Section 4 (28 locations) - After labels are printed
- PWA development - Scanning application
- Pilot testing - Central Rack validation

**Success criteria:**
- All warehouses visible in ERPNext
- Can select locations in Stock Entry
- Ready to track inventory by location

---

*Last Updated: October 6, 2025*  
*ERPNext Version: v15 (Frappe Cloud)*  
*Import File: erpnext-pilot-import.csv*




