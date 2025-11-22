# Initialize database with existing products
import sqlite3
import json

DB_PATH = 'glengala.db'

# Your existing products from products-data.js
products_data = [
    {"id": 1, "name": "Beetroot", "category": "vegetables", "price": 2.49, "unit": "kg", "active": True, "mostPopular": False, "popularOrder": 0, "photo": "", "hasSpecial": False, "specialPrice": 0, "specialQuantity": 0, "specialUnit": ""},
    {"id": 2, "name": "Carrot, 1kg bag", "category": "vegetables", "price": 1.99, "unit": "each", "active": True, "mostPopular": False, "popularOrder": 0, "photo": "", "hasSpecial": False, "specialPrice": 0, "specialQuantity": 0, "specialUnit": ""},
    {"id": 3, "name": "Carrot, loose", "category": "vegetables", "price": 1.99, "unit": "kg", "active": True, "mostPopular": False, "popularOrder": 0, "photo": "", "hasSpecial": False, "specialPrice": 0, "specialQuantity": 0, "specialUnit": ""},
    # Add all your products here - this is a template
]

def init_products():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    for p in products_data:
        c.execute('''INSERT OR REPLACE INTO products 
                     (id, name, category, price, unit, active, mostPopular, popularOrder, 
                      photo, hasSpecial, specialPrice, specialQuantity, specialUnit, 
                      isPremium, isOrganic, stock, trending)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (p['id'], p['name'], p['category'], p['price'], p['unit'],
                   1 if p['active'] else 0, 1 if p['mostPopular'] else 0, p['popularOrder'],
                   p['photo'], 1 if p['hasSpecial'] else 0, p['specialPrice'],
                   p['specialQuantity'], p['specialUnit'],
                   0, 0, 999, 0))  # Default values for new fields
    
    conn.commit()
    conn.close()
    print(f"Initialized {len(products_data)} products")

if __name__ == '__main__':
    init_products()
