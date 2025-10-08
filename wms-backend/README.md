# WMS Backend - FastAPI

Python backend for Global Spectrum WMS with native ERPNext integration.

## Quick Start

```bash
# Install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run server
python main.py
```

Server runs on: http://localhost:8000

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints

- `GET /` - Health check
- `GET /api/test-connection` - Test ERPNext connection
- `GET /api/warehouses` - Get all warehouses
- `GET /api/locations` - Get storage locations
- `GET /api/items/search?q={query}` - Search items
- `GET /api/stock-balance?item_code=X&warehouse=Y` - Get stock balance
- `POST /api/stock-entry` - Create stock entry
- `GET /api/purchase-orders` - Get open POs
- `GET /api/pick-lists` - Get pick lists

## Environment Variables

Create `.env` file:
```
ERPNEXT_URL=https://your-instance.frappe.cloud
ERPNEXT_API_KEY=your_key
ERPNEXT_API_SECRET=your_secret
```




