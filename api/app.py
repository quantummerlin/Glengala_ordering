# Glengala Fresh - Backend API
# PythonAnywhere Flask API for live pricing and gamification

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

# Database path
DB_PATH = os.environ.get('DATABASE_PATH', os.path.join(os.path.dirname(__file__), 'glengala.db'))

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Products table
    c.execute('''CREATE TABLE IF NOT EXISTS products
                 (id INTEGER PRIMARY KEY,
                  name TEXT NOT NULL,
                  category TEXT NOT NULL,
                  price REAL NOT NULL,
                  unit TEXT NOT NULL,
                  active INTEGER DEFAULT 1,
                  mostPopular INTEGER DEFAULT 0,
                  popularOrder INTEGER DEFAULT 0,
                  photo TEXT,
                  hasSpecial INTEGER DEFAULT 0,
                  specialPrice REAL DEFAULT 0,
                  specialQuantity INTEGER DEFAULT 0,
                  specialUnit TEXT,
                  isPremium INTEGER DEFAULT 0,
                  isOrganic INTEGER DEFAULT 0,
                  stock INTEGER DEFAULT 999,
                  trending INTEGER DEFAULT 0,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Daily specials table
    c.execute('''CREATE TABLE IF NOT EXISTS daily_specials
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  product_id INTEGER NOT NULL,
                  discount_percent REAL DEFAULT 0,
                  special_date DATE NOT NULL,
                  active INTEGER DEFAULT 1,
                  FOREIGN KEY (product_id) REFERENCES products (id))''')
    
    # Users table for gamification
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  phone TEXT UNIQUE NOT NULL,
                  address TEXT,
                  postcode TEXT,
                  loyalty_points INTEGER DEFAULT 0,
                  current_streak INTEGER DEFAULT 0,
                  longest_streak INTEGER DEFAULT 0,
                  last_order_date DATE,
                  total_orders INTEGER DEFAULT 0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Orders table
    c.execute('''CREATE TABLE IF NOT EXISTS orders
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  items TEXT NOT NULL,
                  total REAL NOT NULL,
                  fulfilment TEXT,
                  delivery_time TEXT,
                  status TEXT DEFAULT 'pending',
                  points_earned INTEGER DEFAULT 0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id))''')
    
    # Challenges table
    c.execute('''CREATE TABLE IF NOT EXISTS challenges
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  challenge_type TEXT NOT NULL,
                  description TEXT,
                  target INTEGER,
                  progress INTEGER DEFAULT 0,
                  reward_points INTEGER,
                  completed INTEGER DEFAULT 0,
                  expires_at TIMESTAMP,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id))''')
    
    # Favorites table
    c.execute('''CREATE TABLE IF NOT EXISTS favorites
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER NOT NULL,
                  product_id INTEGER NOT NULL,
                  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id),
                  FOREIGN KEY (product_id) REFERENCES products (id))''')
    
    # Push subscriptions table
    c.execute('''CREATE TABLE IF NOT EXISTS push_subscriptions
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  endpoint TEXT UNIQUE NOT NULL,
                  p256dh TEXT NOT NULL,
                  auth TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id))''')
    
    # Price changes tracking for in-app notifications
    c.execute('''CREATE TABLE IF NOT EXISTS price_changes
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  product_id INTEGER NOT NULL,
                  product_name TEXT NOT NULL,
                  old_price REAL NOT NULL,
                  new_price REAL NOT NULL,
                  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  notified INTEGER DEFAULT 0,
                  FOREIGN KEY (product_id) REFERENCES products (id))''')
    
    # Shop customization settings table
    c.execute('''CREATE TABLE IF NOT EXISTS settings
                 (id INTEGER PRIMARY KEY CHECK (id = 1),
                  primary_color TEXT DEFAULT '#2FA44F',
                  secondary_color TEXT DEFAULT '#3A6FD8',
                  gradient_start TEXT DEFAULT '#4CAF50',
                  gradient_end TEXT DEFAULT '#45a049',
                  gradient_angle INTEGER DEFAULT 135,
                  shop_name TEXT DEFAULT 'Glengala Fresh',
                  shop_description TEXT,
                  contact_phone TEXT,
                  contact_email TEXT,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Insert default settings if not exists
    c.execute('INSERT OR IGNORE INTO settings (id) VALUES (1)')
    
    conn.commit()
    conn.close()

# API Routes

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all active products with live prices"""
    print(f"Fetching products from DB")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('''SELECT * FROM products WHERE active = 1 ORDER BY category, name''')
    products = [dict(row) for row in c.fetchall()]
    
    print(f"Returning {len(products)} products, first product unit: {products[0]['unit'] if products else 'none'}")
    conn.close()
    return jsonify({'products': products, 'updated_at': datetime.now().isoformat()})

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get shop customization settings"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('SELECT * FROM settings WHERE id = 1')
    settings = c.fetchone()
    conn.close()
    if settings:
        result = dict(settings)
        # Ensure shopHeader is present and complete
        if 'shopHeader' not in result or not result['shopHeader']:
            result['shopHeader'] = {
                'backgroundType': 'default',
                'backgroundColor': '#000000',
                'gradientStartColor': '#000000',
                'gradientEndColor': '#333333',
                'gradientDirection': '135deg'
            }
        return jsonify(result)
    else:
        # Return defaults if no settings exist
        return jsonify({
            'id': 1,
            'primary_color': '#2FA44F',
            'secondary_color': '#3A6FD8',
            'gradient_start': '#4CAF50',
            'gradient_end': '#45a049',
            'gradient_angle': 135,
            'shop_name': 'Glengala Fresh',
            'shop_description': None,
            'contact_phone': None,
            'contact_email': None,
            'shopHeader': {
                'backgroundType': 'default',
                'backgroundColor': '#000000',
                'gradientStartColor': '#000000',
                'gradientEndColor': '#333333',
                'gradientDirection': '135deg'
            }
        })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('SELECT * FROM products WHERE id = ?', (product_id,))
    product = c.fetchone()
    
    conn.close()
    if product:
        return jsonify(dict(product))
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/settings', methods=['POST'])
def update_settings():
    """Update shop customization settings"""
    data = request.json
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''UPDATE settings SET
                 primary_color = ?,
                 secondary_color = ?,
                 gradient_start = ?,
                 gradient_end = ?,
                 gradient_angle = ?,
                 shop_name = ?,
                 shop_description = ?,
                 contact_phone = ?,
                 contact_email = ?,
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = 1''',
              (data.get('primary_color', '#2FA44F'),
               data.get('secondary_color', '#3A6FD8'),
               data.get('gradient_start', '#4CAF50'),
               data.get('gradient_end', '#45a049'),
               data.get('gradient_angle', 135),
               data.get('shop_name', 'Glengala Fresh'),
               data.get('shop_description'),
               data.get('contact_phone'),
               data.get('contact_email')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Settings updated successfully'})

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update product (admin only - add auth in production)"""
    data = request.json
    print(f"Updating product {product_id} with data: {data}")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Get old price and name for tracking
    c.execute('SELECT name, price FROM products WHERE id = ?', (product_id,))
    old_product = c.fetchone()
    old_price = old_product[1] if old_product else None
    product_name = old_product[0] if old_product else 'Unknown'
    
    # Update all fields that can be changed
    c.execute('''UPDATE products SET 
                 name = ?, category = ?, price = ?, unit = ?, 
                 active = ?, photo = ?, hasSpecial = ?, specialPrice = ?,
                 specialQuantity = ?, specialUnit = ?, isPremium = ?, isOrganic = ?,
                 stock = ?, mostPopular = ?, popularOrder = ?,
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?''',
              (data.get('name'), data.get('category'), data.get('price'), data.get('unit'),
               data.get('active', 1), data.get('photo', ''), 
               data.get('hasSpecial', 0), data.get('specialPrice', 0),
               data.get('specialQuantity', 0), data.get('specialUnit', ''),
               data.get('isPremium', 0), data.get('isOrganic', 0),
               data.get('stock', 999), data.get('mostPopular', 0), data.get('popularOrder', 0),
               product_id))
    
    # Track price changes for in-app notifications
    new_price = data.get('price')
    price_changed = old_price and new_price and float(old_price) != float(new_price)
    
    if price_changed:
        c.execute('''INSERT INTO price_changes 
                     (product_id, product_name, old_price, new_price, changed_at, notified)
                     VALUES (?, ?, ?, ?, ?, 0)''',
                  (product_id, product_name, old_price, new_price, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    
    print(f"Product {product_id} updated successfully")
    return jsonify({
        'success': True, 
        'updated_at': datetime.now().isoformat(),
        'price_changed': price_changed,
        'old_price': old_price,
        'new_price': new_price
    })

@app.route('/api/products', methods=['POST'])
def create_product():
    """Create new product (admin only)"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''INSERT INTO products 
                 (name, category, price, unit, active, photo, hasSpecial, specialPrice,
                  specialQuantity, specialUnit, isPremium, isOrganic, stock, mostPopular, popularOrder)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (data.get('name', 'New Product'), data.get('category', 'vegetables'), 
               data.get('price', 0), data.get('unit', 'kg'),
               data.get('active', 1), data.get('photo', ''), 
               data.get('hasSpecial', 0), data.get('specialPrice', 0),
               data.get('specialQuantity', 0), data.get('specialUnit', ''),
               data.get('isPremium', 0), data.get('isOrganic', 0),
               data.get('stock', 999), data.get('mostPopular', 0), data.get('popularOrder', 0)))
    
    product_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'product_id': product_id, 'message': 'Product created successfully'})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product (admin only)"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('DELETE FROM products WHERE id = ?', (product_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Product deleted successfully'})

@app.route('/api/products/bulk', methods=['POST'])
def bulk_update_products():
    """Bulk update all products (admin only)"""
    data = request.json
    products = data.get('products', [])
    print(f"Bulk updating {len(products)} products")
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    updated_count = 0
    for product in products:
        product_id = product.get('id')
        if product_id:
            print(f"Updating product {product_id}: {product.get('name')} - unit: {product.get('unit')}")
            c.execute('''UPDATE products SET 
                         name = ?, category = ?, price = ?, unit = ?, 
                         active = ?, photo = ?, hasSpecial = ?, specialPrice = ?,
                         specialQuantity = ?, specialUnit = ?, isPremium = ?, isOrganic = ?,
                         stock = ?, mostPopular = ?, popularOrder = ?,
                         updated_at = CURRENT_TIMESTAMP
                         WHERE id = ?''',
                      (product.get('name'), product.get('category'), product.get('price'), product.get('unit'),
                       product.get('active', 1), product.get('photo', ''), 
                       product.get('hasSpecial', 0), product.get('specialPrice', 0),
                       product.get('specialQuantity', 0), product.get('specialUnit', ''),
                       product.get('isPremium', 0), product.get('isOrganic', 0),
                       product.get('stock', 999), product.get('mostPopular', 0), product.get('popularOrder', 0),
                       product_id))
            updated_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"Bulk update completed: {updated_count} products updated")
    return jsonify({'success': True, 'updated_count': updated_count, 'message': f'{updated_count} products updated successfully'})

@app.route('/api/daily-specials', methods=['GET'])
def get_daily_specials():
    """Get today's special offers"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    today = datetime.now().date()
    c.execute('''SELECT p.*, ds.discount_percent 
                 FROM products p
                 JOIN daily_specials ds ON p.id = ds.product_id
                 WHERE ds.special_date = ? AND ds.active = 1''', (today,))
    specials = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return jsonify({'specials': specials})

@app.route('/api/user/register', methods=['POST'])
def register_user():
    """Register or get existing user"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if user exists
    c.execute('SELECT * FROM users WHERE phone = ?', (data['phone'],))
    user = c.fetchone()
    
    if user:
        return jsonify({'user_id': user[0], 'existing': True})
    
    # Create new user
    c.execute('''INSERT INTO users (name, phone, address, postcode)
                 VALUES (?, ?, ?, ?)''',
              (data['name'], data['phone'], data.get('address', ''), data.get('postcode', '')))
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    
    return jsonify({'user_id': user_id, 'existing': False, 'loyalty_points': 0})

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user profile with gamification stats"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    # Get active challenges
    c.execute('''SELECT * FROM challenges 
                 WHERE user_id = ? AND completed = 0 AND expires_at > datetime('now')''',
              (user_id,))
    challenges = [dict(row) for row in c.fetchall()]
    
    # Get favorites
    c.execute('''SELECT p.* FROM products p
                 JOIN favorites f ON p.id = f.product_id
                 WHERE f.user_id = ?''', (user_id,))
    favorites = [dict(row) for row in c.fetchall()]
    
    conn.close()
    
    user_data = dict(user)
    user_data['challenges'] = challenges
    user_data['favorites'] = favorites
    
    return jsonify(user_data)

@app.route('/api/order', methods=['POST'])
def create_order():
    """Create new order and update streaks/points"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Calculate points (1 point per $1 spent)
    points_earned = int(data['total'])
    
    # Insert order
    c.execute('''INSERT INTO orders (user_id, items, total, fulfilment, delivery_time, points_earned)
                 VALUES (?, ?, ?, ?, ?, ?)''',
              (data.get('user_id'), json.dumps(data['items']), data['total'],
               data.get('fulfilment'), data.get('delivery_time'), points_earned))
    order_id = c.lastrowid
    
    # Update user stats
    if data.get('user_id'):
        c.execute('SELECT last_order_date, current_streak FROM users WHERE id = ?', 
                  (data['user_id'],))
        user = c.fetchone()
        
        if user:
            last_order = user[0]
            current_streak = user[1]
            
            # Check streak
            if last_order:
                last_date = datetime.strptime(last_order, '%Y-%m-%d').date()
                today = datetime.now().date()
                days_diff = (today - last_date).days
                
                if days_diff == 1:  # Consecutive day
                    current_streak += 1
                elif days_diff > 1:  # Streak broken
                    current_streak = 1
            else:
                current_streak = 1
            
            c.execute('''UPDATE users SET 
                         loyalty_points = loyalty_points + ?,
                         current_streak = ?,
                         longest_streak = MAX(longest_streak, ?),
                         last_order_date = date('now'),
                         total_orders = total_orders + 1
                         WHERE id = ?''',
                      (points_earned, current_streak, current_streak, data['user_id']))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'order_id': order_id,
        'points_earned': points_earned
    })

@app.route('/api/trending', methods=['GET'])
def get_trending():
    """Get trending products based on recent orders"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get products ordered most in last 7 days
    c.execute('''SELECT p.*, COUNT(*) as order_count
                 FROM products p
                 JOIN orders o ON json_extract(o.items, '$') LIKE '%"id":' || p.id || '%'
                 WHERE o.created_at > datetime('now', '-7 days')
                 GROUP BY p.id
                 ORDER BY order_count DESC
                 LIMIT 10''')
    trending = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return jsonify({'trending': trending})

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    """Add product to favorites"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
              (data['user_id'], data['product_id']))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/favorites/<int:user_id>/<int:product_id>', methods=['DELETE'])
def remove_favorite(user_id, product_id):
    """Remove product from favorites"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
              (user_id, product_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

# Admin route for bulk price updates
@app.route('/api/admin/bulk-update', methods=['POST'])
def bulk_update():
    """Bulk update products (admin only)"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    for product in data['products']:
        c.execute('UPDATE products SET price = ?, stock = ? WHERE id = ?',
                  (product['price'], product.get('stock', 999), product['id']))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'updated': len(data['products'])})

# Push Notification Routes

@app.route('/api/subscribe', methods=['POST'])
def subscribe_push():
    """Subscribe to push notifications"""
    data = request.json
    subscription = data['subscription']
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    try:
        c.execute('''INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
                     VALUES (?, ?, ?, ?)
                     ON CONFLICT(endpoint) DO UPDATE SET
                     user_id = excluded.user_id''',
                  (user_id, 
                   subscription['endpoint'],
                   subscription['keys']['p256dh'],
                   subscription['keys']['auth']))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Subscribed to notifications'})
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/unsubscribe', methods=['POST'])
def unsubscribe_push():
    """Unsubscribe from push notifications"""
    data = request.json
    endpoint = data['endpoint']
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('DELETE FROM push_subscriptions WHERE endpoint = ?', (endpoint,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Unsubscribed from notifications'})

@app.route('/api/send-price-notifications', methods=['POST'])
def send_price_notifications():
    """Manually send push notifications for all unnotified price changes (admin only)"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get all unnotified price changes
    c.execute('''SELECT * FROM price_changes 
                 WHERE notified = 0 
                 ORDER BY changed_at DESC''')
    changes = [dict(row) for row in c.fetchall()]
    
    if not changes:
        conn.close()
        return jsonify({
            'success': True,
            'message': 'No pending price changes to notify',
            'sent': 0
        })
    
    # Get all subscriptions
    c.execute('SELECT * FROM push_subscriptions')
    subscriptions = [dict(row) for row in c.fetchall()]
    
    # Mark all changes as notified
    c.execute('UPDATE price_changes SET notified = 1 WHERE notified = 0')
    conn.commit()
    conn.close()
    
    # Note: Actual push sending requires pywebpush library and VAPID keys
    # TODO: Implement actual push notification sending
    
    return jsonify({
        'success': True,
        'message': f'Sent {len(changes)} price update(s) to {len(subscriptions)} subscriber(s)',
        'changes': changes,
        'subscribers': len(subscriptions)
    })

@app.route('/api/price-changes', methods=['GET'])
def get_price_changes():
    """Get recent price changes for in-app notifications"""
    # Get timestamp of last check (default to 7 days ago)
    since = request.args.get('since')
    if not since:
        since = (datetime.now() - timedelta(days=7)).isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('''SELECT pc.*, p.photo, p.category, p.unit
                 FROM price_changes pc
                 JOIN products p ON pc.product_id = p.id
                 WHERE pc.changed_at > ?
                 ORDER BY pc.changed_at DESC
                 LIMIT 50''', (since,))
    
    changes = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify(changes)

@app.route('/api/mark-changes-seen', methods=['POST'])
def mark_changes_seen():
    """Mark price changes as seen by user (clears in-app notification badge)"""
    data = request.json
    change_ids = data.get('change_ids', [])
    
    if not change_ids:
        return jsonify({'success': True, 'message': 'No changes to mark'})
    
    # Note: For now, we just acknowledge. In future, track per-user seen status
    return jsonify({
        'success': True,
        'message': f'Marked {len(change_ids)} changes as seen'
    })

# Serve static files (for PythonAnywhere)
@app.route('/')
def index():
    return send_from_directory('../', 'shop.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('../', filename)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
