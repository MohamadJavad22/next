#!/usr/bin/env node

// 🗄️ Direct SQLite Shops Table Creation
// ایجاد مستقیم جدول فروشگاه‌ها در SQLite

const Database = require('better-sqlite3');
const path = require('path');

console.log('🚀 Creating shops tables directly...');

try {
  // اتصال به دیتابیس SQLite
  const dbPath = path.join(__dirname, '../users.db');
  console.log('🔌 Connecting to SQLite database:', dbPath);
  
  const db = new Database(dbPath);
  
  // ایجاد جدول فروشگاه‌ها
  console.log('🏪 Creating shops table...');
  const createShopsTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      shop_name VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(100),
      website TEXT,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      address TEXT,
      city VARCHAR(100),
      province VARCHAR(100),
      postal_code VARCHAR(20),
      working_hours TEXT,
      services TEXT,
      specialties TEXT,
      social_media TEXT,
      status VARCHAR(20) DEFAULT 'active',
      is_verified BOOLEAN DEFAULT false,
      views INTEGER DEFAULT 0,
      rating DECIMAL(3, 2) DEFAULT 0.0,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  createShopsTable.run();
  console.log('✅ Shops table created successfully');
  
  // ایجاد جدول تصاویر فروشگاه
  console.log('🖼️ Creating shop_images table...');
  const createImagesTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS shop_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      image_alt TEXT,
      sort_order INTEGER DEFAULT 0,
      is_primary BOOLEAN DEFAULT false,
      file_size INTEGER,
      width INTEGER,
      height INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `);
  
  createImagesTable.run();
  console.log('✅ Shop images table created successfully');
  
  // ایجاد ایندکس‌ها
  console.log('📊 Creating indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category)',
    'CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status)',
    'CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude)',
    'CREATE INDEX IF NOT EXISTS idx_shops_city ON shops(city)',
    'CREATE INDEX IF NOT EXISTS idx_shops_created_at ON shops(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_shops_rating ON shops(rating)',
    'CREATE INDEX IF NOT EXISTS idx_shop_images_shop_id ON shop_images(shop_id)',
    'CREATE INDEX IF NOT EXISTS idx_shop_images_sort_order ON shop_images(sort_order)'
  ];
  
  indexes.forEach(indexSql => {
    try {
      db.prepare(indexSql).run();
      console.log('✅ Index created:', indexSql.substring(0, 50) + '...');
    } catch (error) {
      console.log('⚠️  Index already exists or error:', error.message);
    }
  });
  
  // بررسی وجود جداول
  console.log('\n🔍 Verifying tables...');
  
  const shopsTableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='shops'
  `).get();
  
  const imagesTableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='shop_images'
  `).get();
  
  if (shopsTableExists) {
    console.log('✅ Shops table exists');
    
    // نمایش ساختار جدول
    const tableInfo = db.prepare('PRAGMA table_info(shops)').all();
    console.log('📋 Shops table structure:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''}`);
    });
  } else {
    console.log('❌ Shops table not found');
  }
  
  if (imagesTableExists) {
    console.log('✅ Shop images table exists');
  } else {
    console.log('❌ Shop images table not found');
  }
  
  // نمایش تمام جداول موجود
  console.log('\n📋 All tables in database:');
  const allTables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table'
  `).all();
  
  allTables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  
  db.close();
  console.log('\n🎉 SQLite shops setup completed successfully!');
  
} catch (error) {
  console.error('🚨 SQLite setup failed:', error.message);
  console.error('📋 Full error:', error);
  process.exit(1);
}

