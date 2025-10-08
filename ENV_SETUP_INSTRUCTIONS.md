# ERPNext API Setup Instructions

## Getting Your API Credentials

### Method 1: API Key & Secret (Recommended)

1. Log into your ERPNext instance as Administrator
2. Go to: **User Menu (top right)** → **My Settings**
3. Scroll down to **API Access** section
4. Click **Generate Keys** button
5. Copy both the **API Key** and **API Secret** (save the secret - it's only shown once!)

### Method 2: Create API Key for Service Account

1. Go to **Users** list
2. Create or select a user for the WMS integration
3. In the user form, scroll to **API Access**
4. Click **Generate Keys**
5. Assign roles: Stock User, Stock Manager, Warehouse Manager

## Required Permissions

Your API user needs these roles:
- ✅ Stock User (minimum)
- ✅ Stock Manager (for creating Stock Entries)
- ✅ Warehouse Manager (for warehouse/bin access)

## Create Your .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```bash
   ERPNEXT_URL=https://your-company.erpnext.com
   ERPNEXT_API_KEY=1a2b3c4d5e6f7g8h
   ERPNEXT_API_SECRET=9i0j1k2l3m4n5o6p
   ```

3. **Important:** Never commit `.env` to git (already in .gitignore)

## Test Your Connection

Run the test script:
```bash
npm run test:erpnext
```

This will:
- ✅ Connect to your ERPNext instance
- ✅ Fetch all warehouses
- ✅ Check for bins (location tracking)
- ✅ Verify custom fields on Stock Entry
- ✅ Generate warehouse structure suggestions
- ✅ Save results to `docs/erpnext-structure.json`

## Troubleshooting

### Error: "Invalid API Key"
- Regenerate API keys in ERPNext
- Ensure no spaces in .env file
- Check URL has no trailing slash

### Error: "Permission Denied"
- Assign Stock Manager role to API user
- Check user is not disabled
- Verify user has access to warehouses

### Error: "Connection Refused"
- Check ERPNext URL is correct
- Ensure ERPNext is accessible from your network
- Try accessing the URL in browser first

## What Happens Next?

Once connected, the Analyst agent will:
1. 📊 Compare your CSV locations vs ERPNext reality
2. 🔍 Identify gaps (locations to create)
3. 📝 Update PRD/Architecture with actual structure
4. 🚀 Generate migration scripts if needed




