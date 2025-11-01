#!/usr/bin/env node

// 🗄️ SQLite Database Setup Script for Shops
// این اسکریپت جدول فروشگاه‌ها را به دیتابیس SQLite اضافه می‌کند

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SQLite shops table setup...');

async function setupShopsTable() {
  let db;
  
  try {
    // اتصال به دیتابیس SQLite
    const dbPath = path.join(__dirname, '../users.db');
    console.log('🔌 Connecting to SQLite database:', dbPath);
    
    db = new Database(dbPath);
    
    // خواندن schema از فایل
    const schemaPath = path.join(__dirname, '../lib/shops-sqlite-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading database schema...');
    
    // تقسیم schema به دستورات جداگانه
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('🔨 Creating shops tables and indexes...');
    
    // اجرای هر دستور
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          db.exec(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('⚠️  Table already exists, skipping...');
          } else {
            console.error('❌ Error executing statement:', statement.substring(0, 50));
            console.error('Error:', error.message);
          }
        }
      }
    }
    
    console.log('✅ Shops tables created successfully');
    
    // بررسی وجود جدول فروشگاه‌ها
    const shopsTableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='shops'
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
    
    // بررسی وجود جدول تصاویر فروشگاه
    const imagesTableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='shop_images'
    `).get();
    
    if (imagesTableExists) {
      console.log('✅ Shop images table exists');
    } else {
      console.log('❌ Shop images table not found');
    }
    
    console.log('\n🎉 SQLite shops setup completed successfully!');
    
  } catch (error) {
    console.error('🚨 SQLite setup failed:', error.message);
    console.error('📋 Full error:', error);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// اجرای setup
setupShopsTable().catch(console.error);
