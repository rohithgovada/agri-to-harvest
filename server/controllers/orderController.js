const db = require('../config/db');

// Place an order (supports checkout from cart or direct single-item buy)
exports.createOrder = async (req, res) => {
  try {
    const {
      items, // array of { product_id, quantity } or null to use cart
      fulfillment_type, // 'delivery' or 'pickup'
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      payment_method, // 'UPI / QR', 'Debit/Credit Card', 'Net Banking', 'Cash on Delivery'
      notes
    } = req.body;

    if (!shipping_name || !shipping_phone || !shipping_address) {
      return res.status(400).json({ success: false, message: 'Please provide full shipping details.' });
    }

    const isPickup = fulfillment_type === 'pickup';
    const deliveryFee = isPickup ? 0.0 : 80.0;

    // Use transaction to ensure stock consistency and atomicity
    const orderData = await db.transaction(async (txQuery) => {
      let orderItemsToProcess = [];

      if (items && Array.isArray(items) && items.length > 0) {
        orderItemsToProcess = items;
      } else {
        // Fetch from cart
        const cartRows = await txQuery(
          'SELECT product_id, quantity FROM cart_items WHERE user_id = ?',
          [req.user.id]
        );
        if (!cartRows || cartRows.length === 0) {
          throw new Error('Your cart is empty.');
        }
        orderItemsToProcess = cartRows;
      }

      let subtotal = 0.0;
      const verifiedItems = [];

      // Validate each item against live product stock and price
      for (const item of orderItemsToProcess) {
        const prods = await txQuery('SELECT * FROM products WHERE id = ?', [item.product_id]);
        if (!prods || prods.length === 0) {
          throw new Error(`Product #${item.product_id} no longer exists.`);
        }
        const product = prods[0];

        if (product.status !== 'active') {
          throw new Error(`Product "${product.title}" is currently unavailable.`);
        }

        const qty = parseInt(item.quantity) || 1;
        if (product.stock_quantity < qty) {
          throw new Error(`Insufficient stock for "${product.title}". Requested: ${qty}, Available: ${product.stock_quantity}.`);
        }

        const itemTotal = parseFloat(product.price) * qty;
        subtotal += itemTotal;

        verifiedItems.push({
          product_id: product.id,
          producer_id: product.producer_id,
          product_name: product.title,
          unit: product.unit,
          price_per_unit: parseFloat(product.price),
          quantity: qty,
          total_item_price: itemTotal
        });

        // Deduct stock safely
        const newStock = product.stock_quantity - qty;
        const newProdStatus = newStock === 0 ? 'out_of_stock' : 'active';
        await txQuery(
          'UPDATE products SET stock_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newStock, newProdStatus, product.id]
        );
      }

      const totalAmount = subtotal + deliveryFee;

      // Generate order number
      const orderNumber = `ATH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentRef = `DEMO-PAY-${Date.now().toString().slice(-6)}`;

      // Create Order
      const orderInsert = await txQuery(
        `INSERT INTO orders (
          order_number, buyer_id, subtotal, delivery_fee, total_amount, status,
          fulfillment_type, shipping_name, shipping_phone, shipping_address, shipping_city,
          payment_method, payment_status, payment_ref, notes
        ) VALUES (?, ?, ?, ?, ?, 'order_placed', ?, ?, ?, ?, ?, ?, 'simulated_paid', ?, ?)`,
        [
          orderNumber,
          req.user.id,
          subtotal,
          deliveryFee,
          totalAmount,
          fulfillment_type || 'delivery',
          shipping_name.trim(),
          shipping_phone.trim(),
          shipping_address.trim(),
          shipping_city || 'Hyderabad',
          payment_method || 'UPI / QR',
          paymentRef,
          notes || ''
        ]
      );

      const orderId = orderInsert.insertId;

      // Insert Order Items
      for (const vi of verifiedItems) {
        await txQuery(
          `INSERT INTO order_items (order_id, product_id, producer_id, product_name, quantity, unit, price_per_unit, total_item_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, vi.product_id, vi.producer_id, vi.product_name, vi.quantity, vi.unit, vi.price_per_unit, vi.total_item_price]
        );

        // Notify producer
        await txQuery(
          `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
          [
            vi.producer_id,
            'New Order Received',
            `Farmer ${shipping_name} purchased ${vi.quantity}x ${vi.product_name} in order #${orderNumber}.`
          ]
        );
      }

      // Clear user cart
      await txQuery('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

      // Audit log
      await txQuery(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'ORDER_CREATED', 'order', orderId, `Placed order ${orderNumber} for ₹${totalAmount}`]
      );

      return { orderId, orderNumber, totalAmount, paymentRef };
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully with simulated demo payment confirmation.',
      order: orderData
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to place order.' });
  }
};

// Get orders for current user (Farmer sees own orders; Producer sees orders containing their products)
exports.getMyOrders = async (req, res) => {
  try {
    let orders = [];

    if (req.user.role === 'farmer') {
      orders = await db.query(
        `SELECT o.*,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
         FROM orders o
         WHERE o.buyer_id = ?
         ORDER BY o.created_at DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'compost_producer') {
      orders = await db.query(
        `SELECT DISTINCT o.*, u.name as buyer_name, u.phone as buyer_phone
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN users u ON o.buyer_id = u.id
         WHERE oi.producer_id = ?
         ORDER BY o.created_at DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'admin') {
      orders = await db.query(
        `SELECT o.*, u.name as buyer_name, u.email as buyer_email
         FROM orders o
         JOIN users u ON o.buyer_id = u.id
         ORDER BY o.created_at DESC`
      );
    } else {
      orders = await db.query(
        `SELECT o.*,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
         FROM orders o
         WHERE o.buyer_id = ?
         ORDER BY o.created_at DESC`,
        [req.user.id]
      );
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.', error: err.message });
  }
};

// Get full details of an order including items and invoice breakdown
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await db.query(
      `SELECT o.*, u.name as buyer_name, u.email as buyer_email, u.phone as buyer_phone
       FROM orders o
       JOIN users u ON o.buyer_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Check authorization: farmer must be buyer, or producer must have items in it, or admin
    const items = await db.query(
      `SELECT oi.*, p.image_url, u.name as producer_name, u.phone as producer_phone
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN users u ON oi.producer_id = u.id
       WHERE oi.order_id = ?`,
      [id]
    );

    const isProducerInOrder = items.some(item => item.producer_id === req.user.id);
    const isBuyer = order.buyer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isProducerInOrder && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access to this order is forbidden.' });
    }

    res.json({ success: true, order, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order details.', error: err.message });
  }
};

// Update order status (Producer/Admin moves along lifecycle: confirmed -> processing -> dispatched / ready -> delivered)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['order_placed', 'confirmed', 'processing', 'ready_for_pickup', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition.' });
    }

    const orders = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Restore stock safely
      await db.transaction(async (txQuery) => {
        const items = await txQuery('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
        for (const it of items) {
          await txQuery(
            "UPDATE products SET stock_quantity = stock_quantity + ?, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [it.quantity, it.product_id]
          );
        }
        await txQuery(
          'UPDATE orders SET status = "cancelled", payment_status = "refunded", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [id]
        );
        await txQuery(
          'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, 'ORDER_CANCELLED', 'order', id, `Order ${order.order_number} was cancelled and product stock restored.`]
        );
      });
    } else {
      await db.query('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

      // Notify buyer
      await db.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [order.buyer_id, `Order Status Update: ${status.replace('_', ' ').toUpperCase()}`, `Your order #${order.order_number} is now ${status.replace('_', ' ')}.`]
      );
    }

    res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status.', error: err.message });
  }
};
