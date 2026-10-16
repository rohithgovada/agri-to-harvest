const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role, address, city, lat, lng } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !role || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const validRoles = ['shopkeeper', 'compost_producer', 'farmer'];
    if (!validRoles.includes(role)) {
      if (role === 'admin') {
        return res.status(403).json({ success: false, message: 'Admin accounts cannot be registered publicly.' });
      }
      return res.status(400).json({ success: false, message: 'Invalid user role selected.' });
    }

    // Check if email already registered
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userCity = city || 'Hyderabad';
    const userLat = lat || 17.385044;
    const userLng = lng || 78.486671;

    const result = await db.query(
      `INSERT INTO users (name, email, phone, password_hash, role, address, city, lat, lng, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash, role, address.trim(), userCity, userLat, userLng]
    );

    const newUserId = result.insertId;

    // Log registration
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [newUserId, 'USER_REGISTERED', 'user', newUserId, `New ${role} registered: ${email}`]
    );

    // Welcome notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [newUserId, 'Welcome to Agri to Harvest!', `Your ${role.replace('_', ' ')} account has been set up successfully.`]
    );

    const token = jwt.sign({ id: newUserId, role, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUserId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        role,
        address: address.trim(),
        city: userCity,
        lat: userLat,
        lng: userLng,
        status: 'active'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const users = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account has been suspended by an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        city: user.city,
        lat: user.lat,
        lng: user.lng,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, lat, lng } = req.body;
    await db.query(
      `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone),
       address = COALESCE(?, address), city = COALESCE(?, city),
       lat = COALESCE(?, lat), lng = COALESCE(?, lng), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, phone, address, city, lat, lng, req.user.id]
    );

    const updated = await db.query('SELECT id, name, email, phone, role, address, city, lat, lng, status FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: 'Profile updated successfully.', user: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.', error: err.message });
  }
};

exports.getDemoAccounts = async (req, res) => {
  try {
    const demoUsers = await db.query(
      `SELECT id, name, email, role, city, address FROM users
       WHERE email IN ('admin@agritoharvest.org', 'ramesh.veggies@gmail.com', 'suresh.compost@gmail.com', 'venkat.farmer@gmail.com')`
    );
    res.json({ success: true, accounts: demoUsers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.demoLoginAs = async (req, res) => {
  try {
    const { role } = req.body;
    const emailMap = {
      admin: 'admin@agritoharvest.org',
      shopkeeper: 'ramesh.veggies@gmail.com',
      compost_producer: 'suresh.compost@gmail.com',
      farmer: 'venkat.farmer@gmail.com'
    };

    const targetEmail = emailMap[role];
    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Invalid demo role requested.' });
    }

    const users = await db.query('SELECT * FROM users WHERE email = ?', [targetEmail]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'Demo user not found.' });
    }

    const user = users[0];
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: `Logged in as demo ${user.role} (${user.name})`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        city: user.city,
        lat: user.lat,
        lng: user.lng,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
