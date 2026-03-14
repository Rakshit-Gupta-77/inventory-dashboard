const Database = require('better-sqlite3');
const path = require('path');

const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'inventory.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    otp TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    warehouse_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- Storage, Production, Receiving, Shipping, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT,
    uom TEXT NOT NULL, -- Unit of Measure
    min_stock_level INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    UNIQUE(product_id, location_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,
    vendor TEXT NOT NULL,
    status TEXT DEFAULT 'Draft', -- Draft, Waiting, Ready, Done, Canceled
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS receipt_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    destination_location_id INTEGER NOT NULL,
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (destination_location_id) REFERENCES locations(id)
  );

  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,
    customer TEXT NOT NULL,
    status TEXT DEFAULT 'Draft', -- Draft, Waiting, Ready, Done, Canceled
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS delivery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    source_location_id INTEGER NOT NULL,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (source_location_id) REFERENCES locations(id)
  );

  CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,
    from_location_id INTEGER NOT NULL,
    to_location_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'Draft', -- Draft, Done
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_location_id) REFERENCES locations(id),
    FOREIGN KEY (to_location_id) REFERENCES locations(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,
    product_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    counted_quantity INTEGER NOT NULL,
    adjustment_quantity INTEGER NOT NULL,
    reason TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
  );

  CREATE TABLE IF NOT EXISTS move_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    from_location_id INTEGER, -- NULL for new stock
    to_location_id INTEGER,   -- NULL for outgoing stock
    quantity INTEGER NOT NULL,
    reference TEXT NOT NULL,  -- Receipt Ref, Delivery Ref, Transfer Ref, Adjustment Ref
    type TEXT NOT NULL,       -- Receipt, Delivery, Transfer, Adjustment
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (from_location_id) REFERENCES locations(id),
    FOREIGN KEY (to_location_id) REFERENCES locations(id)
  );
`);

// Seed initial data if empty
const countProducts = db.prepare('SELECT count(*) as count FROM products').get().count;
if (countProducts === 0) {
  const seedWarehouses = db.prepare('INSERT INTO warehouses (name, short_code, address) VALUES (?, ?, ?)');
  const whA = seedWarehouses.run('Main Warehouse', 'WH-A', '123 Industrial Blvd, Houston TX').lastInsertRowid;
  const whB = seedWarehouses.run('East Distribution Center', 'WH-B', '456 Logistics Way, Dallas TX').lastInsertRowid;
  const whC = seedWarehouses.run('Production Floor Storage', 'WH-C', '789 Factory Rd, Austin TX').lastInsertRowid;

  const seedLocations = db.prepare('INSERT INTO locations (name, warehouse_id, type) VALUES (?, ?, ?)');
  const locA1 = seedLocations.run('Rack A-01', whA, 'Storage').lastInsertRowid;
  const locA2 = seedLocations.run('Rack A-02', whA, 'Storage').lastInsertRowid;
  const locC1 = seedLocations.run('Production Line 1', whC, 'Production').lastInsertRowid;
  const locRec = seedLocations.run('Receiving Bay', whA, 'Receiving').lastInsertRowid;
  const locShip = seedLocations.run('Shipping Dock', whB, 'Shipping').lastInsertRowid;

  const seedProducts = db.prepare('INSERT INTO products (name, sku, category, uom, min_stock_level) VALUES (?, ?, ?, ?, ?)');
  const p1 = seedProducts.run('Steel Rods', 'APX-101', 'Raw Materials', 'kg', 10).lastInsertRowid;
  const p2 = seedProducts.run('Hydraulic Fluid', 'APX-102', 'Fluids', 'L', 5).lastInsertRowid;
  const p3 = seedProducts.run('Servo Motors', 'APX-103', 'Electronics', 'pcs', 20).lastInsertRowid;

  const seedStock = db.prepare('INSERT INTO stock (product_id, location_id, quantity) VALUES (?, ?, ?)');
  seedStock.run(p1, locA1, 200);
  seedStock.run(p2, locA2, 12);
  seedStock.run(p3, locC1, 85);

  const seedReceipts = db.prepare('INSERT INTO receipts (reference, vendor, status) VALUES (?, ?, ?)');
  const r1 = seedReceipts.run('RCP-001', 'Steel Corp', 'Done').lastInsertRowid;
  const r2 = seedReceipts.run('RCP-002', 'Fluid Tech', 'Ready').lastInsertRowid;

  const seedReceiptItems = db.prepare('INSERT INTO receipt_items (receipt_id, product_id, quantity, destination_location_id) VALUES (?, ?, ?, ?)');
  seedReceiptItems.run(r1, p1, 50, locA1);
  seedReceiptItems.run(r2, p2, 10, locA2);

  const seedMoveHistory = db.prepare('INSERT INTO move_history (product_id, to_location_id, quantity, reference, type) VALUES (?, ?, ?, ?, ?)');
  seedMoveHistory.run(p1, locA1, 50, 'RCP-001', 'Receipt');

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run('admin@example.com', hashedPassword, 'Admin User');
}

// Ensure at least one admin user exists even if already seeded
const adminExists = db.prepare('SELECT count(*) as count FROM users WHERE email = ?').get('admin@example.com').count;
if (adminExists === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run('admin@example.com', hashedPassword, 'Admin User');
}

module.exports = db;
