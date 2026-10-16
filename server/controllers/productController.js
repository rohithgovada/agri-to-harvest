const db = require('../config/db');

// Browse all active products with filters and search
exports.getPublicProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, producerId } = req.query;

    let sql = `
      SELECT p.*, u.name as producer_name, u.city as producer_city, u.phone as producer_phone
      FROM products p
      JOIN users u ON p.producer_id = u.id
      WHERE p.status = 'active'
    `;
    const params = [];

    if (search) {
      sql += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
      sql += ` AND p.category = ?`;
      params.push(category);
    }

    if (producerId) {
      sql += ` AND p.producer_id = ?`;
      params.push(producerId);
    }

    if (minPrice) {
      sql += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Sorting
    if (sort === 'price_asc') {
      sql += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      sql += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating') {
      sql += ` ORDER BY p.rating DESC`;
    } else {
      sql += ` ORDER BY p.created_at DESC`;
    }

    const products = await db.query(sql, params);
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('getPublicProducts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products.', error: err.message });
  }
};

// Get single product with reviews
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await db.query(
      `SELECT p.*, u.name as producer_name, u.phone as producer_phone, u.city as producer_city, u.address as producer_address,
       b.batch_code, b.processing_method, b.npk_ratio, b.quality_notes
       FROM products p
       JOIN users u ON p.producer_id = u.id
       LEFT JOIN compost_production_records b ON p.batch_id = b.id
       WHERE p.id = ?`,
      [id]
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const reviews = await db.query(
      `SELECT r.*, u.name as farmer_name, u.city as farmer_city
       FROM reviews r
       JOIN users u ON r.farmer_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({ success: true, product: products[0], reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product details.', error: err.message });
  }
};

// Producer: View own products
exports.getProducerProducts = async (req, res) => {
  try {
    const products = await db.query(
      `SELECT p.*, b.batch_code
       FROM products p
       LEFT JOIN compost_production_records b ON p.batch_id = b.id
       WHERE p.producer_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products.', error: err.message });
  }
};

// Producer: Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      price,
      stock_quantity,
      unit,
      image_url,
      batch_id,
      production_date,
      usage_instructions,
      delivery_options,
      is_verified_organic
    } = req.body;

    if (!title || !category || !description || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required product information.' });
    }

    const numPrice = parseFloat(price);
    const numStock = parseFloat(stock_quantity);

    if (numPrice <= 0 || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Price must be positive and stock cannot be negative.' });
    }

    const defaultImgs = {
      'Vegetable Compost': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
      'Vermicompost': 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80',
      'Organic Manure': 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?auto=format&fit=crop&w=800&q=80',
      'Soil Conditioners': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
      'Bio-fertilizers': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'
    };

    const img = image_url || defaultImgs[category] || defaultImgs['Vegetable Compost'];
    const pDate = production_date || new Date().toISOString().split('T')[0];

    const result = await db.query(
      `INSERT INTO products (
        producer_id, batch_id, title, category, description, price, stock_quantity,
        unit, image_url, production_date, usage_instructions, delivery_options,
        is_verified_organic, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        req.user.id,
        batch_id || null,
        title.trim(),
        category,
        description.trim(),
        numPrice,
        numStock,
        unit || 'kg',
        img,
        pDate,
        usage_instructions || '',
        delivery_options || 'Delivery & Pickup',
        is_verified_organic !== false ? 1 : 0
      ]
    );

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'PRODUCT_CREATED', 'product', result.insertId, `Listed product: ${title} (₹${numPrice})`]
    );

    res.status(201).json({
      success: true,
      message: 'Organic product listed on marketplace successfully.',
      productId: result.insertId
    });
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ success: false, message: 'Failed to create product listing.', error: err.message });
  }
};

// Producer: Update own product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prod = products[0];
    if (prod.producer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this product.' });
    }

    const {
      title,
      category,
      description,
      price,
      stock_quantity,
      unit,
      image_url,
      usage_instructions,
      delivery_options,
      status
    } = req.body;

    await db.query(
      `UPDATE products SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        stock_quantity = COALESCE(?, stock_quantity),
        unit = COALESCE(?, unit),
        image_url = COALESCE(?, image_url),
        usage_instructions = COALESCE(?, usage_instructions),
        delivery_options = COALESCE(?, delivery_options),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, category, description, price, stock_quantity, unit, image_url, usage_instructions, delivery_options, status, id]
    );

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product.', error: err.message });
  }
};

// Producer: Delete own product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (products[0].producer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product removed from marketplace.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product.', error: err.message });
  }
};
