const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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

// Apply admin verification to all routes
router.use(verifyAdmin);

// GET /admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userRows = await pool.query('SELECT COUNT(*) as count FROM users');
    const activeRows = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_banned = FALSE');
    const pestRows = await pool.query('SELECT COUNT(*) as count FROM pest_reports');
    const recommendationRows = await pool.query('SELECT COUNT(*) as count FROM crop_recommendations');
    const cropRows = await pool.query('SELECT COUNT(*) as count FROM crops');

    // Convert BigInt counts to Number for JSON serialization (PostgreSQL returns BigInt for COUNT)
    const stats = {
      totalUsers: Number(userRows.rows[0].count),
      activeUsers: Number(activeRows.rows[0].count),
      pestDetections: Number(pestRows.rows[0].count),
      chatInteractions: Number(recommendationRows.rows[0].count),
      cropRecommendations: Number(cropRows.rows[0].count),
      marketChecks: 0
    };
    
    // Recent Activity
    const recentPests = await pool.query(`
      SELECT p.id, p.created_at, p.pest_name, p.description, u.name as user_name
      FROM pest_reports p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    const activities = recentPests.rows.map(p => ({
       id: p.id,
       userId: 'system',
       type: 'pest-detection',
       details: `${p.user_name || 'User'} detected ${p.pest_name || 'Unknown Pest'}`,
       timestamp: p.created_at
    }));

    res.json({ stats, activities });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, email, name, phone, role, is_banned, location,
        farm_size, profile_image_url, created_at, updated_at, last_active
      FROM users
      ORDER BY created_at DESC
    `);

    // Convert MySQL TINYINT to proper Boolean for is_banned
    const usersWithBooleans = result.rows.map(user => ({
      ...user,
      is_banned: Boolean(user.is_banned)
    }));

    res.json({ users: usersWithBooleans });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /admin/users/:id/ban - Ban a user
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from banning themselves
    if (id === req.adminUser.id) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }

    const result = await pool.query(
      'UPDATE users SET is_banned = TRUE, updated_at = NOW() WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /admin/users/:id/unban - Unban a user
router.put('/users/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET is_banned = FALSE, updated_at = NOW() WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/pest-reports - List all pest reports
router.get('/pest-reports', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.user_id, p.crop_id, p.image_url, p.pest_name, p.confidence,
        p.severity, p.description, p.ai_analysis, p.treatment_recommended,
        p.treatment_status, p.created_at,
        u.name as user_name, u.email as user_email,
        c.crop_name
      FROM pest_reports p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN crops c ON p.crop_id = c.id
      ORDER BY p.created_at DESC
    `);

    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get pest reports error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/crops - List all crops
router.get('/crops', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.user_id, c.crop_name, c.variety, c.planting_date,
        c.expected_harvest_date, c.actual_harvest_date, c.status,
        c.area, c.soil_type, c.irrigation_type, c.notes,
        c.yield_amount, c.yield_unit, c.created_at,
        u.name as user_name, u.email as user_email
      FROM crops c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);

    res.json({ crops: result.rows });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/recommendations - List all crop recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id, r.user_id, r.soil_type, r.water_level, r.season,
        r.recommendations_json, r.created_at,
        u.name as user_name, u.email as user_email
      FROM crop_recommendations r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 500
    `);

    // Parse JSON recommendations
    const parsedRecommendations = result.rows.map(r => ({
      ...r,
      recommendations: JSON.parse(r.recommendations_json || '[]')
    }));

    res.json({ recommendations: parsedRecommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
