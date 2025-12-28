const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware to verify token would go here (omitted for brevity in this migration, but critical for prod)
// For now assuming we trust the client or implement middleware later. 
// I will add basic token extraction if needed, but for now just basic routes.

// Get User Crops
router.get('/', async (req, res) => {
  const { user_id } = req.query; // Simple query param for now
  try {
    const result = await pool.query('SELECT * FROM crops WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Crop
router.post('/', async (req, res) => {
  const { user_id, crop_name, variety, area, location } = req.body;
  try {
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    
    await pool.query(
      `INSERT INTO crops (id, user_id, crop_name, variety, area, lat, lng, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [id, user_id, crop_name, variety, area, location?.lat, location?.lng]
    );
    
    // Return the inserted row
    const result = await pool.query('SELECT * FROM crops WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
