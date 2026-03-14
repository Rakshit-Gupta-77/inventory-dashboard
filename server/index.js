const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
    const result = stmt.run(email, hashedPassword, name);
    const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET);
    res.status(201).json({ token, user: { id: result.lastInsertRowid, email, name } });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// --- PRODUCTS ROUTES ---

app.get('/api/products', authenticate, (req, res) => {
  const products = db.prepare(`
    SELECT p.*, SUM(s.quantity) as stock 
    FROM products p 
    LEFT JOIN stock s ON p.id = s.product_id 
    GROUP BY p.id
  `).all();
  res.json(products);
});

app.post('/api/products', authenticate, (req, res) => {
  const { name, sku, category, uom, min_stock_level } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO products (name, sku, category, uom, min_stock_level) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(name, sku, category, uom, min_stock_level || 10);
    res.status(201).json({ id: result.lastInsertRowid, name, sku, category, uom });
  } catch (err) {
    res.status(400).json({ error: 'SKU must be unique' });
  }
});

// --- WAREHOUSE & LOCATIONS ---

app.get('/api/warehouses', authenticate, (req, res) => {
  const warehouses = db.prepare(`
    SELECT w.*, COUNT(l.id) as locations_count 
    FROM warehouses w 
    LEFT JOIN locations l ON w.id = l.warehouse_id 
    GROUP BY w.id
  `).all();
  res.json(warehouses);
});

app.get('/api/locations', authenticate, (req, res) => {
  const locations = db.prepare(`
    SELECT l.*, w.name as warehouse_name 
    FROM locations l 
    JOIN warehouses w ON l.warehouse_id = w.id
  `).all();
  res.json(locations);
});

// --- OPERATIONS (Receipts, Deliveries, Transfers) ---

app.get('/api/receipts', authenticate, (req, res) => {
  const receipts = db.prepare('SELECT * FROM receipts ORDER BY date DESC').all();
  res.json(receipts);
});

app.post('/api/receipts', authenticate, (req, res) => {
  const { reference, vendor, items } = req.body; // items: [{ product_id, quantity, destination_location_id }]
  const transaction = db.transaction(() => {
    const receiptStmt = db.prepare('INSERT INTO receipts (reference, vendor) VALUES (?, ?)');
    const receiptResult = receiptStmt.run(reference, vendor);
    const receiptId = receiptResult.lastInsertRowid;

    const itemStmt = db.prepare('INSERT INTO receipt_items (receipt_id, product_id, quantity, destination_location_id) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      itemStmt.run(receiptId, item.product_id, item.quantity, item.destination_location_id);
    }
    return receiptId;
  });
  
  try {
    const id = transaction();
    res.status(201).json({ id, reference, vendor });
  } catch (err) {
    res.status(400).json({ error: 'Reference must be unique' });
  }
});

app.post('/api/receipts/:id/validate', authenticate, (req, res) => {
  const { id } = req.params;
  const transaction = db.transaction(() => {
    const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(id);
    if (!receipt || receipt.status === 'Done') throw new Error('Invalid receipt');

    const items = db.prepare('SELECT * FROM receipt_items WHERE receipt_id = ?').all(id);
    for (const item of items) {
      // Update stock
      db.prepare(`
        INSERT INTO stock (product_id, location_id, quantity) 
        VALUES (?, ?, ?) 
        ON CONFLICT(product_id, location_id) DO UPDATE SET quantity = quantity + EXCLUDED.quantity
      `).run(item.product_id, item.destination_location_id, item.quantity);

      // Log to move history
      db.prepare(`
        INSERT INTO move_history (product_id, to_location_id, quantity, reference, type) 
        VALUES (?, ?, ?, ?, 'Receipt')
      `).run(item.product_id, item.destination_location_id, item.quantity, receipt.reference);
    }

    db.prepare("UPDATE receipts SET status = 'Done' WHERE id = ?").run(id);
  });

  try {
    transaction();
    res.json({ message: 'Receipt validated and stock updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- DELIVERIES ---

app.get('/api/deliveries', authenticate, (req, res) => {
  const deliveries = db.prepare('SELECT * FROM deliveries ORDER BY date DESC').all();
  res.json(deliveries);
});

app.post('/api/deliveries', authenticate, (req, res) => {
  const { reference, customer, items } = req.body; // items: [{ product_id, quantity, source_location_id }]
  const transaction = db.transaction(() => {
    const deliveryStmt = db.prepare('INSERT INTO deliveries (reference, customer) VALUES (?, ?)');
    const deliveryResult = deliveryStmt.run(reference, customer);
    const deliveryId = deliveryResult.lastInsertRowid;

    const itemStmt = db.prepare('INSERT INTO delivery_items (delivery_id, product_id, quantity, source_location_id) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      itemStmt.run(deliveryId, item.product_id, item.quantity, item.source_location_id);
    }
    return deliveryId;
  });
  
  try {
    const id = transaction();
    res.status(201).json({ id, reference, customer });
  } catch (err) {
    res.status(400).json({ error: 'Reference must be unique' });
  }
});

app.post('/api/deliveries/:id/validate', authenticate, (req, res) => {
  const { id } = req.params;
  const transaction = db.transaction(() => {
    const delivery = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id);
    if (!delivery || delivery.status === 'Done') throw new Error('Invalid delivery');

    const items = db.prepare('SELECT * FROM delivery_items WHERE delivery_id = ?').all(id);
    for (const item of items) {
      // Check stock
      const stock = db.prepare('SELECT quantity FROM stock WHERE product_id = ? AND location_id = ?').get(item.product_id, item.source_location_id);
      if (!stock || stock.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id} at location ${item.source_location_id}`);
      }

      // Update stock
      db.prepare('UPDATE stock SET quantity = quantity - ? WHERE product_id = ? AND location_id = ?')
        .run(item.quantity, item.product_id, item.source_location_id);

      // Log to move history
      db.prepare(`
        INSERT INTO move_history (product_id, from_location_id, quantity, reference, type) 
        VALUES (?, ?, ?, ?, 'Delivery')
      `).run(item.product_id, item.source_location_id, item.quantity, delivery.reference);
    }

    db.prepare("UPDATE deliveries SET status = 'Done' WHERE id = ?").run(id);
  });

  try {
    transaction();
    res.json({ message: 'Delivery validated and stock updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- INTERNAL TRANSFERS ---

app.get('/api/transfers', authenticate, (req, res) => {
  const transfers = db.prepare('SELECT * FROM transfers ORDER BY date DESC').all();
  res.json(transfers);
});

app.post('/api/transfers', authenticate, (req, res) => {
  const { reference, from_location_id, to_location_id, product_id, quantity } = req.body;
  const transaction = db.transaction(() => {
    // Check stock at source
    const stock = db.prepare('SELECT quantity FROM stock WHERE product_id = ? AND location_id = ?').get(product_id, from_location_id);
    if (!stock || stock.quantity < quantity) {
      throw new Error('Insufficient stock for transfer');
    }

    // Deduct from source
    db.prepare('UPDATE stock SET quantity = quantity - ? WHERE product_id = ? AND location_id = ?')
      .run(quantity, product_id, from_location_id);

    // Add to destination
    db.prepare(`
      INSERT INTO stock (product_id, location_id, quantity) 
      VALUES (?, ?, ?) 
      ON CONFLICT(product_id, location_id) DO UPDATE SET quantity = quantity + EXCLUDED.quantity
    `).run(product_id, to_location_id, quantity);

    // Log to move history
    db.prepare(`
      INSERT INTO move_history (product_id, from_location_id, to_location_id, quantity, reference, type) 
      VALUES (?, ?, ?, ?, ?, 'Transfer')
    `).run(product_id, from_location_id, to_location_id, quantity, reference);

    // Create transfer record
    const stmt = db.prepare(`
      INSERT INTO transfers (reference, from_location_id, to_location_id, product_id, quantity, status) 
      VALUES (?, ?, ?, ?, ?, 'Done')
    `);
    return stmt.run(reference, from_location_id, to_location_id, product_id, quantity);
  });

  try {
    const result = transaction();
    res.status(201).json({ id: result.lastInsertRowid, reference });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- STOCK ADJUSTMENTS ---

app.post('/api/adjustments', authenticate, (req, res) => {
  const { reference, product_id, location_id, counted_quantity, reason } = req.body;
  const transaction = db.transaction(() => {
    // Get current stock
    const currentStock = db.prepare('SELECT quantity FROM stock WHERE product_id = ? AND location_id = ?').get(product_id, location_id);
    const currentQty = currentStock ? currentStock.quantity : 0;
    const adjustmentQty = counted_quantity - currentQty;

    // Update stock
    db.prepare(`
      INSERT INTO stock (product_id, location_id, quantity) 
      VALUES (?, ?, ?) 
      ON CONFLICT(product_id, location_id) DO UPDATE SET quantity = EXCLUDED.quantity
    `).run(product_id, location_id, counted_quantity);

    // Log to move history
    // If adjustmentQty > 0, it's like a receipt (from NULL to location)
    // If adjustmentQty < 0, it's like a delivery (from location to NULL)
    db.prepare(`
      INSERT INTO move_history (product_id, from_location_id, to_location_id, quantity, reference, type) 
      VALUES (?, ?, ?, ?, ?, 'Adjustment')
    `).run(
      product_id, 
      adjustmentQty < 0 ? location_id : null, 
      adjustmentQty > 0 ? location_id : null, 
      Math.abs(adjustmentQty), 
      reference
    );

    // Create adjustment record
    const stmt = db.prepare(`
      INSERT INTO adjustments (reference, product_id, location_id, counted_quantity, adjustment_quantity, reason) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(reference, product_id, location_id, counted_quantity, adjustmentQty, reason);
  });

  try {
    const result = transaction();
    res.status(201).json({ id: result.lastInsertRowid, reference });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- STOCK & LEDGER ---

app.get('/api/stock', authenticate, (req, res) => {
  const stock = db.prepare(`
    SELECT s.*, p.name as product_name, p.sku, l.name as location_name, w.name as warehouse_name
    FROM stock s
    JOIN products p ON s.product_id = p.id
    JOIN locations l ON s.location_id = l.id
    JOIN warehouses w ON l.warehouse_id = w.id
  `).all();
  res.json(stock);
});

app.get('/api/move-history', authenticate, (req, res) => {
  const history = db.prepare(`
    SELECT m.*, p.name as product_name, p.sku, 
           fl.name as from_location_name, tl.name as to_location_name
    FROM move_history m
    JOIN products p ON m.product_id = p.id
    LEFT JOIN locations fl ON m.from_location_id = fl.id
    LEFT JOIN locations tl ON m.to_location_id = tl.id
    ORDER BY m.date DESC
  `).all();
  res.json(history);
});

// --- DASHBOARD KPIs ---

app.get('/api/dashboard/kpis', authenticate, (req, res) => {
  const totalProducts = db.prepare('SELECT count(*) as count FROM products').get().count;
  const lowStockItems = db.prepare(`
    SELECT count(*) as count FROM (
      SELECT p.id FROM products p 
      LEFT JOIN stock s ON p.id = s.product_id 
      GROUP BY p.id 
      HAVING IFNULL(SUM(s.quantity), 0) < p.min_stock_level
    )
  `).get().count;
  const pendingReceipts = db.prepare("SELECT count(*) as count FROM receipts WHERE status != 'Done'").get().count;
  const pendingDeliveries = db.prepare("SELECT count(*) as count FROM deliveries WHERE status != 'Done'").get().count;
  const transfersToday = db.prepare("SELECT count(*) as count FROM transfers WHERE date(date) = date('now')").get().count;

  res.json({
    totalProducts,
    lowStockItems,
    pendingReceipts,
    pendingDeliveries,
    transfersToday
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
