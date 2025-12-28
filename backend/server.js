const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Smart Crop Aid Backend is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops')); 
app.use('/api/pests', require('./routes/pests'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/market-prices', require('./routes/market'));
app.use('/api/recommendations', require('./routes/recommendations'));

// Serve Uploaded Images
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Accessible on network at http://<your-ip>:${PORT}`);
});
