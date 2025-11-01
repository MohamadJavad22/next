#!/usr/bin/env node

// 🔍 Check Ads in SQLite Database

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'users.db');
const db = new Database(dbPath);

console.log('🔍 Checking ads in database...\n');

try {
  // Check if ads table exists
  const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ads'").get();
  
  if (!tableInfo) {
    console.log('❌ Table "ads" does not exist!');
    console.log('Run the app first to create tables.');
    process.exit(1);
  }
  
  console.log('✅ Table "ads" exists\n');
  
  // Get all ads
  const ads = db.prepare('SELECT * FROM ads ORDER BY created_at DESC').all();
  
  console.log(`📊 Total ads in database: ${ads.length}\n`);
  
  if (ads.length === 0) {
    console.log('⚠️ No ads found in database');
  } else {
    console.log('📋 Ads list:');
    console.log('─'.repeat(80));
    
    ads.forEach((ad, index) => {
      console.log(`\n${index + 1}. ID: ${ad.id}`);
      console.log(`   User ID: ${ad.user_id}`);
      console.log(`   Title: ${ad.title}`);
      console.log(`   Price: ${ad.price || 'توافقی'}`);
      console.log(`   Status: ${ad.status}`);
      console.log(`   Location: ${ad.latitude}, ${ad.longitude}`);
      console.log(`   Address: ${ad.address || 'N/A'}`);
      console.log(`   Created: ${ad.created_at}`);
      
      // Get images
      const images = db.prepare('SELECT * FROM ad_images WHERE ad_id = ?').all(ad.id);
      console.log(`   Images: ${images.length}`);
    });
    
    console.log('\n' + '─'.repeat(80));
  }
  
  // Get statistics by user
  const userStats = db.prepare(`
    SELECT user_id, COUNT(*) as count 
    FROM ads 
    GROUP BY user_id
  `).all();
  
  if (userStats.length > 0) {
    console.log('\n📊 Ads per user:');
    userStats.forEach(stat => {
      console.log(`   User ${stat.user_id}: ${stat.count} ads`);
    });
  }
  
  // Get statistics by status
  const statusStats = db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM ads 
    GROUP BY status
  `).all();
  
  if (statusStats.length > 0) {
    console.log('\n📊 Ads by status:');
    statusStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.count} ads`);
    });
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}


