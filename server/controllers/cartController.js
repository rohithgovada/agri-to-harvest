const db = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const items = await db.query(
      `SELECT c.id as cart_item_id, c.quantity, p.id as product_id, p.title, p.price, p.unit,
       p.stock_quantity, p.image_url, p.category, u.name as producer_name, u.city as producer_city
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       JOIN users u ON p.producer_id = u.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    res.json({ success: true, items, subtotal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart.', error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    if (!product_id || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity.' });
    }

    const products = await db.query("SELECT * FROM products WHERE id = ? AND status = 'active'", [product_id]);
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }

    const prod = products[0];
    if (prod.stock_quantity < qty) {
      return res.status(400).json({ success: false, message: `Only ${prod.stock_quantity} units available in stock.` });
    }

    // Check if item already in cart
    const existing = await db.query('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);

    if (existing && existing.length > 0) {
      const newQty = existing[0].quantity + qty;
      if (newQty > prod.stock_quantity) {
        return res.status(400).json({ success: false, message: `Cannot add more. Exceeds available stock (${prod.stock_quantity}).` });
      }
      await db.query('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQty, existing[0].id]);
    } else {
      await db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, qty]);
    }

    res.json({ success: true, message: 'Product added to cart.' });
  } catch (err) {
    console.error('addToCart error:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to cart.', error: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const items = await db.query(
      `SELECT c.*, p.stock_quantity FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?`,
      [id, req.user.id]
    );

    if (!items || items.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    if (qty > items[0].stock_quantity) {
      return res.status(400).json({ success: false, message: `Maximum available stock is ${items[0].stock_quantity}.` });
    }

    await db.query('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [qty, id]);
    res.json({ success: true, message: 'Cart updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update cart.', error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove item.', error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear cart.', error: err.message });
  }
};
