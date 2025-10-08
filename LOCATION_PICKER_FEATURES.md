# 📍 Smart Location Picker - Features

## Overview
The LocationPicker component provides an intelligent, visual way to select warehouse locations with real-time stock information.

## ✨ Key Features

### 1. **Visual Section Selection**
- Large, tappable buttons for each section (Section 1-5, Central Rack)
- 2-column grid layout for mobile optimization
- Clear visual feedback on selection

### 2. **Smart Stock Display** (Outbound & Transfer)
- **Real-time stock queries** for the selected item across all locations
- **Color-coded indicators:**
  - 🟢 Green background + border = Has stock (shows quantity)
  - ⚪ White/gray = Empty or no stock (shows "0 units")
- **Stock badges** show exact quantity per location

### 3. **Search & Filter**
- Search bar to filter locations within selected section
- Type "A1", "Rack 1", etc. to narrow down options
- Instant filtering as you type

### 4. **Recent Locations**
- Saves your 5 most recently used locations
- Quick-access buttons at the top
- Persists across sessions (localStorage)

### 5. **Dual Input Modes**
- **Picker Mode** (default): Visual selection with buttons
- **Scan Mode**: Switch to barcode scanner for labeled locations
- Easy toggle between modes

## 🎯 Usage by Workflow

### **Inbound (Material Receipt)**
```typescript
<LocationPicker
  onLocationSelect={handleLocationScan}
  label="Destination Location"
  placeholder="Select or scan location..."
  itemCode={itemCode}
  showStock={false}  // Don't show stock for incoming items
/>
```
- Select where to put incoming stock
- No stock display needed (item is coming in)

### **Outbound (Material Issue)**
```typescript
<LocationPicker
  onLocationSelect={handleLocationScan}
  label="Source Location"
  placeholder="Select or scan location..."
  itemCode={itemCode}
  showStock={true}  // ✅ Show stock to pick from
/>
```
- **Green locations** = Has stock (can issue from here)
- **Gray locations** = Empty (can't issue from here)
- Shows exact quantity available at each location

### **Transfer (Stock Movement)**
```typescript
// Source location
<LocationPicker
  onLocationSelect={handleSourceSelect}
  label="FROM Location"
  itemCode={itemCode}
  showStock={true}  // ✅ Show current stock
/>

// Destination location
<LocationPicker
  onLocationSelect={handleDestSelect}
  label="TO Location"
  itemCode={itemCode}
  showStock={true}  // ✅ Show stock at destination too
/>
```
- Source: Shows where stock currently is
- Destination: Shows current stock (avoid overloading)

## 🎨 Visual Design

### Section Buttons
```
┌─────────────┬─────────────┐
│  Section 1  │  Section 2  │
│             │             │
└─────────────┴─────────────┘
┌─────────────┬─────────────┐
│  Section 3  │  Section 4  │
└─────────────┴─────────────┘
```

### Location Grid (with stock)
```
┌────────────┬────────────┬────────────┐
│     A1     │     A2     │     A3     │
│  15 units  │   0 units  │   8 units  │
│ 🟢 GREEN   │  ⚪ GRAY   │ 🟢 GREEN   │
└────────────┴────────────┴────────────┘
```

## 🚀 Performance

- **Parallel stock queries** using `Promise.all()`
- Only fetches stock when `showStock={true}` and `itemCode` is provided
- Caches stock data per section selection
- Efficient filtering and search

## 📱 Mobile Optimization

- Large tap targets (44px+ height)
- 3-column grid for optimal screen usage
- Scrollable location grid (max-height with overflow)
- Touch-friendly spacing

## 🔄 State Management

- Loads all warehouses from ERPNext API
- Filters parent sections (is_group = 1)
- Filters sub-locations (is_group = 0)
- Real-time stock balance queries per location
- Recent locations saved to localStorage

## 🐛 Error Handling

- Graceful fallback if API fails
- Shows "0 units" if stock query fails
- Console logging for debugging
- No blocking errors

## 🎓 User Benefits

1. **No Typos**: All locations are pre-loaded, just tap to select
2. **Visual Guidance**: Green = good to go, Gray = empty
3. **Speed**: 2 taps vs. typing 20+ characters
4. **Confidence**: See exact stock before picking
5. **Smart**: Suggests best locations with available stock

## 📊 Technical Details

### Props
```typescript
interface LocationPickerProps {
  onLocationSelect: (locationName: string) => void;
  placeholder?: string;
  label?: string;
  showStock?: boolean;     // Enable stock display
  itemCode?: string;        // Item to show stock for
}
```

### Stock Data Structure
```typescript
stockData: Record<string, number> = {
  "Section 1 - A1 - GSS": 15,
  "Section 1 - A2 - GSS": 0,
  "Section 1 - A3 - GSS": 8,
  // ...
}
```

### API Calls
- `/api/locations` - Get all warehouses (one-time)
- `/api/stock-balance?item_code=X&warehouse=Y` - Get stock per location (on-demand)

## ✅ Complete Integration

Currently integrated into:
- ✅ Inbound page (destination location)
- ✅ Outbound page (source location with stock display)
- ✅ Transfer page (source and destination with stock display)

## 🎉 Result

A professional, user-friendly WMS interface that prevents errors and guides users to make correct decisions! 🚀



