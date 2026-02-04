-- Run this SQL to add the is_banned column to existing users table
-- This is only needed if you already have an existing database

ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE AFTER role;

-- To create an admin user (replace with your desired admin credentials):
-- First, create user normally through the app, then run:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
