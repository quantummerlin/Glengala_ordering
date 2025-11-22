# Simple database initialization
import sqlite3
import sys

DB_PATH = 'glengala.db'

# Sample products from your data (you can add more)
sample_products = [
    (1, "Beetroot", "vegetables", 2.49, "kg", 1, 0, 0, "", 0, 0, 0, "", 0, 0, 999, 0),
    (2, "Carrot, 1kg bag", "vegetables", 1.99, "each", 1, 0, 0, "", 0, 0, 0, "", 0, 0, 999, 0),
    (20, "Artichoke, small", "vegetables", 1.99, "each", 1, 0, 0, "", 1, 3.00, 2, "each", 0, 0, 999, 0),
    (22, "Leeks", "vegetables", 1.49, "each", 1, 0, 0, "", 1, 4.00, 3, "each", 0, 0, 999, 0),
    (44, "Watermelon", "fruits", 2.49, "kg", 1, 0, 0, "", 0, 0, 0, "", 0, 0, 999, 0),
    (47, "Granny Smith apples", "fruits", 2.99, "kg", 1, 0, 0, "", 0, 0, 0, "", 0, 0, 999, 0),
    (52, "Bananas", "fruits", 3.99, "kg", 1, 0, 0, "", 0, 0, 0, "", 0, 0, 999, 0),
    (56, "Avocado", "fruits", 1.99, "each", 1, 0, 0, "", 1, 3.00, 2, "each", 0, 0, 999, 0),
    (69, "Spinach, loose", "herbs", 12.99, "kg", 1, 0, 0, "", 0, 0, 0, "", 0, 0, 999, 0),
    (73, "Iceberg lettuce", "herbs", 1.99, "each", 1, 0, 0, "", 0, 0, 0, "", 0, 0, 999, 0),
]

def init_db():
    """Initialize database with schema and sample data"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    print("🔧 Creating database tables...")
    
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
    
    # Users table
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
    
    # Daily specials table
    c.execute('''CREATE TABLE IF NOT EXISTS daily_specials
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  product_id INTEGER NOT NULL,
                  discount_percent REAL DEFAULT 0,
                  special_date DATE NOT NULL,
                  active INTEGER DEFAULT 1,
                  FOREIGN KEY (product_id) REFERENCES products (id))''')
    
    print("✅ Tables created")
    print(f"📦 Inserting {len(sample_products)} sample products...")
    
    # Insert sample products
    for p in sample_products:
        c.execute('''INSERT OR REPLACE INTO products 
                     (id, name, category, price, unit, active, mostPopular, popularOrder,
                      photo, hasSpecial, specialPrice, specialQuantity, specialUnit,
                      isPremium, isOrganic, stock, trending)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', p)
    
    conn.commit()
    
    # Verify
    c.execute('SELECT COUNT(*) FROM products')
    count = c.fetchone()[0]
    print(f"✅ Database initialized with {count} products")
    
    # Show sample
    c.execute('SELECT id, name, price, hasSpecial FROM products LIMIT 5')
    print("\n📋 Sample products:")
    for row in c.fetchall():
        special = " (SPECIAL!)" if row[3] else ""
        print(f"   {row[0]}: {row[1]} - ${row[2]}{special}")
    
    conn.close()
    print("\n🎉 Database ready! API can now serve live prices.")

if __name__ == '__main__':
    init_db()
