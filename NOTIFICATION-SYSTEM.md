# Push Notification System - On-Demand & In-App Alerts

## Overview
The notification system now works in TWO ways:

### 1. In-App Notifications (Always Active)
When users open the shop, they automatically see price changes as floating notifications - **no permission needed**.

**Features:**
- Shows price changes from last 7 days
- Beautiful slide-in animations
- Color-coded (green for drops, orange for increases)
- Shows percentage change
- Tap to scroll to product
- Auto-dismisses after 8 seconds
- Works even if push notifications are disabled

**Files:**
- `in-app-notifications.js` - Displays notifications when app opens
- Checks `/api/price-changes` endpoint
- Stores seen changes in localStorage

### 2. Push Notifications (On-Demand, Admin Controlled)
Push notifications are **NOT sent automatically**. Admin must manually trigger them.

**Features:**
- Admin panel shows pending price changes
- "Send Notifications Now" button sends to all subscribers
- Only sends unnotified changes
- Less intrusive: prompts users after 2 minutes of browsing
- Requires user permission

**Admin Panel:**
- New "🔔 Push Notifications" section in admin.html
- Shows count of pending price changes (last 24h)
- Manual send button
- Success/error feedback

## How It Works

### When Admin Updates a Price:
1. Price change is saved to `price_changes` table
2. Marked as `notified = 0` (not sent yet)
3. **NO notification sent automatically**

### When User Opens Shop:
1. In-app notification system checks `/api/price-changes`
2. Shows any new price changes as floating notifications
3. User sees updates immediately (no push needed)

### When Admin Sends Notifications:
1. Admin clicks "📢 Send Notifications Now" in admin panel
2. API fetches all `notified = 0` price changes
3. Sends push notifications to all subscribed users
4. Marks changes as `notified = 1`

## API Endpoints

### `GET /api/price-changes?since=<timestamp>`
Returns recent price changes for in-app display
```json
[
  {
    "id": 1,
    "product_id": 42,
    "product_name": "Tomatoes",
    "old_price": 3.99,
    "new_price": 2.99,
    "changed_at": "2025-11-16T14:30:00",
    "photo": "tomatoes.jpg"
  }
]
```

### `POST /api/send-price-notifications`
Manually sends push notifications for unnotified changes
```json
{
  "success": true,
  "message": "Sent 5 price update(s) to 23 subscriber(s)",
  "changes": [...],
  "subscribers": 23
}
```

### `POST /api/mark-changes-seen`
Marks changes as seen by user (for future per-user tracking)
```json
{
  "change_ids": [1, 2, 3]
}
```

## Database Schema

### `price_changes` Table
```sql
CREATE TABLE price_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    old_price REAL NOT NULL,
    new_price REAL NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
)
```

## User Experience

### Scenario 1: Push Notifications Disabled
- User opens shop app from home screen
- Sees in-app floating notifications for any price changes
- Can tap to view product details
- Gets all the info without push permission

### Scenario 2: Push Notifications Enabled
- User has granted push permission
- Admin updates prices during the day
- Admin clicks "Send Notifications Now" at 5 PM
- User receives push notification on locked screen
- When they open app, also sees in-app notifications

## Benefits

✅ **No notification spam** - Admin controls when to send
✅ **Always informed** - In-app alerts work without permission
✅ **User choice** - Can disable push but still get updates
✅ **Better UX** - Less intrusive, more control
✅ **Admin control** - Batch notifications at optimal times

## Testing

1. **Test In-App Notifications:**
   - Update a product price in admin
   - Refresh shop.html
   - Should see floating notification

2. **Test Admin Panel:**
   - Open admin.html
   - Expand "🔔 Push Notifications" section
   - Should show pending changes
   - Click "Send Notifications Now"

3. **Test Push (when VAPID keys configured):**
   - Enable notifications in shop
   - Update price in admin
   - Send notifications from admin panel
   - Should receive push notification

## Next Steps

To enable actual push sending:
1. Install: `pip install py-vapid pywebpush`
2. Generate keys: `python -m py_vapid --gen`
3. Add keys to `push-notifications.js` and `app.py`
4. Implement pywebpush sending in `/api/send-price-notifications`

## Files Modified

- ✅ `api/app.py` - Added price_changes table, manual send endpoint
- ✅ `in-app-notifications.js` - NEW - In-app notification display
- ✅ `push-notifications.js` - Updated to be less intrusive (2 min delay)
- ✅ `admin.html` - Added notification management section
- ✅ `admin-functions.js` - Added send notification functions
- ✅ `shop.html` - Added in-app-notifications.js script
- ✅ Database - Added price_changes table
