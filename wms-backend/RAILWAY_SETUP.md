# Railway Deployment Setup

## Environment Variables Required

Set these in Railway dashboard:

```
ERPNEXT_URL=https://globalspectrumsarl.frappe.cloud
ERPNEXT_API_KEY=your_api_key_here
ERPNEXT_API_SECRET=your_api_secret_here
```

Railway will automatically set:
- `PORT` (dynamic port assignment)

## Deployment Commands

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Files Created for Railway:
- `Procfile` - Defines how to start the app
- `railway.toml` - Railway configuration
- `requirements.txt` - Python dependencies (already exists)
