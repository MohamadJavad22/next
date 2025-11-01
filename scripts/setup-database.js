#!/usr/bin/env node

// 🗄️ Database Setup Script for Next.js Ad Platform
// این اسکریپت دیتابیس را راه‌اندازی می‌کند

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 🔧 Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nextjs_ads',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

console.log('🚀 Starting database setup...');
console.log('📊 Database config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: !!dbConfig.ssl
});

async function setupDatabase() {
  let pool;
  
  try {
    // اتصال به دیتابیس
    console.log('🔌 Connecting to database...');
    pool = new Pool(dbConfig);
    
    // تست اتصال
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // خواندن schema file
    const schemaPath = path.join(__dirname, '../lib/database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading database schema...');
    
    // اجرای schema
    console.log('🔨 Creating tables and indexes...');
    await pool.query(schema);
    
    console.log('✅ Database schema created successfully');
    
    // اضافه کردن sample data
    console.log('🌱 Adding sample data...');
    
    // Sample users
    await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active, is_verified) 
      VALUES 
        ('admin', 'admin@example.com', '$2b$10$example_hash', 'مدیر سیستم', 'admin', true, true),
        ('user1', 'user1@example.com', '$2b$10$example_hash', 'کاربر اول', 'user', true, true),
        ('user2', 'user2@example.com', '$2b$10$example_hash', 'کاربر دوم', 'user', true, true)
      ON CONFLICT (email) DO NOTHING
    `);
    
    // Sample categories
    await pool.query(`
      INSERT INTO categories (name, name_fa, slug, icon, sort_order) 
      VALUES 
        ('Real Estate', 'املاک', 'real-estate', 'home', 1),
        ('Vehicles', 'خودرو', 'vehicles', 'car', 2),
        ('Electronics', 'الکترونیک', 'electronics', 'smartphone', 3),
        ('Fashion', 'مد و پوشاک', 'fashion', 'shirt', 4),
        ('Services', 'خدمات', 'services', 'tool', 5),
        ('Jobs', 'استخدام', 'jobs', 'briefcase', 6)
      ON CONFLICT (slug) DO NOTHING
    `);
    
    // Sample ads
    await pool.query(`
      INSERT INTO ads (
        user_id, category_id, title, description, price, currency, condition,
        latitude, longitude, address, city, province, status, slug
      ) 
      VALUES 
        (2, 1, 'آپارتمان 3 خوابه در تهران', 'آپارتمان زیبا و مدرن با امکانات کامل در منطقه خوب', 2500000000, 'IRR', 'good', 35.6892, 51.3890, 'تهران، خیابان ولیعصر', 'تهران', 'تهران', 'active', 'apartment-3-bedroom-tehran'),
        (3, 2, 'خودرو پژو 206', 'خودرو در شرایط عالی، کم کارکرد، تک مالک', 150000000, 'IRR', 'good', 35.7153, 51.4043, 'تهران، میدان آزادی', 'تهران', 'تهران', 'active', 'peugeot-206-car'),
        (2, 3, 'لپ‌تاپ اپل مک‌بوک', 'لپ‌تاپ اپل مک‌بوک پرو 13 اینچ، سال 2022', 35000000, 'IRR', 'new', 35.6892, 51.3890, 'تهران، خیابان کریمخان', 'تهران', 'تهران', 'active', 'apple-macbook-pro-13')
      ON CONFLICT (slug) DO NOTHING
    `);
    
    console.log('✅ Sample data added successfully');
    
    // نمایش آمار
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const adCount = await pool.query('SELECT COUNT(*) FROM ads');
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    
    console.log('\n📊 Database Statistics:');
    console.log(`👥 Users: ${userCount.rows[0].count}`);
    console.log(`📋 Ads: ${adCount.rows[0].count}`);
    console.log(`📂 Categories: ${categoryCount.rows[0].count}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('🚨 Database setup failed:', error.message);
    console.error('📋 Full error:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// اجرای setup
setupDatabase().catch(console.error);

