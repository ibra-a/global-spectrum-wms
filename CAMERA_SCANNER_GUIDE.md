# 📱 Camera Barcode Scanner - Testing Guide

## ✅ What's Been Added

I've integrated **camera-based barcode scanning** into your WMS PWA! Now you can use your iPhone's camera to scan barcodes in real-time.

### Updated Pages:
- ✅ **Transfer** (`/transfer`)
- ✅ **Inbound Receipt** (`/inbound`)
- ✅ **Outbound Issue** (`/outbound`)

## 📸 How to Use the Camera Scanner

### Step 1: Open the PWA on Your iPhone
1. Open Safari on your iPhone
2. Navigate to: `http://[YOUR_COMPUTER_IP]:3000`
   - Find your computer's IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Example: `http://192.168.1.100:3000`

### Step 2: Test the Scanner

#### On Each Scan Field:
1. You'll see a **text input field** with a **blue camera icon** button next to it
2. You have **TWO OPTIONS**:
   - **Option A**: Type/paste the code manually (still works!)
   - **Option B**: Click the **camera icon** to open the camera scanner

#### Camera Scanner Interface:
1. Click the **📷 camera icon**
2. A **full-screen camera view** will open
3. Safari will ask for camera permission (allow it)
4. **Position the barcode** within the camera frame
5. The scanner will **automatically detect and scan** the barcode
6. Once scanned, the camera will **close automatically** and the workflow will continue

#### Close Scanner:
- Click the **X button** in the top-right corner to close the camera without scanning

## 🧪 Testing Workflow

### Test 1: Transfer with Camera
1. Open `/transfer`
2. **Step 1**: Click camera icon → Scan source location barcode
3. **Step 2**: Click camera icon → Scan item barcode (e.g., `GSS-RM-1000900`)
4. **Step 3**: Click camera icon → Scan destination location barcode
5. **Step 4**: Enter quantity
6. **Step 5**: Confirm and create draft

### Test 2: Inbound Receipt with Camera
1. Open `/inbound`
2. **Step 1**: Click camera icon → Scan item barcode
3. **Step 2**: Click camera icon → Scan destination location
4. **Step 3**: Enter quantity
5. **Step 4**: Confirm and create Material Receipt draft

### Test 3: Outbound Issue with Camera
1. Open `/outbound`
2. **Step 1**: Click camera icon → Scan item barcode
3. **Step 2**: Click camera icon → Scan source location
4. **Step 3**: Enter quantity (will validate against available stock)
5. **Step 4**: Confirm and create Material Issue draft

## 📋 What Works Now

✅ **Camera scanning** on all workflow pages  
✅ **Manual input** still works (for testing without physical barcodes)  
✅ **Auto-close** after successful scan  
✅ **Mobile-optimized** scanner interface  
✅ **Real-time barcode detection**  
✅ **ERPNext integration** (searches by `custom_barcode` field)

## 🔍 Technical Details

### Library Used:
- `react-qr-barcode-scanner` - Supports QR codes and 1D/2D barcodes
- Uses browser's native camera API
- Works on iOS Safari (with HTTPS or localhost)

### Camera Permissions:
- **First time**: Browser will ask for camera permission
- **After allowing**: Scanner will work immediately
- **If denied**: Use manual input instead

### Supported Barcode Formats:
- QR Codes
- Code 128
- Code 39
- EAN-13
- UPC-A
- And many more standard formats

## 🚨 Troubleshooting

### Camera Won't Open:
1. Make sure you're using **HTTPS** or **localhost**
   - iOS Safari requires secure context for camera
   - If testing on local network, you may need to set up HTTPS
2. Check camera permissions in Safari settings
3. Try reloading the page

### Scanner Doesn't Detect Barcode:
1. Ensure good lighting
2. Hold barcode steady and clear
3. Try different distances from camera
4. Make sure barcode is not damaged or blurry
5. Fallback: Use manual input

### Page Doesn't Load on iPhone:
1. Make sure iPhone and computer are on the **same WiFi network**
2. Make sure **both backend (port 8000) and frontend (port 3000) are running**
3. Check your computer's firewall settings

## 🎯 Next Steps

1. **Test with real barcodes** using your iPhone
2. **Verify ERPNext integration** - make sure items are found by barcode
3. **Check draft creation** - ensure Stock Entries are created correctly
4. **Test in different lighting conditions**
5. **Report any issues** with specific barcodes or workflows

## 📝 Notes

- The scanner component is **reusable** across all pages
- It's stored in: `wms-pwa/components/BarcodeScanner.tsx`
- You can easily add it to any new pages in the future
- Manual input is **always available** as a fallback

---

**Ready to Test!** 🚀

Open the PWA on your iPhone and try scanning some barcodes with the camera!




