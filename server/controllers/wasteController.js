const db = require('../config/db');

// List/Search public waste listings
exports.getPublicListings = async (req, res) => {
  try {
    const { search, type, condition, city, maxPrice, isFree } = req.query;

    let sql = `
      SELECT w.*, u.name as shopkeeper_name, u.phone as shopkeeper_phone, u.city as shopkeeper_city
      FROM waste_listings w
      JOIN users u ON w.shopkeeper_id = u.id
      WHERE w.status IN ('available', 'partially_reserved', 'collection_requested')
      AND w.available_quantity_kg > 0
    `;
    const params = [];

    if (search) {
      sql += ` AND (w.title LIKE ? OR w.description LIKE ? OR w.vegetable_type LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type && type !== 'all') {
      sql += ` AND w.vegetable_type = ?`;
      params.push(type);
    }

    if (condition && condition !== 'all') {
      sql += ` AND w.waste_condition = ?`;
      params.push(condition);
    }

    if (city && city !== 'all') {
      sql += ` AND (w.city LIKE ? OR u.city LIKE ?)`;
      params.push(`%${city}%`, `%${city}%`);
    }

    if (isFree === 'true') {
      sql += ` AND (w.is_free = 1 OR w.price_per_kg = 0)`;
    } else if (maxPrice) {
      sql += ` AND w.price_per_kg <= ?`;
      params.push(parseFloat(maxPrice));
    }

    sql += ` ORDER BY w.created_at DESC`;

    const listings = await db.query(sql, params);
    res.json({ success: true, count: listings.length, listings });
  } catch (err) {
    console.error('getPublicListings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch waste listings.', error: err.message });
  }
};

// Get single listing with details
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listings = await db.query(
      `SELECT w.*, u.name as shopkeeper_name, u.phone as shopkeeper_phone, u.email as shopkeeper_email, u.address as shopkeeper_default_address
       FROM waste_listings w
       JOIN users u ON w.shopkeeper_id = u.id
       WHERE w.id = ?`,
      [id]
    );

    if (!listings || listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Waste listing not found.' });
    }

    res.json({ success: true, listing: listings[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch listing details.', error: err.message });
  }
};

// Shopkeeper: Create new waste listing
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      vegetable_type,
      description,
      quantity_kg,
      waste_condition,
      available_datetime,
      collection_address,
      city,
      lat,
      lng,
      price_per_kg,
      is_free,
      image_url,
      contact_phone
    } = req.body;

    if (!title || !vegetable_type || !quantity_kg || !waste_condition || !available_datetime || !collection_address) {
      return res.status(400).json({ success: false, message: 'Please provide all required waste listing fields.' });
    }

    const qty = parseFloat(quantity_kg);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number in kg.' });
    }

    // Default image if not provided
    const defaultImages = {
      'Leafy Greens': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      'Brassicas & Root Vegetables': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
      'Tomatoes, Gourds & Solanaceae': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      'Dry Husks, Peels & Stems': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
      'Mixed Market Produce': 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80'
    };

    const img = image_url || defaultImages[vegetable_type] || defaultImages['Mixed Market Produce'];
    const isFreeListing = is_free === true || is_free === 'true' || is_free === 1 || is_free === '1';
    const price = isFreeListing ? 0.0 : (parseFloat(price_per_kg) || 0.0);
    const isFreeFlag = (isFreeListing || price <= 0) ? 1 : 0;
    const listingCity = city || req.user.city || 'Hyderabad';
    const listingLat = lat || req.user.lat || 17.385044;
    const listingLng = lng || req.user.lng || 78.486671;
    const phone = contact_phone || req.user.phone;

    const result = await db.query(
      `INSERT INTO waste_listings (
        shopkeeper_id, title, vegetable_type, description, quantity_kg, available_quantity_kg,
        waste_condition, available_datetime, collection_address, city, lat, lng,
        price_per_kg, is_free, image_url, contact_phone, status, is_compostable_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 1)`,
      [
        req.user.id,
        title.trim(),
        vegetable_type,
        description || '',
        qty,
        qty,
        waste_condition,
        available_datetime,
        collection_address.trim(),
        listingCity,
        listingLat,
        listingLng,
        price,
        isFreeFlag,
        img,
        phone
      ]
    );

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'WASTE_LISTING_CREATED', 'waste_listing', result.insertId, `Listed ${qty}kg of ${vegetable_type}: ${title}`]
    );

    res.status(201).json({
      success: true,
      message: 'Vegetable waste listed successfully.',
      listingId: result.insertId,
      listing: {
        id: result.insertId,
        title,
        quantity_kg: qty,
        price_per_kg: price,
        is_free: isFreeFlag === 1
      }
    });
  } catch (err) {
    console.error('createListing error:', err);
    res.status(500).json({ success: false, message: 'Failed to create waste listing.', error: err.message });
  }
};

// Shopkeeper: View own waste listings
exports.getShopkeeperListings = async (req, res) => {
  try {
    const listings = await db.query(
      `SELECT w.*,
       (SELECT COUNT(*) FROM waste_collection_requests r WHERE r.waste_listing_id = w.id) as total_requests,
       (SELECT COUNT(*) FROM waste_collection_requests r WHERE r.waste_listing_id = w.id AND r.status = 'pending') as pending_requests
       FROM waste_listings w
       WHERE w.shopkeeper_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    // Calculate shopkeeper metrics
    const stats = {
      totalListings: listings.length,
      activeListings: listings.filter(l => l.status === 'available' || l.status === 'partially_reserved').length,
      totalWasteKg: listings.reduce((sum, l) => sum + (parseFloat(l.quantity_kg) || 0), 0),
      collectedWasteKg: listings.filter(l => l.status === 'collected').reduce((sum, l) => sum + (parseFloat(l.quantity_kg) || 0), 0)
    };

    res.json({ success: true, stats, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch shopkeeper listings.', error: err.message });
  }
};

// Shopkeeper: Update own listing
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listings = await db.query('SELECT * FROM waste_listings WHERE id = ?', [id]);

    if (!listings || listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const listing = listings[0];
    if (listing.shopkeeper_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this listing.' });
    }

    const { title, vegetable_type, description, quantity_kg, waste_condition, available_datetime, collection_address, price_per_kg, is_free, status } = req.body;

    await db.query(
      `UPDATE waste_listings SET
        title = COALESCE(?, title),
        vegetable_type = COALESCE(?, vegetable_type),
        description = COALESCE(?, description),
        quantity_kg = COALESCE(?, quantity_kg),
        available_quantity_kg = COALESCE(?, available_quantity_kg),
        waste_condition = COALESCE(?, waste_condition),
        available_datetime = COALESCE(?, available_datetime),
        collection_address = COALESCE(?, collection_address),
        price_per_kg = COALESCE(?, price_per_kg),
        is_free = COALESCE(?, is_free),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, vegetable_type, description, quantity_kg, quantity_kg, waste_condition, available_datetime, collection_address, price_per_kg, is_free, status, id]
    );

    res.json({ success: true, message: 'Listing updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update listing.', error: err.message });
  }
};

// Shopkeeper: Delete own listing (if no accepted/collected requests)
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listings = await db.query('SELECT * FROM waste_listings WHERE id = ?', [id]);

    if (!listings || listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const listing = listings[0];
    if (listing.shopkeeper_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this listing.' });
    }

    if (listing.status === 'collected') {
      return res.status(400).json({ success: false, message: 'Cannot delete a completed collection record.' });
    }

    await db.query('DELETE FROM waste_listings WHERE id = ?', [id]);
    res.json({ success: true, message: 'Listing removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete listing.', error: err.message });
  }
};

// Compost Producer: Request collection of available waste
exports.requestCollection = async (req, res) => {
  try {
    const { waste_listing_id, requested_quantity_kg, proposed_pickup_datetime, notes } = req.body;

    if (!waste_listing_id || !requested_quantity_kg || !proposed_pickup_datetime) {
      return res.status(400).json({ success: false, message: 'Please provide listing ID, requested quantity, and proposed pickup date/time.' });
    }

    const reqQty = parseFloat(requested_quantity_kg);
    if (isNaN(reqQty) || reqQty <= 0) {
      return res.status(400).json({ success: false, message: 'Requested quantity must be greater than 0.' });
    }

    // Atomic transaction to ensure concurrency safety
    const result = await db.transaction(async (txQuery) => {
      const listings = await txQuery('SELECT * FROM waste_listings WHERE id = ?', [waste_listing_id]);
      if (!listings || listings.length === 0) {
        throw new Error('Waste listing not found.');
      }

      const listing = listings[0];
      if (listing.status === 'collected' || listing.status === 'cancelled') {
        throw new Error(`This waste listing is no longer available (Status: ${listing.status}).`);
      }

      if (reqQty > listing.available_quantity_kg) {
        throw new Error(`Requested quantity (${reqQty}kg) exceeds current available quantity (${listing.available_quantity_kg}kg).`);
      }

      // Insert collection request
      const reqInsert = await txQuery(
        `INSERT INTO waste_collection_requests (
          waste_listing_id, producer_id, shopkeeper_id, requested_quantity_kg, proposed_pickup_datetime, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [waste_listing_id, req.user.id, listing.shopkeeper_id, reqQty, proposed_pickup_datetime, notes || '']
      );

      // Reserve the quantity
      const newAvail = listing.available_quantity_kg - reqQty;
      const newStatus = newAvail <= 0 ? 'collection_requested' : 'partially_reserved';

      await txQuery(
        `UPDATE waste_listings SET available_quantity_kg = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newAvail, newStatus, waste_listing_id]
      );

      // Notification to shopkeeper
      await txQuery(
        `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
        [
          listing.shopkeeper_id,
          'New Waste Collection Request',
          `${req.user.name} requested ${reqQty}kg from "${listing.title}".`
        ]
      );

      return reqInsert.insertId;
    });

    res.status(201).json({
      success: true,
      message: 'Collection request submitted successfully. The shopkeeper has been notified.',
      requestId: result
    });
  } catch (err) {
    console.error('requestCollection error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to submit collection request.' });
  }
};

// Shopkeeper: View all incoming requests
exports.getRequestsForShopkeeper = async (req, res) => {
  try {
    const requests = await db.query(
      `SELECT r.*, w.title as waste_title, w.vegetable_type, w.waste_condition, w.price_per_kg, w.is_free,
       u.name as producer_name, u.email as producer_email, u.phone as producer_phone, u.address as producer_address
       FROM waste_collection_requests r
       JOIN waste_listings w ON r.waste_listing_id = w.id
       JOIN users u ON r.producer_id = u.id
       WHERE r.shopkeeper_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests.', error: err.message });
  }
};

// Compost Producer: View their own requested collections
exports.getRequestsForProducer = async (req, res) => {
  try {
    const requests = await db.query(
      `SELECT r.*, w.title as waste_title, w.vegetable_type, w.waste_condition, w.collection_address,
       w.city as waste_city, w.lat as waste_lat, w.lng as waste_lng, w.image_url as waste_image,
       u.name as shopkeeper_name, u.phone as shopkeeper_phone, u.email as shopkeeper_email
       FROM waste_collection_requests r
       JOIN waste_listings w ON r.waste_listing_id = w.id
       JOIN users u ON r.shopkeeper_id = u.id
       WHERE r.producer_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch collection requests.', error: err.message });
  }
};

// Update request status (Shopkeeper accepts/rejects, Producer/Shopkeeper marks collected)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actual_collected_kg } = req.body;

    const validStatuses = ['accepted', 'rejected', 'scheduled', 'collected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid collection status.' });
    }

    await db.transaction(async (txQuery) => {
      const requests = await txQuery('SELECT * FROM waste_collection_requests WHERE id = ?', [id]);
      if (!requests || requests.length === 0) {
        throw new Error('Request not found.');
      }

      const request = requests[0];
      const listing = (await txQuery('SELECT * FROM waste_listings WHERE id = ?', [request.waste_listing_id]))[0];

      // Authorization check
      const isShopkeeper = req.user.id === request.shopkeeper_id;
      const isProducer = req.user.id === request.producer_id;
      const isAdmin = req.user.role === 'admin';

      if (!isShopkeeper && !isProducer && !isAdmin) {
        throw new Error('Unauthorized to update this collection request.');
      }

      // If rejected or cancelled, release reserved quantity back to listing
      if ((status === 'rejected' || status === 'cancelled') && request.status !== 'rejected' && request.status !== 'cancelled') {
        const restoredQty = listing.available_quantity_kg + request.requested_quantity_kg;
        await txQuery(
          `UPDATE waste_listings SET available_quantity_kg = ?, status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [restoredQty, listing.id]
        );
      }

      // If marked collected
      let collectedKg = request.actual_collected_kg;
      if (status === 'collected') {
        collectedKg = actual_collected_kg ? parseFloat(actual_collected_kg) : request.requested_quantity_kg;
        await txQuery(
          `UPDATE waste_listings SET status = 'collected', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [listing.id]
        );

        // Audit log
        await txQuery(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
          [req.user.id, 'WASTE_COLLECTED', 'collection_request', request.id, `Collected ${collectedKg}kg waste from listing #${listing.id}`]
        );
      } else if (status === 'accepted') {
        await txQuery(`UPDATE waste_listings SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [listing.id]);
      }

      await txQuery(
        `UPDATE waste_collection_requests SET status = ?, actual_collected_kg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, collectedKg, id]
      );

      // Send notification to the other party
      const notifyTarget = isShopkeeper ? request.producer_id : request.shopkeeper_id;
      await txQuery(
        `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
        [
          notifyTarget,
          `Collection Request ${status.toUpperCase()}`,
          `Your collection request for "${listing.title}" is now marked as ${status}.`
        ]
      );
    });

    res.json({ success: true, message: `Collection request status updated to ${status}.` });
  } catch (err) {
    console.error('updateRequestStatus error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update request status.' });
  }
};
