-- Database Schema for Smart Crop Aid (MySQL 8.0)
CREATE DATABASE IF NOT EXISTS smart_crop_aid;
USE smart_crop_aid;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('farmer', 'admin') DEFAULT 'farmer',
    is_banned BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    farm_size DECIMAL(10, 2),
    farm_lat DECIMAL(10, 8),
    farm_lng DECIMAL(11, 8),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crops Table
CREATE TABLE IF NOT EXISTS crops (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    status ENUM('recommended', 'planted', 'growing', 'harvested', 'failed') DEFAULT 'planted',
    area DECIMAL(10, 2),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    soil_type VARCHAR(100),
    irrigation_type VARCHAR(100),
    notes TEXT,
    yield_amount DECIMAL(10, 2),
    yield_unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pest Reports Table
CREATE TABLE IF NOT EXISTS pest_reports (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    crop_id CHAR(36),
    image_url TEXT NOT NULL,
    pest_name VARCHAR(100),
    confidence DECIMAL(5, 2),
    severity ENUM('low', 'medium', 'high', 'critical'),
    description TEXT,
    ai_analysis TEXT,
    treatment_recommended TEXT,
    treatment_applied TEXT,
    treatment_status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
);

-- Crop Recommendations Table
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    soil_type VARCHAR(50) NOT NULL,
    water_level VARCHAR(20) NOT NULL,
    season VARCHAR(20) NOT NULL,
    recommendations_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    market_name VARCHAR(100),
    location VARCHAR(255),
    region VARCHAR(100),
    date DATE NOT NULL,
    trend ENUM('up', 'down', 'stable'),
    change_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('weather', 'pest', 'price', 'crop', 'system'),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
