# Auto-generate products from JavaScript file
import sqlite3
import json
import re
import sys
import os

# Get the parent directory path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js_file = os.path.join(parent_dir, 'products-data.js')
DB_PATH = 'glengala.db'

def parse_js_products(js_file_path):
    """Parse JavaScript products array from file"""
    with open(js_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the products array
    match = re.search(r'let products = \[(.*?)\];', content, re.DOTALL)
    if not match:
        print("Could not find products array in JS file")
        return []
    
    products_str = '[' + match.group(1) + ']'
    
    # Convert JavaScript boolean/null to Python
    products_str = products_str.replace('true', 'True').replace('false', 'False').replace('null', 'None')
    
    # Remove comments
    products_str = re.sub(r'//.*?$', '', products_str, flags=re.MULTILINE)
    
    try:
        # Evaluate as Python (safe because we control the input)
        products = eval(products_str)
        return products
    except Exception as e:
        print(f"Error parsing products: {e}")
        return []

def init_db_with_products(products):
    """Initialize database with products"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    print(f"Initializing database with {len(products)} products...")
    
    for p in products:
        c.execute('''INSERT OR REPLACE INTO products 
                     (id, name, category, price, unit, active, mostPopular, popularOrder, 
                      photo, hasSpecial, specialPrice, specialQuantity, specialUnit, 
                      isPremium, isOrganic, stock, trending)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (p['id'], p['name'], p['category'], p['price'], p['unit'],
                   1 if p.get('active', True) else 0, 
                   1 if p.get('mostPopular', False) else 0, 
                   p.get('popularOrder', 0),
                   p.get('photo', ''), 
                   1 if p.get('hasSpecial', False) else 0, 
                   p.get('specialPrice', 0),
                   p.get('specialQuantity', 0), 
                   p.get('specialUnit', ''),
                   0,  # isPremium
                   0,  # isOrganic
                   999,  # stock
                   0))  # trending
    
    conn.commit()
    
    # Verify
    c.execute('SELECT COUNT(*) FROM products')
    count = c.fetchone()[0]
    print(f"✅ Successfully initialized {count} products in database")
    
    # Show some sample data
    c.execute('SELECT id, name, price, category FROM products LIMIT 5')
    samples = c.fetchall()
    print("\nSample products:")
    for s in samples:
        print(f"  {s[0]}: {s[1]} - ${s[2]} ({s[3]})")
    
    conn.close()

if __name__ == '__main__':
    print("🔧 Auto-initializing Glengala Fresh database...")
    print(f"Reading from: {js_file}")
    
    if not os.path.exists(js_file):
        print(f"❌ Error: Could not find {js_file}")
        sys.exit(1)
    
    products = parse_js_products(js_file)
    
    if products:
        init_db_with_products(products)
        print("\n🎉 Database initialization complete!")
    else:
        print("❌ No products found to initialize")
