import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'users.db');
const db = new Database(dbPath);

// ساخت جدول users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// اضافه کردن ستون role به جدول موجود (اگر وجود ندارد)
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
} catch (error) {
  // ستون از قبل وجود دارد
}

// 📋 ساخت جدول ads برای آگهی‌ها
db.exec(`
  CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    shop_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL,
    condition TEXT DEFAULT 'good',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    city TEXT,
    province TEXT,
    status TEXT DEFAULT 'active',
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL
  )
`);

// Migration: اضافه کردن ستون shop_id اگر وجود ندارد
try {
  // بررسی وجود ستون shop_id
  const tableInfo = db.prepare("PRAGMA table_info(ads)").all() as Array<{ name: string }>;
  const hasShopIdColumn = tableInfo.some(col => col.name === 'shop_id');
  
  if (!hasShopIdColumn) {
    db.exec(`ALTER TABLE ads ADD COLUMN shop_id INTEGER`);
    console.log('✅ Migration: shop_id column added to ads table');
  } else {
    console.log('✅ shop_id column already exists');
  }
} catch (error: any) {
  // اگر خطا رخ داد، سعی می‌کنیم از pragma استفاده کنیم
  try {
    const tableInfo = db.prepare("PRAGMA table_info(ads)").all() as Array<{ name: string }>;
    const hasShopIdColumn = tableInfo.some(col => col.name === 'shop_id');
    if (!hasShopIdColumn) {
      db.exec(`ALTER TABLE ads ADD COLUMN shop_id INTEGER`);
      console.log('✅ Migration: shop_id column added to ads table (second attempt)');
    }
  } catch (e) {
    console.error('❌ Error adding shop_id column:', e);
  }
}

// Migration: اضافه کردن foreign key constraint برای shop_id
try {
  // SQLite doesn't support ALTER TABLE ADD CONSTRAINT, so we'll handle it in queries
  console.log('✅ Foreign key constraint for shop_id will be enforced in queries');
} catch (error) {
  // Ignore
}

// 🖼️ ساخت جدول ad_images برای تصاویر آگهی‌ها
db.exec(`
  CREATE TABLE IF NOT EXISTS ad_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_primary INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
  )
`);

// 🏪 ساخت جدول shops برای فروشگاه‌ها
db.exec(`
  CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    shop_name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    working_hours TEXT,
    services TEXT,
    specialties TEXT,
    social_media TEXT,
    status TEXT DEFAULT 'active',
    is_verified INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    rating REAL DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// 🖼️ ساخت جدول shop_images برای تصاویر فروشگاه‌ها
db.exec(`
  CREATE TABLE IF NOT EXISTS shop_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    image_alt TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary INTEGER DEFAULT 0,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
  )
`);

// 📍 ساخت indexes برای performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
  CREATE INDEX IF NOT EXISTS idx_ads_shop_id ON ads(shop_id);
  CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
  CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);
  CREATE INDEX IF NOT EXISTS idx_ads_location ON ads(latitude, longitude);
  CREATE INDEX IF NOT EXISTS idx_ad_images_ad_id ON ad_images(ad_id);
  
  CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
  CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);
  CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
  CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude);
  CREATE INDEX IF NOT EXISTS idx_shops_city ON shops(city);
  
  CREATE TABLE IF NOT EXISTS shop_followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(shop_id, user_id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_shop_followers_shop_id ON shop_followers(shop_id);
  CREATE INDEX IF NOT EXISTS idx_shop_followers_user_id ON shop_followers(user_id);
  CREATE INDEX IF NOT EXISTS idx_shops_created_at ON shops(created_at);
  CREATE INDEX IF NOT EXISTS idx_shops_rating ON shops(rating);
  CREATE INDEX IF NOT EXISTS idx_shop_images_shop_id ON shop_images(shop_id);
  CREATE INDEX IF NOT EXISTS idx_shop_images_sort_order ON shop_images(sort_order);
`);

console.log('✅ SQLite database initialized with ads and shops tables');

export default db;

