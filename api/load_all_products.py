# Load ALL products from products-data.js into database
import sqlite3
import re

DB_PATH = 'glengala.db'

# Read the JavaScript file and extract products
with open('../products-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all product objects using regex
pattern = r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*price:\s*([\d.]+),\s*unit:\s*"([^"]+)",\s*active:\s*(\w+),\s*mostPopular:\s*(\w+),\s*popularOrder:\s*(\d+),\s*photo:\s*"([^"]*)",\s*hasSpecial:\s*(\w+),\s*specialPrice:\s*([\d.]+),\s*specialQuantity:\s*(\d+),\s*specialUnit:\s*"([^"]*)"\s*\}'

matches = re.findall(pattern, content)

print(f"Found {len(matches)} products in JavaScript file")

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Clear existing products
c.execute('DELETE FROM products')

# Insert all products
for match in matches:
    prod_id = int(match[0])
    name = match[1]
    category = match[2]
    price = float(match[3])
    unit = match[4]
    active = 1 if match[5] == 'true' else 0
    mostPopular = 1 if match[6] == 'true' else 0
    popularOrder = int(match[7])
    photo = match[8]
    hasSpecial = 1 if match[9] == 'true' else 0
    specialPrice = float(match[10])
    specialQuantity = int(match[11])
    specialUnit = match[12]
    
    c.execute('''INSERT INTO products 
                 (id, name, category, price, unit, active, mostPopular, popularOrder,
                  photo, hasSpecial, specialPrice, specialQuantity, specialUnit,
                  isPremium, isOrganic, stock, trending)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 999, 0)''',
              (prod_id, name, category, price, unit, active, mostPopular, popularOrder,
               photo, hasSpecial, specialPrice, specialQuantity, specialUnit))

conn.commit()

# Verify
c.execute('SELECT COUNT(*) FROM products')
count = c.fetchone()[0]
print(f"✅ Loaded {count} products into database")

# Show categories
c.execute('SELECT DISTINCT category FROM products')
categories = [row[0] for row in c.fetchall()]
print(f"📦 Categories: {', '.join(categories)}")

# Show some samples
c.execute('SELECT name, price, category FROM products WHERE hasSpecial = 1')
specials = c.fetchall()
print(f"\n🌟 {len(specials)} Products with specials:")
for s in specials[:5]:
    print(f"   • {s[0]} (${s[1]}) - {s[2]}")

conn.close()
print("\n🎉 Database fully loaded!")
