const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.adminUser = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================
// PUBLIC ROUTES
// ============================

// GET /market-prices - Get all market prices (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, crop_name, variety, price, unit, market_name as market,
        location as district, region as state,
        price as minPrice, price as maxPrice, price as modalPrice,
        date, trend, change_percentage
      FROM market_prices
      ORDER BY date DESC, crop_name ASC
    `);

    // Map to frontend format
    const formattedPrices = result.rows.map(p => ({
      id: p.id,
      crop: p.crop_name,
      variety: p.variety || '',
      market: p.market || '',
      district: p.district || '',
      state: p.state || '',
      minPrice: Number(p.price) || 0,
      maxPrice: Number(p.price) || 0,
      modalPrice: Number(p.price) || 0,
      date: p.date ? new Date(p.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      trend: p.trend || 'stable',
      changePercentage: Number(p.change_percentage) || 0
    }));

    res.json({ prices: formattedPrices });
  } catch (error) {
    console.error('Get market prices error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================
// ADMIN ROUTES
// ============================

// POST /market-prices/admin - Create new market price (admin only)
router.post('/admin', verifyAdmin, async (req, res) => {
  try {
    const { crop_name, variety, price, unit, market_name, location, region, date, trend, change_percentage } = req.body;

    if (!crop_name || !price || !unit) {
      return res.status(400).json({ error: 'crop_name, price, and unit are required' });
    }

    const id = crypto.randomUUID();
    const priceDate = date || new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO market_prices 
       (id, crop_name, variety, price, unit, market_name, location, region, date, trend, change_percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, crop_name, variety || null, price, unit, market_name || null, location || null, region || null, priceDate, trend || 'stable', change_percentage || 0]
    );

    res.status(201).json({ 
      message: 'Market price created successfully',
      id
    });
  } catch (error) {
    console.error('Create market price error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /market-prices/admin/:id - Update market price (admin only)
router.put('/admin/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { crop_name, variety, price, unit, market_name, location, region, date, trend, change_percentage } = req.body;

    const result = await pool.query(
      `UPDATE market_prices SET 
       crop_name = COALESCE($1, crop_name),
       variety = COALESCE($2, variety),
       price = COALESCE($3, price),
       unit = COALESCE($4, unit),
       market_name = COALESCE($5, market_name),
       location = COALESCE($6, location),
       region = COALESCE($7, region),
       date = COALESCE($8, date),
       trend = COALESCE($9, trend),
       change_percentage = COALESCE($10, change_percentage),
       updated_at = NOW()
       WHERE id = $11`,
      [crop_name, variety, price, unit, market_name, location, region, date, trend, change_percentage, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Market price not found' });
    }

    res.json({ message: 'Market price updated successfully' });
  } catch (error) {
    console.error('Update market price error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /market-prices/admin/:id - Delete market price (admin only)
router.delete('/admin/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM market_prices WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Market price not found' });
    }

    res.json({ message: 'Market price deleted successfully' });
  } catch (error) {
    console.error('Delete market price error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /market-prices/admin - Get all market prices with admin view (admin only)
router.get('/admin', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, crop_name, variety, price, unit, market_name,
        location, region, date, trend, change_percentage,
        created_at, updated_at
      FROM market_prices
      ORDER BY updated_at DESC
    `);

    // Convert Decimal to Number for JSON serialization
    const formattedPrices = result.rows.map(p => ({
      ...p,
      price: Number(p.price),
      change_percentage: p.change_percentage ? Number(p.change_percentage) : null
    }));

    res.json({ prices: formattedPrices });
  } catch (error) {
    console.error('Get admin market prices error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
