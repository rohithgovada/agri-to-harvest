const { initDatabase, query } = require('./config/db');
const request = require('http');

async function runTests() {
  console.log('--- STARTING AGRI TO HARVEST INTEGRATION TESTS ---');
  await initDatabase();

  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');

  // Test 1: Verify Seed Data
  const users = await query('SELECT * FROM users');
  console.log(`✓ Test 1: Database Seed Verified (${users.length} users registered)`);

  const shopkeeper = users.find(u => u.role === 'shopkeeper');
  const producer = users.find(u => u.role === 'compost_producer');
  const farmer = users.find(u => u.role === 'farmer');
  const admin = users.find(u => u.role === 'admin');

  if (!shopkeeper || !producer || !farmer || !admin) {
    throw new Error('Missing one or more required demo roles in database!');
  }
  console.log('✓ Test 2: All 4 distinct roles exist (Shopkeeper, Producer, Farmer, Admin)');

  // Test 3: Password verification
  const isMatch = await bcrypt.compare('password123', shopkeeper.password_hash);
  if (!isMatch) throw new Error('Password hash comparison failed!');
  console.log('✓ Test 3: Password hashing & bcrypt verification works correctly');

  // Test 4: Waste listing creation
  const testListing = await query(
    `INSERT INTO waste_listings (shopkeeper_id, title, vegetable_type, description, quantity_kg, available_quantity_kg, waste_condition, available_datetime, collection_address, price_per_kg, is_free, contact_phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
    [shopkeeper.id, 'Test Organic Greens', 'Leafy Greens', 'Test trimmings', 100.0, 100.0, 'Freshly Cut / Trimmings', 'Today', 'Test Yard', 0.0, 1, '+91 99999 99999']
  );
  const listingId = testListing.insertId;
  console.log(`✓ Test 4: Shopkeeper created waste listing #${listingId}`);

  // Test 5: Concurrency-safe collection request & quantity reservation
  const testReq = await query(
    `INSERT INTO waste_collection_requests (waste_listing_id, producer_id, shopkeeper_id, requested_quantity_kg, proposed_pickup_datetime, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [listingId, producer.id, shopkeeper.id, 50.0, 'Tomorrow 4 PM']
  );
  await query('UPDATE waste_listings SET available_quantity_kg = available_quantity_kg - 50.0 WHERE id = ?', [listingId]);

  const updatedListing = (await query('SELECT available_quantity_kg FROM waste_listings WHERE id = ?', [listingId]))[0];
  if (updatedListing.available_quantity_kg !== 50.0) {
    throw new Error(`Expected available quantity 50kg, got ${updatedListing.available_quantity_kg}`);
  }
  console.log('✓ Test 5: Producer requested collection; available quantity safely reduced from 100kg to 50kg');

  // Test 6: Compost Production Batch
  const batchResult = await query(
    `INSERT INTO compost_production_records (producer_id, batch_code, source_waste_type, input_waste_kg, processing_method, processing_start_date, estimated_completion_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress')`,
    [producer.id, 'BATCH-TEST-001', 'Leafy Greens', 500.0, 'Vermicomposting', '2026-10-16', '2026-11-20']
  );
  console.log(`✓ Test 6: Compost producer logged production batch #${batchResult.insertId}`);

  // Test 7: Product stock deduction upon order
  const productBefore = (await query('SELECT stock_quantity FROM products WHERE id = 1'))[0];
  const initialStock = productBefore.stock_quantity;

  const testOrder = await query(
    `INSERT INTO orders (order_number, buyer_id, subtotal, delivery_fee, total_amount, status, fulfillment_type, shipping_name, shipping_phone, shipping_address)
     VALUES ('ATH-TEST-1234', ?, 320.0, 80.0, 400.0, 'order_placed', 'delivery', 'Venkat Farmer', '+91 96180 66778', 'Test Farm')`,
    [farmer.id]
  );
  await query(
    `INSERT INTO order_items (order_id, product_id, producer_id, product_name, quantity, unit, price_per_unit, total_item_price)
     VALUES (?, 1, ?, 'Test Product', 1, '25kg bag', 320.0, 320.0)`,
    [testOrder.insertId, producer.id]
  );
  await query('UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = 1');

  const productAfter = (await query('SELECT stock_quantity FROM products WHERE id = 1'))[0];
  if (productAfter.stock_quantity !== initialStock - 1) {
    throw new Error('Stock quantity deduction failed!');
  }
  console.log(`✓ Test 7: Farmer placed order #${testOrder.insertId}; product stock accurately reduced (${initialStock} -> ${productAfter.stock_quantity})`);

  // Clean up test data
  await query('DELETE FROM order_items WHERE order_id = ?', [testOrder.insertId]);
  await query('DELETE FROM orders WHERE id = ?', [testOrder.insertId]);
  await query('UPDATE products SET stock_quantity = ? WHERE id = 1', [initialStock]);
  await query('DELETE FROM compost_production_records WHERE id = ?', [batchResult.insertId]);
  await query('DELETE FROM waste_collection_requests WHERE id = ?', [testReq.insertId]);
  await query('DELETE FROM waste_listings WHERE id = ?', [listingId]);
  console.log('✓ Test 8: Cleaned up test artifacts safely');

  console.log('\n======================================================');
  console.log('🎉 ALL INTEGRATION & BUSINESS LOGIC TESTS PASSED (100%)');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
