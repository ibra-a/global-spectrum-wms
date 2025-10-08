# ERPNext Custom Fields Setup Guide

## Overview
This guide shows you how to add the required custom fields for the WMS offline sync functionality.

**Time Required:** 5 minutes  
**Difficulty:** Easy  
**When to Do This:** Before implementing offline sync (can be done anytime)

---

## Fields to Create

### 1. Stock Entry.idempotency_key
**Purpose:** Prevents duplicate stock movements when offline queue retries  
**Importance:** CRITICAL for offline sync reliability

### 2. Pick List.external_ref
**Purpose:** Links PWA pick sessions to ERPNext Pick Lists  
**Importance:** Optional but recommended

---

## Step-by-Step Instructions

### **Field 1: Stock Entry - idempotency_key**

#### Step 1: Open Customize Form
1. In ERPNext, click the **search bar** at the top (or press `Ctrl/Cmd + K`)
2. Type: **"Customize Form"**
3. Press **Enter**
4. You'll see the "Customize Form" tool open

#### Step 2: Select Stock Entry DocType
1. In the **"Enter Form Type"** field, type: **"Stock Entry"**
2. Select **"Stock Entry"** from the dropdown
3. The form will load showing all Stock Entry fields

#### Step 3: Scroll to Custom Fields Section
1. Scroll down past all the standard fields
2. Find the section labeled **"Custom Fields"**
3. You'll see a table with columns: Label, Type, Name, etc.

#### Step 4: Add the Custom Field
1. Click the **"+ Add Row"** button at the bottom of the Custom Fields table
2. A new empty row will appear

#### Step 5: Fill in the Field Details
Fill in these values in the new row:

| Field | Value |
|-------|-------|
| **Label** | `Idempotency Key` |
| **Type** | `Data` (select from dropdown) |
| **Name** | `idempotency_key` (auto-fills, but verify) |
| **Options** | (leave empty) |
| **Insert After** | `naming_series` (or leave as default) |

#### Step 6: Set Field Properties
In the same row, check these checkboxes:

- ✅ **Unique** - CRITICAL! This prevents duplicate entries
- ✅ **Read Only** - Field is set by app, not users
- ✅ **Print Hide** - Don't show on printed documents
- ☐ **Hidden** - Leave UNCHECKED (we want to see it for debugging)
- ☐ **Mandatory** - Leave UNCHECKED

#### Step 7: Add Description (Optional but Recommended)
In the **Description** field of the row:
```
Unique key to prevent duplicate entries during offline sync
```

#### Step 8: Save the Changes
1. Scroll to the **top** of the page
2. Click the **"Update"** button (blue button, top-right)
3. Wait for the success message
4. ✅ Field is now created!

---

### **Field 2: Pick List - external_ref**

#### Step 1: Change DocType
1. Still in Customize Form
2. In the **"Enter Form Type"** field, clear it and type: **"Pick List"**
3. Select **"Pick List"** from the dropdown

#### Step 2: Scroll to Custom Fields
1. Scroll down to the **"Custom Fields"** section
2. Click **"+ Add Row"**

#### Step 3: Fill in Field Details

| Field | Value |
|-------|-------|
| **Label** | `External Reference` |
| **Type** | `Data` |
| **Name** | `external_ref` |
| **Insert After** | `name` (or leave default) |

#### Step 4: Set Properties
Check these:

- ✅ **Print Hide**
- ☐ **Unique** - Leave UNCHECKED (can have duplicates)
- ☐ **Read Only** - Leave UNCHECKED (users can edit)
- ☐ **Hidden** - Leave UNCHECKED

#### Step 5: Add Description
```
Reference ID from external scanning application (PWA)
```

#### Step 6: Save
1. Scroll to top
2. Click **"Update"** button
3. ✅ Done!

---

## Verification

### Verify Field 1: Stock Entry
1. Go to **Stock → Stock Entry → New**
2. Look for **"Idempotency Key"** field
3. It should be visible but **read-only** (greyed out)
4. ✅ If you see it, the field is created correctly!

### Verify Field 2: Pick List
1. Go to **Stock → Pick List → New**
2. Look for **"External Reference"** field
3. It should be visible and editable
4. ✅ If you see it, success!

---

## Troubleshooting

### "Update button is disabled"
**Solution:** Make sure you've filled in at least the Label and Type fields

### "Duplicate field name" error
**Solution:** The field already exists! No need to create it again.

### Can't find "Customize Form"
**Solution:** 
- Try searching for "Customization" instead
- Or navigate: Setup → Customize → Customize Form

### Field not showing after creation
**Solution:** 
- Reload the Stock Entry / Pick List form
- Clear browser cache and refresh
- Log out and log back in

### "Permission Denied" error
**Solution:** Your user needs "System Manager" or "Customize Form" permission. Ask your ERPNext administrator.

---

## When Do I Need These Fields?

### Immediate (Before Pilot)
- ❌ **Not required** - You can test scanning without them

### Before Phase 1B (Section 1-3 rollout)
- ⚠️ **Recommended** - Start adding for safety

### Before Production
- ✅ **REQUIRED** - Must have for reliable offline sync

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│ FIELD 1: Stock Entry.idempotency_key                    │
├─────────────────────────────────────────────────────────┤
│ Label:     Idempotency Key                              │
│ Type:      Data                                         │
│ Unique:    ✅ YES (CRITICAL!)                           │
│ Read Only: ✅ YES                                       │
│ Hidden:    ☐ No                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FIELD 2: Pick List.external_ref                         │
├─────────────────────────────────────────────────────────┤
│ Label:     External Reference                           │
│ Type:      Data                                         │
│ Unique:    ☐ No                                         │
│ Read Only: ☐ No                                         │
│ Hidden:    ☐ No                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Video Tutorial (If Needed)

If you need visual help:
1. Search YouTube: "ERPNext add custom field"
2. Or check ERPNext documentation: https://docs.erpnext.com/docs/user/manual/en/customize-erpnext/custom-field

---

*Last Updated: October 6, 2025*  
*ERPNext Version: v15*




