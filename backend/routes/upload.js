const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart-crop-aid',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // unique_filename: true (default)
  },
});

const upload = multer({ storage: storage });

// Upload Endpoint
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // Cloudinary returns the URL in `req.file.path`
  console.log('✅ Image uploaded to Cloudinary:', req.file.path);
  
  res.json({ 
    url: req.file.path,
    public_id: req.file.filename
  });
});

module.exports = router;
