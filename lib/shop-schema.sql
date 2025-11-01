-- 🏪 Shop Database Schema for Next.js Ad Platform
-- SQLite Database Schema for Shops

-- 🏪 Shops Table
CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    -- Basic Info
    shop_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    website TEXT,
    
    -- Location Info
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Working Hours (JSON)
    working_hours TEXT, -- JSON string
    
    -- Additional Info
    services TEXT,
    specialties TEXT,
    social_media TEXT, -- JSON string
    
    -- Status & Meta
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
    is_verified BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    
    -- Dates
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 🖼️ Shop Images Table
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
);

-- ⭐ Shop Reviews Table
CREATE TABLE IF NOT EXISTS shop_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(shop_id, user_id)
);

-- 📊 Shop Analytics Table
CREATE TABLE IF NOT EXISTS shop_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    calls INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    UNIQUE(shop_id, date)
);

-- 📍 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shops_city ON shops(city);
CREATE INDEX IF NOT EXISTS idx_shops_created_at ON shops(created_at);
CREATE INDEX IF NOT EXISTS idx_shops_rating ON shops(rating);

CREATE INDEX IF NOT EXISTS idx_shop_images_shop_id ON shop_images(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_images_sort_order ON shop_images(sort_order);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_shop_id ON shop_reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_reviews_user_id ON shop_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_reviews_rating ON shop_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_shop_analytics_shop_id ON shop_analytics(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_analytics_date ON shop_analytics(date);

-- 🔄 Update Triggers
CREATE TRIGGER IF NOT EXISTS update_shops_updated_at 
    AFTER UPDATE ON shops
    FOR EACH ROW
    BEGIN
        UPDATE shops SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_shop_reviews_updated_at 
    AFTER UPDATE ON shop_reviews
    FOR EACH ROW
    BEGIN
        UPDATE shop_reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- 📊 View for Shop Stats
CREATE VIEW IF NOT EXISTS shop_stats AS
SELECT 
    s.id,
    s.shop_name,
    s.category,
    s.status,
    s.rating,
    s.review_count,
    s.views,
    s.created_at,
    COUNT(si.id) as image_count,
    COUNT(sr.id) as total_reviews
FROM shops s
LEFT JOIN shop_images si ON s.id = si.shop_id
LEFT JOIN shop_reviews sr ON s.id = sr.shop_id
GROUP BY s.id, s.shop_name, s.category, s.status, s.rating, s.review_count, s.views, s.created_at;

-- 📝 Comments
-- Shops table stores basic shop information
-- Shop images table stores all images associated with shops
-- Shop reviews table stores customer reviews and ratings
-- Shop analytics table stores daily analytics data

