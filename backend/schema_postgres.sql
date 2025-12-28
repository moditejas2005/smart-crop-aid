-- PostgreSQL Schema for Smart Crop Aid
-- NOTE: Converted from MySQL to PostgreSQL syntax for Neon deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    is_banned BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    soil_type VARCHAR(100),
    crop_history TEXT,
    farm_size DECIMAL(10, 2),
    farm_lat DECIMAL(10, 8),
    farm_lng DECIMAL(11, 8),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crops Table
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    status VARCHAR(20) DEFAULT 'planted' CHECK (status IN ('recommended', 'planted', 'growing', 'harvested', 'failed')),
    area DECIMAL(10, 2),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    soil_type VARCHAR(100),
    irrigation_type VARCHAR(100),
    notes TEXT,
    yield_amount DECIMAL(10, 2),
    yield_unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pest Reports Table
CREATE TABLE IF NOT EXISTS pest_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    pest_name VARCHAR(100),
    confidence DECIMAL(5, 2),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    ai_analysis TEXT,
    treatment_recommended TEXT,
    treatment_applied TEXT,
    treatment_status VARCHAR(20) DEFAULT 'pending' CHECK (treatment_status IN ('pending', 'in_progress', 'completed')),
    cause TEXT,
    prevention TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop Recommendations Table
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    soil_type VARCHAR(50) NOT NULL,
    water_level VARCHAR(20) NOT NULL,
    season VARCHAR(20) NOT NULL,
    recommendations_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    market_name VARCHAR(100),
    location VARCHAR(255),
    region VARCHAR(100),
    date DATE NOT NULL,
    trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable')),
    change_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('weather', 'pest', 'price', 'crop', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id);
CREATE INDEX IF NOT EXISTS idx_pest_reports_user_id ON pest_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
