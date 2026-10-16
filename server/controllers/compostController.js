const db = require('../config/db');

// Get all production batches for the logged-in producer
exports.getProducerBatches = async (req, res) => {
  try {
    const batches = await db.query(
      `SELECT b.*,
       (SELECT COUNT(*) FROM products p WHERE p.batch_id = b.id) as linked_products_count
       FROM compost_production_records b
       WHERE b.producer_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch production records.', error: err.message });
  }
};

// Create a new compost batch
exports.createBatch = async (req, res) => {
  try {
    const {
      source_waste_type,
      collection_request_ids,
      input_waste_kg,
      processing_method,
      processing_start_date,
      estimated_completion_date,
      npk_ratio,
      moisture_percent,
      ph_level,
      quality_notes
    } = req.body;

    if (!source_waste_type || !input_waste_kg || !processing_method || !processing_start_date || !estimated_completion_date) {
      return res.status(400).json({ success: false, message: 'Please provide all required batch fields.' });
    }

    const inputKg = parseFloat(input_waste_kg);
    if (isNaN(inputKg) || inputKg <= 0) {
      return res.status(400).json({ success: false, message: 'Input waste quantity must be greater than 0.' });
    }

    // Generate batch code: BATCH-YYYY-PRODUCER_ID-RAND
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const batchCode = `BATCH-${year}-P${req.user.id}-${randomSuffix}`;

    const result = await db.query(
      `INSERT INTO compost_production_records (
        producer_id, batch_code, source_waste_type, collection_request_ids,
        input_waste_kg, processing_method, processing_start_date, estimated_completion_date,
        status, npk_ratio, moisture_percent, ph_level, quality_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, ?, ?, ?)`,
      [
        req.user.id,
        batchCode,
        source_waste_type,
        JSON.stringify(collection_request_ids || []),
        inputKg,
        processing_method,
        processing_start_date,
        estimated_completion_date,
        npk_ratio || '2.4 - 1.5 - 1.8',
        moisture_percent || 40.0,
        ph_level || 7.0,
        quality_notes || ''
      ]
    );

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'BATCH_CREATED', 'compost_batch', result.insertId, `Created production batch ${batchCode} with ${inputKg}kg input waste`]
    );

    res.status(201).json({
      success: true,
      message: 'Compost production batch started successfully.',
      batchId: result.insertId,
      batchCode
    });
  } catch (err) {
    console.error('createBatch error:', err);
    res.status(500).json({ success: false, message: 'Failed to create production batch.', error: err.message });
  }
};

// Update batch status or complete it with finished output yield
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      finished_compost_kg,
      actual_completion_date,
      npk_ratio,
      moisture_percent,
      ph_level,
      quality_notes
    } = req.body;

    const batches = await db.query('SELECT * FROM compost_production_records WHERE id = ?', [id]);
    if (!batches || batches.length === 0) {
      return res.status(404).json({ success: false, message: 'Production record not found.' });
    }

    const batch = batches[0];
    if (batch.producer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this batch.' });
    }

    let finishedKg = batch.finished_compost_kg;
    let lossPercent = batch.moisture_loss_percent;

    if (finished_compost_kg !== undefined && finished_compost_kg !== null) {
      finishedKg = parseFloat(finished_compost_kg);
      if (batch.input_waste_kg > 0) {
        lossPercent = Math.max(0, ((batch.input_waste_kg - finishedKg) / batch.input_waste_kg) * 100);
      }
    }

    const compDate = actual_completion_date || (status === 'completed' ? new Date().toISOString().split('T')[0] : batch.actual_completion_date);

    await db.query(
      `UPDATE compost_production_records SET
        status = COALESCE(?, status),
        finished_compost_kg = COALESCE(?, finished_compost_kg),
        actual_completion_date = COALESCE(?, actual_completion_date),
        moisture_loss_percent = COALESCE(?, moisture_loss_percent),
        npk_ratio = COALESCE(?, npk_ratio),
        moisture_percent = COALESCE(?, moisture_percent),
        ph_level = COALESCE(?, ph_level),
        quality_notes = COALESCE(?, quality_notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, finishedKg, compDate, lossPercent, npk_ratio, moisture_percent, ph_level, quality_notes, id]
    );

    if (status === 'completed') {
      await db.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'BATCH_COMPLETED', 'compost_batch', id, `Batch ${batch.batch_code} finished yielding ${finishedKg}kg compost.`]
      );
    }

    res.json({ success: true, message: 'Production batch record updated successfully.' });
  } catch (err) {
    console.error('updateBatch error:', err);
    res.status(500).json({ success: false, message: 'Failed to update batch record.', error: err.message });
  }
};

// Producer Dashboard Summary Statistics
exports.getProducerDashboardStats = async (req, res) => {
  try {
    const producerId = req.user.id;

    // 1. Total waste collected by this producer
    const collectionSummary = await db.query(
      `SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'collected' THEN COALESCE(actual_collected_kg, requested_quantity_kg) ELSE 0 END) as total_waste_collected_kg,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_requests
       FROM waste_collection_requests
       WHERE producer_id = ?`,
      [producerId]
    );

    // 2. Total compost produced
    const batchSummary = await db.query(
      `SELECT
        COUNT(*) as total_batches,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active_batches,
        SUM(CASE WHEN status = 'completed' THEN COALESCE(finished_compost_kg, 0) ELSE 0 END) as total_compost_kg
       FROM compost_production_records
       WHERE producer_id = ?`,
      [producerId]
    );

    // 3. Products and sales
    const productSummary = await db.query(
      `SELECT
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock
       FROM products
       WHERE producer_id = ?`,
      [producerId]
    );

    const salesSummary = await db.query(
      `SELECT
        COUNT(DISTINCT oi.order_id) as total_orders,
        COALESCE(SUM(oi.total_item_price), 0) as total_revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.producer_id = ? AND o.status != 'cancelled'`,
      [producerId]
    );

    // 4. Available waste listings in market
    const marketWaste = await db.query(
      `SELECT COUNT(*) as available_listings, COALESCE(SUM(available_quantity_kg), 0) as total_available_kg
       FROM waste_listings
       WHERE status IN ('available', 'partially_reserved') AND available_quantity_kg > 0`
    );

    res.json({
      success: true,
      stats: {
        totalWasteCollectedKg: parseFloat(collectionSummary[0].total_waste_collected_kg || 0),
        pendingRequests: parseInt(collectionSummary[0].pending_requests || 0),
        acceptedRequests: parseInt(collectionSummary[0].accepted_requests || 0),
        totalCompostProducedKg: parseFloat(batchSummary[0].total_compost_kg || 0),
        activeBatches: parseInt(batchSummary[0].active_batches || 0),
        totalProducts: parseInt(productSummary[0].total_products || 0),
        totalOrders: parseInt(salesSummary[0].total_orders || 0),
        totalRevenue: parseFloat(salesSummary[0].total_revenue || 0),
        availableMarketWasteKg: parseFloat(marketWaste[0].total_available_kg || 0)
      }
    });
  } catch (err) {
    console.error('getProducerDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch producer stats.', error: err.message });
  }
};
