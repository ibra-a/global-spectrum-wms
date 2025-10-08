# 🚀 DEPLOY TO RAILWAY NOW

## Step 1: Go to Railway
https://railway.app/new

## Step 2: Deploy from GitHub
1. Click "Deploy from GitHub repo"
2. Select your WMS repository
3. Railway will auto-detect Python

## Step 3: Add Environment Variables
In the Variables tab, add these EXACT values:

```
ERPNEXT_URL=https://globalspectrumsarl.frappe.cloud
ERPNEXT_API_KEY=b60d41b0548458b
ERPNEXT_API_SECRET=9c044268b56743d
```

## Step 4: Wait for Deployment
- Takes 2-3 minutes
- You'll get a URL like: https://wms-backend-production-abc123.railway.app

## Step 5: Test the URL
Visit: https://your-railway-url.railway.app
You should see: {"status":"ok","service":"Global Spectrum WMS API"}

## Next: Update Vercel
Copy your Railway URL and update Vercel environment variable:
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
