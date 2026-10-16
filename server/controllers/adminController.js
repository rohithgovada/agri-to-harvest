const db = require('../config/db');

exports.getAdminOverview = async (req, res) => {
  try {
    const userStats = await db.query(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );

    const wasteStats = await db.query(
      `SELECT
        COUNT(*) as total_listings,
        COALESCE(SUM(quantity_kg), 0) as total_listed_kg,
        COALESCE(SUM(CASE WHEN status = 'collected' THEN quantity_kg ELSE 0 END), 0) as total_collected_kg
       FROM waste_listings`
    );

    const compostStats = await db.query(
      `SELECT
        COUNT(*) as total_batches,
        COALESCE(SUM(finished_compost_kg), 0) as total_finished_kg
       FROM compost_production_records`
    );

    const productStats = await db.query(
      `SELECT COUNT(*) as total_products, COALESCE(SUM(stock_quantity), 0) as total_stock FROM products`
    );

    const orderStats = await db.query(
      `SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders WHERE status != 'cancelled'`
    );

    const complaintsCount = await db.query(
      `SELECT COUNT(*) as pending_complaints FROM complaints WHERE status = 'open'`
    );

    res.json({
      success: true,
      stats: {
        usersByRole: userStats,
        waste: wasteStats[0],
        compost: compostStats[0],
        products: productStats[0],
        orders: orderStats[0],
        pendingComplaints: complaintsCount[0].pending_complaints
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, name, email, phone, role, address, city, status, created_at FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.', error: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Admins cannot suspend their own account.' });
    }

    await db.query('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'USER_STATUS_CHANGE', 'user', id, `Changed user #${id} status to ${status}`]
    );

    res.json({ success: true, message: `User status changed to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user status.', error: err.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await db.query(
      `SELECT c.*, u.name as reporter_name, u.email as reporter_email
       FROM complaints c
       JOIN users u ON c.reporter_id = u.id
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints.', error: err.message });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    await db.query(
      `UPDATE complaints SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, admin_notes, id]
    );

    res.json({ success: true, message: 'Complaint record updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update complaint.', error: err.message });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const { target_type, target_id, reason, details } = req.body;
    if (!target_type || !target_id || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide complaint target and reason.' });
    }

    await db.query(
      `INSERT INTO complaints (reporter_id, target_type, target_id, reason, details, status)
       VALUES (?, ?, ?, ?, ?, 'open')`,
      [req.user.id, target_type, target_id, reason, details || '']
    );

    res.status(201).json({ success: true, message: 'Report submitted for administrative review.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to file report.', error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await db.query(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC LIMIT 100`
    );
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs.', error: err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { type } = req.params; // 'users', 'waste', 'orders', 'batches'
    let rows = [];
    let filename = `agri_to_harvest_${type}_export.csv`;

    if (type === 'users') {
      rows = await db.query('SELECT id, name, email, phone, role, city, status, created_at FROM users');
    } else if (type === 'waste') {
      rows = await db.query('SELECT id, shopkeeper_id, title, vegetable_type, quantity_kg, available_quantity_kg, waste_condition, city, price_per_kg, status, created_at FROM waste_listings');
    } else if (type === 'orders') {
      rows = await db.query('SELECT id, order_number, buyer_id, subtotal, delivery_fee, total_amount, status, payment_method, payment_status, created_at FROM orders');
    } else if (type === 'batches') {
      rows = await db.query('SELECT id, batch_code, producer_id, source_waste_type, input_waste_kg, finished_compost_kg, processing_method, status, created_at FROM compost_production_records');
    } else {
      return res.status(400).json({ success: false, message: 'Invalid export type.' });
    }

    if (rows.length === 0) {
      return res.send('No data available');
    }

    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [headers, ...rows.map(r => Object.values(r).map(val => `"${val !== null && val !== undefined ? String(val).replace(/"/g, '""') : ''}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate CSV export.', error: err.message });
  }
};
