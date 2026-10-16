const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let dbType = 'sqlite';
let mysqlPool = null;
let sqliteDb = null;

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'agri_to_harvest';
const FORCE_SQLITE = process.env.FORCE_SQLITE === 'true';

async function initDatabase() {
  if (!FORCE_SQLITE) {
    try {
      const mysql = require('mysql2/promise');
      // Test basic connection
      const conn = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        connectTimeout: 3000
      });

      // Ensure database exists
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await conn.end();

      mysqlPool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test pool
      await mysqlPool.query('SELECT 1');
      dbType = 'mysql';
      console.log(`[DB] Connected to MySQL database "${DB_NAME}" at ${DB_HOST}:${DB_PORT}`);

      // Run MySQL schema if needed
      await runMysqlMigrations();
      return;
    } catch (err) {
      console.warn(`[DB] MySQL connection not active (${err.message}). Using high-performance embedded SQLite database.`);
    }
  }

  // SQLite fallback mode (zero-config, instant local run)
  setupSqlite();
}

async function runMysqlMigrations() {
  try {
    const schemaFile = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const seedFile = path.join(__dirname, '..', '..', 'database', 'seed.sql');

    if (fs.existsSync(schemaFile)) {
      const schemaSql = fs.readFileSync(schemaFile, 'utf8');
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use ') && !s.toLowerCase().startsWith('create database'));

      for (const statement of statements) {
        try {
          await mysqlPool.query(statement);
        } catch (e) {
          // ignore already existing or syntax issues
        }
      }
    }

    // Check if seeded
    const [users] = await mysqlPool.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0 && fs.existsSync(seedFile)) {
      const seedSql = fs.readFileSync(seedFile, 'utf8');
      const seedStatements = seedSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use '));

      for (const statement of seedStatements) {
        try {
          await mysqlPool.query(statement);
        } catch (e) {
          console.warn('[DB Seed Warning]', e.message);
        }
      }
      console.log('[DB] MySQL seeded with demonstration data.');
    }
  } catch (err) {
    console.error('[DB] Migration error:', err.message);
  }
}

function setupSqlite() {
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, '..', 'agri_to_harvest.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  dbType = 'sqlite';
  console.log(`[DB] Embedded SQLite initialized at ${dbPath}`);

  // Create SQLite tables compatible with schema
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('shopkeeper', 'compost_producer', 'farmer', 'admin')) NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Hyderabad',
      lat REAL DEFAULT 17.385044,
      lng REAL DEFAULT 78.486671,
      status TEXT CHECK(status IN ('active', 'suspended')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS waste_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shopkeeper_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      vegetable_type TEXT NOT NULL,
      description TEXT,
      quantity_kg REAL NOT NULL,
      available_quantity_kg REAL NOT NULL,
      waste_condition TEXT NOT NULL,
      available_datetime TEXT NOT NULL,
      collection_address TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Hyderabad',
      lat REAL DEFAULT 17.385044,
      lng REAL DEFAULT 78.486671,
      price_per_kg REAL DEFAULT 0.00,
      is_free INTEGER DEFAULT 1,
      image_url TEXT,
      contact_phone TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      is_compostable_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shopkeeper_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS waste_collection_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      waste_listing_id INTEGER NOT NULL,
      producer_id INTEGER NOT NULL,
      shopkeeper_id INTEGER NOT NULL,
      requested_quantity_kg REAL NOT NULL,
      actual_collected_kg REAL DEFAULT NULL,
      proposed_pickup_datetime TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (waste_listing_id) REFERENCES waste_listings(id) ON DELETE CASCADE,
      FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (shopkeeper_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS compost_production_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producer_id INTEGER NOT NULL,
      batch_code TEXT NOT NULL UNIQUE,
      source_waste_type TEXT NOT NULL,
      collection_request_ids TEXT,
      input_waste_kg REAL NOT NULL,
      processing_method TEXT NOT NULL,
      processing_start_date TEXT NOT NULL,
      estimated_completion_date TEXT NOT NULL,
      actual_completion_date TEXT DEFAULT NULL,
      finished_compost_kg REAL DEFAULT NULL,
      moisture_loss_percent REAL DEFAULT 65.00,
      status TEXT DEFAULT 'in_progress',
      npk_ratio TEXT DEFAULT '2.4 - 1.5 - 1.8',
      moisture_percent REAL DEFAULT 35.00,
      ph_level REAL DEFAULT 7.20,
      quality_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producer_id INTEGER NOT NULL,
      batch_id INTEGER DEFAULT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      stock_quantity REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      image_url TEXT,
      production_date TEXT NOT NULL,
      usage_instructions TEXT,
      delivery_options TEXT DEFAULT 'Delivery & Pickup',
      is_verified_organic INTEGER DEFAULT 1,
      rating REAL DEFAULT 4.90,
      total_reviews INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (batch_id) REFERENCES compost_production_records(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      buyer_id INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      delivery_fee REAL NOT NULL DEFAULT 0.00,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'order_placed',
      fulfillment_type TEXT DEFAULT 'delivery',
      shipping_name TEXT NOT NULL,
      shipping_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL DEFAULT 'Hyderabad',
      payment_method TEXT NOT NULL DEFAULT 'UPI / QR',
      payment_status TEXT DEFAULT 'simulated_paid',
      payment_ref TEXT DEFAULT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      producer_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      price_per_unit REAL NOT NULL,
      total_item_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      farmer_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'open',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER DEFAULT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      link TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed SQLite if empty
  const countRow = sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get();
  if (countRow.count === 0) {
    seedSqlite();
  }
}

function seedSqlite() {
  const insertUser = sqliteDb.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, address, city, lat, lng, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoHashAdmin = '$2b$10$Dz3qfOElF2lFwHuVoRoU/eYqrJk2Fgtk3JUCkL8Ne7RaaBXLdZDku'; // admin123
  const demoHashUser = '$2b$10$9q5SKS.dfncZvNhXw9yh9e7tZzMGjaXdlZoFiopd8DH/LcWxoRKWK';  // password123

  const users = [
    [1, 'AgriAdmin - System Monitor', 'admin@agritoharvest.org', '+91 98490 11223', demoHashAdmin, 'admin', 'Agri Innovation Center, Hitec City', 'Hyderabad', 17.4474, 78.3762, 'active'],
    [2, 'Ramesh Babu - Rythu Bazar Stall #14', 'ramesh.veggies@gmail.com', '+91 94401 22334', demoHashUser, 'shopkeeper', 'Bowenpally Agricultural Market Yard, Secunderabad', 'Hyderabad', 17.4721, 78.4842, 'active'],
    [3, 'Lakshmi Devi - Fresh Green Grocers', 'lakshmi.greens@gmail.com', '+91 98480 33445', demoHashUser, 'shopkeeper', 'Plot 42, Ayyappa Society Main Road, Madhapur', 'Hyderabad', 17.4483, 78.3915, 'active'],
    [4, 'Suresh Reddy - GreenSoil Bio-Organics', 'suresh.compost@gmail.com', '+91 97011 44556', demoHashUser, 'compost_producer', 'Survey No 128, Shamshabad Rural Organic Hub', 'Hyderabad', 17.2403, 78.4294, 'active'],
    [5, 'Haritha Rao - Haritha Krishi Earth Solutions', 'haritha.eco@gmail.com', '+91 99590 55667', demoHashUser, 'compost_producer', 'Sector 4, Medchal Agro-Industrial Park', 'Hyderabad', 17.6297, 78.4814, 'active'],
    [6, 'Venkat Rao - Organic Paddy & Veg Farmer', 'venkat.farmer@gmail.com', '+91 96180 66778', demoHashUser, 'farmer', 'Sy No 54, Chevella Mandal, Rangareddy District', 'Rangareddy', 17.3075, 78.1362, 'active'],
    [7, 'Anjamma Goud - Sustainable Horticulturist', 'anjamma.organic@gmail.com', '+91 98660 77889', demoHashUser, 'farmer', 'Village Kondapur, Sangareddy Agri Belt', 'Sangareddy', 17.6190, 78.0818, 'active']
  ];

  for (const u of users) {
    insertUser.run(...u);
  }

  // Insert Waste Listings
  const insertListing = sqliteDb.prepare(`
    INSERT INTO waste_listings (id, shopkeeper_id, title, vegetable_type, description, quantity_kg, available_quantity_kg, waste_condition, available_datetime, collection_address, city, lat, lng, price_per_kg, is_free, image_url, contact_phone, status, is_compostable_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const listings = [
    [1, 2, 'Fresh Spinach, Coriander & Mint Trimmings', 'Leafy Greens', 'Daily morning market cuts and trimmings. Clean, 100% organic matter without plastics or chemical residue. Highly nitrogen-rich, perfect for aerobic compost.', 180.0, 180.0, 'Freshly Cut / Trimmings', 'Today, 2:00 PM - 7:00 PM', 'Bowenpally Market Yard Stall 14', 'Hyderabad', 17.4721, 78.4842, 0.0, 1, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', '+91 94401 22334', 'available', 1],
    [2, 2, 'Cabbage, Cauliflower Outer Leaves & Carrot Stems', 'Brassicas & Root Vegetables', 'Crisp discarded vegetable leaves and tops from bulk unpacking. Great carbon-nitrogen balance for vermicomposting pits.', 350.0, 150.0, 'Freshly Cut / Trimmings', 'Daily between 4:00 PM - 8:00 PM', 'Bowenpally Market Yard Stall 14', 'Hyderabad', 17.4721, 78.4842, 0.5, 0, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80', '+91 94401 22334', 'partially_reserved', 1],
    [3, 3, 'Surplus Ripe Tomatoes, Bell Peppers & Gourds', 'Tomatoes, Gourds & Solanaceae', 'Overripe tomatoes and gourd trimmings separated this morning. High moisture content, ideal for pre-fermentation or Bokashi digestion.', 220.0, 220.0, 'Wilted / Overripe', 'Today from 1:00 PM onwards', 'Madhapur Ayyappa Society Grocers', 'Hyderabad', 17.4483, 78.3915, 0.0, 1, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', '+91 98480 33445', 'available', 1],
    [4, 3, 'Sweet Corn Husks, Pea Shells & Banana Peels', 'Dry Husks, Peels & Stems', 'Bulk dry vegetable biomass, banana skins, and corn outer skins. Excellent brown carbon source to aerate wet compost piles.', 400.0, 0.0, 'Dry Husks, Peels & Stems', 'Yesterday collection completed', 'Madhapur Ayyappa Society Grocers', 'Hyderabad', 17.4483, 78.3915, 0.0, 1, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80', '+91 98480 33445', 'collected', 1],
    [5, 2, 'Mixed Market Sorting Residue (Brinjals, Beans, Okra)', 'Mixed Market Produce', 'Clean unsold surplus veggies sorted at closing hours. Completely biodegradable, zero trash.', 260.0, 260.0, 'Spoiled / Excess Market Produce', 'Tomorrow morning 8:00 AM - 12:00 PM', 'Bowenpally Market Yard Stall 14', 'Hyderabad', 17.4721, 78.4842, 0.0, 1, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80', '+91 94401 22334', 'available', 1]
  ];
  for (const l of listings) {
    insertListing.run(...l);
  }

  // Insert Requests
  const insertReq = sqliteDb.prepare(`
    INSERT INTO waste_collection_requests (id, waste_listing_id, producer_id, shopkeeper_id, requested_quantity_kg, actual_collected_kg, proposed_pickup_datetime, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const reqs = [
    [1, 2, 4, 2, 200.0, null, 'Today at 5:30 PM with 1-ton truck', 'We have airtight collection bins and a dedicated hydraulic tipper. Will pay cash on spot.', 'accepted'],
    [2, 4, 4, 3, 400.0, 400.0, 'Yesterday 3:00 PM', 'Successfully collected full batch for Shamshabad Vermicompost windrows.', 'collected'],
    [3, 1, 5, 2, 80.0, null, 'Tomorrow 10:00 AM', 'Requested for Haritha Krishi bio-fertilizer trial pilot.', 'pending']
  ];
  for (const r of reqs) {
    insertReq.run(...r);
  }

  // Insert Batches
  const insertBatch = sqliteDb.prepare(`
    INSERT INTO compost_production_records (id, producer_id, batch_code, source_waste_type, collection_request_ids, input_waste_kg, processing_method, processing_start_date, estimated_completion_date, actual_completion_date, finished_compost_kg, moisture_loss_percent, status, npk_ratio, moisture_percent, ph_level, quality_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const batches = [
    [1, 4, 'BATCH-2026-SHM-01', 'Corn husks, pea shells & vegetable greens', '[2]', 850.0, 'Vermicomposting', '2026-08-15', '2026-09-25', '2026-09-26', 310.0, 63.5, 'completed', '2.8 - 1.9 - 2.1', 28.0, 7.3, 'Rich dark brown granular texture, earthworm activity completed, lab verified weed-seed free with superior microbial counts.'],
    [2, 4, 'BATCH-2026-SHM-02', 'Market leafy cuts, cabbage & tomato residue', '[1]', 920.0, 'Aerobic Windrow', '2026-09-28', '2026-11-10', null, null, 65.0, 'in_progress', '2.4 - 1.5 - 1.8', 42.0, 6.9, 'Turned twice weekly, core temperature maintained at 58°C ensuring pathogen elimination.'],
    [3, 5, 'BATCH-2026-MDC-01', 'Mixed vegetable market waste & dry biomass', '[]', 600.0, 'Bokashi Fermentation', '2026-09-10', '2026-10-12', '2026-10-13', 240.0, 60.0, 'completed', '2.6 - 1.7 - 2.0', 30.0, 7.1, 'Anaerobic microbial starter inoculated, high lactic acid bacterium count, excellent soil conditioner.']
  ];
  for (const b of batches) {
    insertBatch.run(...b);
  }

  // Insert Products
  const insertProduct = sqliteDb.prepare(`
    INSERT INTO products (id, producer_id, batch_id, title, category, description, price, stock_quantity, unit, image_url, production_date, usage_instructions, delivery_options, is_verified_organic, rating, total_reviews, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const products = [
    [1, 4, 1, 'Premium Pure Vermicompost (Black Gold)', 'Vermicompost', 'Crafted from 100% recycled Bowenpally and Madhapur vegetable waste. Inoculated with Eisenia fetida earthworms. 100% organic, weed-free, odorless, and packed with beneficial soil microbes.', 320.0, 45.0, '25kg bag', 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80', '2026-09-27', 'Mix 1 to 2 kg per fruit tree or 200g per vegetable pot. Incorporate into top 2-3 inches of soil before irrigation.', 'Delivery & Pickup', 1, 4.9, 8, 'active'],
    [2, 4, 1, 'Enriched Vegetable Compost - High Nitrogen', 'Vegetable Compost', 'Aerobically decomposed vegetable waste trimmings fortified with rock phosphate and neem cake. Accelerates root development and enhances soil moisture retention by 40%.', 240.0, 60.0, '25kg bag', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', '2026-09-28', 'Apply 1 ton per acre during land preparation or basal dose for horticultural crops.', 'Delivery & Pickup', 1, 4.8, 5, 'active'],
    [3, 5, 3, 'Bio-Fermented Bokashi Soil Conditioner', 'Soil Conditioners', 'Fermented vegetable organic biomass treated with probiotic beneficial micro-organisms. Restores degraded farmland, prevents fungal root rots, and unlocks bound soil phosphorus.', 450.0, 30.0, '25kg bag', 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?auto=format&fit=crop&w=800&q=80', '2026-10-14', 'Broadcast 50g per square meter or mix with farmyard manure prior to sowing.', 'Delivery & Pickup', 1, 5.0, 3, 'active'],
    [4, 5, null, 'Organic Microbial Plant Booster Liquid (Bio-wash)', 'Bio-fertilizers', 'Nutrient-rich liquid leachate extracted from active vermicompost beds. Rich in fulvic and humic acids. Provides rapid leaf greening and pest resistance.', 180.0, 50.0, '5L can', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80', '2026-10-05', 'Dilute 10ml in 1 liter of fresh water. Foliar spray every 15 days on flowering crops.', 'Standard Delivery', 1, 4.7, 4, 'active']
  ];
  for (const p of products) {
    insertProduct.run(...p);
  }

  // Insert Orders
  const insertOrder = sqliteDb.prepare(`
    INSERT INTO orders (id, order_number, buyer_id, subtotal, delivery_fee, total_amount, status, fulfillment_type, shipping_name, shipping_phone, shipping_address, shipping_city, payment_method, payment_status, payment_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const orders = [
    [1, 'ATH-2026-8812', 6, 640.0, 80.0, 720.0, 'delivered', 'delivery', 'Venkat Rao', '+91 96180 66778', 'Survey No 54, Chevella Farm Road', 'Rangareddy', 'UPI / QR', 'simulated_paid', 'UPI-TXN-9021882'],
    [2, 'ATH-2026-9045', 7, 450.0, 0.0, 450.0, 'processing', 'pickup', 'Anjamma Goud', '+91 98660 77889', 'Pickup from Medchal Agro Hub', 'Medchal', 'Cash on Delivery', 'simulated_paid', 'CASH-REC-1092']
  ];
  for (const o of orders) {
    insertOrder.run(...o);
  }

  // Insert Order Items
  const insertItem = sqliteDb.prepare(`
    INSERT INTO order_items (id, order_id, product_id, producer_id, product_name, quantity, unit, price_per_unit, total_item_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const items = [
    [1, 1, 1, 4, 'Premium Pure Vermicompost (Black Gold)', 2, '25kg bag', 320.0, 640.0],
    [2, 2, 3, 5, 'Bio-Fermented Bokashi Soil Conditioner', 1, '25kg bag', 450.0, 450.0]
  ];
  for (const it of items) {
    insertItem.run(...it);
  }

  // Insert Reviews
  const insertRev = sqliteDb.prepare(`
    INSERT INTO reviews (id, product_id, farmer_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `);
  const reviews = [
    [1, 1, 6, 5, 'Exceptional quality vermicompost! Used it for my chili and tomato plots in Chevella. The earthworm casts are visible, pleasant earthy smell, zero weeds.'],
    [2, 2, 7, 5, 'Best compost made from vegetable market waste. My drip irrigated gourds showed dark green vigorous foliage within 10 days of application.']
  ];
  for (const rev of reviews) {
    insertRev.run(...rev);
  }

  // Insert Audit Logs
  const insertLog = sqliteDb.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const logs = [
    [1, 1, 'SYSTEM_INIT', 'system', null, 'Database schema initialized and seed records created for Agri to Harvest.'],
    [2, 4, 'BATCH_COMPLETED', 'compost_batch', 1, 'Batch BATCH-2026-SHM-01 completed. 850kg waste transformed into 310kg vermicompost.'],
    [3, 6, 'ORDER_PLACED', 'order', 1, 'Farmer Venkat Rao placed order ATH-2026-8812 for 50kg vermicompost.']
  ];
  for (const log of logs) {
    insertLog.run(...log);
  }

  console.log('[DB] Embedded database seeded with complete demonstration dataset.');
}

/**
 * Universal query wrapper that runs seamlessly on both MySQL and SQLite
 */
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    const [result] = await mysqlPool.execute(sql, params);
    if (Array.isArray(result)) {
      return result;
    }
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    };
  } else {
    // SQLite mode
    const trimmed = sql.trim().toLowerCase();
    if (trimmed.startsWith('select') || trimmed.startsWith('with') || trimmed.startsWith('pragma')) {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...params);
    } else {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return {
        insertId: info.lastInsertRowid,
        affectedRows: info.changes
      };
    }
  }
}

/**
 * Execute within a transaction
 */
async function transaction(callback) {
  if (dbType === 'mysql') {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      const txQuery = async (sql, params = []) => {
        const [result] = await connection.execute(sql, params);
        if (Array.isArray(result)) return result;
        return { insertId: result.insertId, affectedRows: result.affectedRows };
      };
      const result = await callback(txQuery);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } else {
    // SQLite transaction compatible with async callbacks
    sqliteDb.exec('BEGIN IMMEDIATE');
    try {
      const txQuery = async (sql, params = []) => {
        const trimmed = sql.trim().toLowerCase();
        if (trimmed.startsWith('select') || trimmed.startsWith('with') || trimmed.startsWith('pragma')) {
          return sqliteDb.prepare(sql).all(...params);
        } else {
          const info = sqliteDb.prepare(sql).run(...params);
          return { insertId: info.lastInsertRowid, affectedRows: info.changes };
        }
      };
      const result = await callback(txQuery);
      sqliteDb.exec('COMMIT');
      return result;
    } catch (err) {
      try {
        sqliteDb.exec('ROLLBACK');
      } catch (rbErr) {
        // Ignore if rollback already executed
      }
      throw err;
    }
  }
}

function getDbType() {
  return dbType;
}

module.exports = {
  initDatabase,
  query,
  transaction,
  getDbType
};
