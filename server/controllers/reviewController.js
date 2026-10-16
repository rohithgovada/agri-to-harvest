const db = require('../config/db');

exports.addReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const numRating = parseInt(rating);

    if (!product_id || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    // Insert review
    await db.query(
      'INSERT INTO reviews (product_id, farmer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [product_id, req.user.id, numRating, comment || '']
    );

    // Recalculate product rating
    const avgStats = await db.query(
      'SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
      [product_id]
    );

    const total = avgStats[0].total_reviews;
    const avg = Math.round(parseFloat(avgStats[0].avg_rating) * 10) / 10;

    await db.query(
      'UPDATE products SET rating = ?, total_reviews = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avg, total, product_id]
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit review.', error: err.message });
  }
};
