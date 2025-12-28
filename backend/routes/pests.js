const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get User Pest Reports
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  try {
    const result = await pool.query('SELECT * FROM pest_reports WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Pest Report
router.post('/', async (req, res) => {
  const { user_id, image_url, pest_name, confidence, severity, description, ai_analysis, treatment_recommended, location } = req.body;
  try {
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    
    await pool.query(
      `INSERT INTO pest_reports (id, user_id, image_url, pest_name, confidence, severity, description, ai_analysis, treatment_recommended, lat, lng, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [id, user_id, image_url, pest_name, confidence, severity, description, ai_analysis, treatment_recommended, location?.lat, location?.lng]
    );
    
    const result = await pool.query('SELECT * FROM pest_reports WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
