const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { sendWelcomeEmail } = require('../utils/emailService');

// JWT Secret (Should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register User
router.post('/signup', async (req, res) => {
    const { email, password, name, location, role, soilType, cropHistory } = req.body;
    
    // Parse cropHistory if it's an array
    const cropHistoryStr = Array.isArray(cropHistory) ? JSON.stringify(cropHistory) : (cropHistory || '[]');

    try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert User
    const crypto = require('crypto');
    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, location, role, soil_type, crop_history, created_at, updated_at, last_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())`,
      [id, email, passwordHash, name, location?.city || null, role || 'farmer', soilType || null, cropHistoryStr]
    );
    
    // Send Welcome Email (non-blocking - won't affect registration if it fails)
    sendWelcomeEmail(email, name).catch(err => {
      console.error('Welcome email error (non-blocking):', err.message);
    });
    
    // Create Token
    const token = jwt.sign({ id: id, role: role || 'farmer' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      user: { 
        id, 
        email, 
        name, 
        role,
        location: location?.city || null,
        soil_type: soilType || null,
        crop_history: cropHistory || []
      }, 
      token 
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Update last active
    await pool.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    // Create Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
        soil_type: user.soil_type,
        crop_history: user.crop_history ? JSON.parse(user.crop_history) : [],
        profile_image_url: user.profile_image_url
      },
      token
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Update User Profile
router.put('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    
    const { name, location, soilType, cropHistory } = req.body;
    
    console.log('Update Profile Req Body:', req.body);

    // Parse cropHistory if it's an array
    const cropHistoryStr = Array.isArray(cropHistory) ? JSON.stringify(cropHistory) : cropHistory;

    await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           location = COALESCE($2, location),
           soil_type = COALESCE($3, soil_type),
           crop_history = COALESCE($4, crop_history)
       WHERE id = $5`,
      [name, location, soilType, cropHistoryStr, userId]
    );

    // Fetch updated user
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    console.log('Updated User from DB:', user);

    // Return improved user object
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      location: user.location,
      soilType: user.soil_type,
      cropHistory: user.crop_history ? JSON.parse(user.crop_history) : [],
      profile_image_url: user.profile_image_url
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get User Profile
router.get('/profile', async (req, res) => {
  // Simple middleware check (In real app, assume middleware sets req.user)
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    
    // Parse crop history if needed (stored as string/json in text field)
    let cropHistory = [];
    try {
      if (user.crop_history) {
        // Try parsing as JSON first, fallback to comma split if needed
        if (user.crop_history.startsWith('[')) {
          cropHistory = JSON.parse(user.crop_history);
        } else {
          cropHistory = user.crop_history.split(',').map(c => c.trim());
        }
      }
    } catch (e) {
      cropHistory = [];
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      location: user.location,
      farm_lat: user.farm_lat,
      farm_lng: user.farm_lng,
      soilType: user.soil_type,
      cropHistory: cropHistory,
      profile_image_url: user.profile_image_url,
      created_at: user.created_at
    });

  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
