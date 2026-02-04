const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get User Recommendations History
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'User ID required' });

  try {
    const result = await pool.query(
      'SELECT * FROM crop_recommendations WHERE user_id = $1 ORDER BY created_at DESC', 
      [user_id]
    );
    
    // Parse the JSON string back to object for the client
    const history = result.rows.map(row => ({
      ...row,
      recommendations: JSON.parse(row.recommendations_json || '[]')
    }));

    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save Recommendation
router.post('/', async (req, res) => {
  const { user_id, soil_type, water_level, season, recommendations } = req.body;

  // user_id is now optional - allows saving recommendations without login

  try {
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    const recommendationsJson = JSON.stringify(recommendations || []);
    // Ensure user_id is null (not undefined) for MySQL
    const userId = user_id || null;

    await pool.query(
      `INSERT INTO crop_recommendations (id, user_id, soil_type, water_level, season, recommendations_json, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, userId, soil_type, water_level, season, recommendationsJson]
    );
    
    res.status(201).json({ id, message: 'Saved successfully' });
  } catch (error) {
    console.error('Error saving recommendation:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
