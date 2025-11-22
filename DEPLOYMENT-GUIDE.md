# Glengala Fresh - Deployment Guide for PythonAnywhere

## Overview
This guide will help you deploy the complete Glengala Fresh system with:
- Live pricing API
- Gamification features (streaks, loyalty points, challenges)
- PWA capabilities (offline support, home screen installation)
- Push notifications
- Social features

## Prerequisites
- PythonAnywhere account (Free or Paid)
- Basic understanding of Flask and web hosting

## Part 1: Backend API Setup

### Step 1: Upload Files to PythonAnywhere

1. **Go to PythonAnywhere Dashboard** → **Files** tab

2. **Create the following directory structure:**
   ```
   /home/yourusername/
   ├── glengala_ordering/          (your existing files)
   │   ├── shop.html
   │   ├── admin.html
   │   ├── shop-styles.css
   │   ├── gamification-styles.css
   │   ├── shop-functions-enhanced.js
   │   ├── live-pricing.js
   │   ├── gamification.js
   │   ├── checkout-system.js
   │   ├── translations.js
   │   ├── products-data.js
   │   ├── manifest.json
   │   ├── service-worker.js
   │   └── (all other existing files)
   └── api/
       ├── app.py
       ├── init_products.py
       └── requirements.txt
   ```

3. **Upload the API files:**
   - Upload `api/app.py` to `/home/yourusername/api/`
   - Upload `api/init_products.py` to `/home/yourusername/api/`
   - Upload `api/requirements.txt` to `/home/yourusername/api/`

### Step 2: Install Python Packages

1. **Open a Bash console** from PythonAnywhere dashboard

2. **Create a virtual environment:**
   ```bash
   mkvirtualenv --python=/usr/bin/python3.10 glengala-env
   ```

3. **Activate the environment:**
   ```bash
   workon glengala-env
   ```

4. **Install required packages:**
   ```bash
   cd ~/api
   pip install -r requirements.txt
   ```

### Step 3: Initialize Database

1. **Still in the Bash console, navigate to the API directory:**
   ```bash
   cd ~/api
   ```

2. **Update init_products.py with your full product list**
   - Copy all products from your `products-data.js`
   - Convert JavaScript format to Python dictionary format
   - Example:
   ```python
   {"id": 1, "name": "Beetroot", "category": "vegetables", "price": 2.49, ...}
   ```

3. **Run the initialization script:**
   ```bash
   python init_products.py
   python app.py
   ```
   This creates `glengala.db` with all your products.

### Step 4: Configure Web App

1. **Go to the Web tab** in PythonAnywhere

2. **Add a new web app:**
   - Click "Add a new web app"
   - Choose "Manual configuration"
   - Select Python 3.10

3. **Configure the WSGI file:**
   - Click on the WSGI configuration file link
   - Replace the entire contents with:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/yourusername'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

# Set environment variable for database path
os.environ['DATABASE_PATH'] = '/home/yourusername/api/glengala.db'

# Import Flask app
from api.app import app as application
```

4. **Set the virtual environment:**
   - In the Web tab, under "Virtualenv" section
   - Enter: `/home/yourusername/.virtualenvs/glengala-env`

5. **Configure static files mapping:**
   | URL                  | Directory                                    |
   |----------------------|----------------------------------------------|
   | `/static/`           | `/home/yourusername/glengala_ordering/`      |
   | `/manifest.json`     | `/home/yourusername/glengala_ordering/manifest.json` |
   | `/service-worker.js` | `/home/yourusername/glengala_ordering/service-worker.js` |
   | `/shop.html`         | `/home/yourusername/glengala_ordering/shop.html` |
   | `/admin.html`        | `/home/yourusername/glengala_ordering/admin.html` |

6. **Click the "Reload" button** at the top of the Web tab

### Step 5: Test the API

1. **Visit your API endpoints:**
   - `https://yourusername.pythonanywhere.com/api/products`
   - Should return JSON with all your products

2. **Test in browser console:**
   ```javascript
   fetch('/api/products')
     .then(r => r.json())
     .then(d => console.log(d));
   ```

## Part 2: Frontend Updates

### Step 1: Update API URLs in JavaScript Files

1. **Edit `live-pricing.js`:**
   - Change `apiBase = '/api'` to your full URL if needed
   - For PythonAnywhere free accounts, you may need to use absolute URLs

2. **Edit `gamification.js`:**
   - Update `apiBase = '/api'` similarly

### Step 2: Create App Icons

1. **Create two PNG icons:**
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
   - Use your Glengala logo
   - Upload to `/home/yourusername/glengala_ordering/`

2. **Optional: Create a badge icon:**
   - `badge-72.png` (72x72 pixels) for notifications

## Part 3: PWA Configuration

### Step 1: Test PWA Installation

1. **Open your site on mobile Chrome/Safari:**
   - `https://yourusername.pythonanywhere.com/shop.html`

2. **Look for "Add to Home Screen" prompt**
   - On Chrome: Menu → "Install app"
   - On iOS Safari: Share → "Add to Home Screen"

3. **Install and test:**
   - App should open in standalone mode
   - Test offline functionality (turn off wifi)
   - Prices should show cached data with offline indicator

### Step 2: Enable Push Notifications

1. **Get VAPID keys** (for production push notifications)
   - Use a service like Firebase Cloud Messaging
   - Or generate your own with web-push library

2. **Update service worker** with your VAPID keys

## Part 4: Admin Panel Updates

### Step 1: Add Price Management to Admin

1. **Create new admin panel section** for live pricing:
   - Button to manually refresh all prices
   - Interface to update individual product prices
   - Daily specials scheduler

2. **Add admin authentication:**
   - Simple password protection for admin routes
   - Update `app.py` to add auth middleware

Example admin update function:
```javascript
async function updateProductPrice(productId, newPrice) {
    await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
        },
        body: JSON.stringify({ price: newPrice })
    });
}
```

## Part 5: Testing Checklist

- [ ] Products load from API correctly
- [ ] Prices update when refreshed
- [ ] Offline mode works (shows cached prices)
- [ ] PWA installs on mobile
- [ ] Gamification displays user stats
- [ ] Orders create successfully
- [ ] Loyalty points accumulate
- [ ] Streaks track correctly
- [ ] Favorites save/load
- [ ] Admin can update prices
- [ ] Daily specials display
- [ ] Stock status updates
- [ ] Notifications work (if configured)

## Part 6: Optimization & Monitoring

### Database Optimization
```python
# Add indexes for faster queries
c.execute('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)')
c.execute('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)')
c.execute('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)')
```

### Monitoring
- Check error logs: PythonAnywhere Dashboard → Web → Log files
- Monitor API response times
- Track database growth
- Set up automated backups of `glengala.db`

## Part 7: Future Enhancements

### Phase 1 (Immediate)
- [ ] Admin authentication
- [ ] Order confirmation emails
- [ ] SMS notifications for orders

### Phase 2 (Near-term)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Automated inventory tracking
- [ ] Customer reviews and ratings
- [ ] Recipe suggestions based on cart items

### Phase 3 (Long-term)
- [ ] AI-powered produce recommendations
- [ ] Subscription boxes
- [ ] Referral program
- [ ] Mobile apps (iOS/Android)

## Troubleshooting

### Issue: API returns 500 error
- Check error logs in PythonAnywhere
- Verify database path is correct
- Ensure all packages are installed in virtual environment

### Issue: PWA doesn't install
- Verify manifest.json is accessible
- Check service-worker.js has no syntax errors
- Ensure HTTPS is enabled (automatic on PythonAnywhere)

### Issue: Prices don't update
- Check network tab for API calls
- Verify CORS is configured correctly
- Test API endpoints directly in browser

### Issue: Database locked errors
- SQLite doesn't handle high concurrency well
- Consider upgrading to MySQL for production
- Add connection pooling

## Support & Maintenance

### Daily Tasks
- Review new orders
- Update product availability
- Check for low stock items
- Monitor gamification challenges

### Weekly Tasks
- Set daily specials for next week
- Review and respond to customer feedback
- Analyze trending products
- Back up database

### Monthly Tasks
- Update seasonal products
- Review loyalty program effectiveness
- Optimize pricing based on demand
- Update PWA assets if needed

## Contact & Resources

- PythonAnywhere Help: https://help.pythonanywhere.com/
- Flask Documentation: https://flask.palletsprojects.com/
- PWA Guide: https://web.dev/progressive-web-apps/
- Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

## Quick Start Summary

1. Upload all files to PythonAnywhere
2. Install Flask and Flask-CORS
3. Initialize database with products
4. Configure WSGI file
5. Set up static file mappings
6. Reload web app
7. Test all features
8. Install PWA on mobile device
9. Start taking orders! 🎉

**Remember:** The system maintains the same visual layout while adding powerful backend features for live pricing, gamification, and offline support. Your customers will love the enhanced experience!
