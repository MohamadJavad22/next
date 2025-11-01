-- 🗄️ Database Schema for Next.js Ad Platform
-- PostgreSQL Database Schema

-- 👤 Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📝 Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_fa VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📋 Ads Table
CREATE TABLE IF NOT EXISTS ads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    
    -- Basic Info
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'IRR',
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'poor')),
    
    -- Location Info
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Status & Meta
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'expired', 'rejected')),
    views INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    
    -- Dates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- SEO
    slug VARCHAR(250) UNIQUE,
    meta_title VARCHAR(200),
    meta_description TEXT,
    
    -- Indexes for performance
    CONSTRAINT valid_coordinates CHECK (
        latitude BETWEEN -90 AND 90 AND 
        longitude BETWEEN -180 AND 180
    )
);

-- 🖼️ Ad Images Table
CREATE TABLE IF NOT EXISTS ad_images (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_alt TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❤️ User Favorites Table
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, ad_id)
);

-- 💬 Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📊 Ad Views Table (for analytics)
CREATE TABLE IF NOT EXISTS ad_views (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔍 Search History Table
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_filters JSONB,
    results_count INTEGER,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📈 Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_ads INTEGER DEFAULT 0,
    active_ads INTEGER DEFAULT 0,
    new_ads INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- 🏷️ Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    name_fa VARCHAR(50) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🏷️ Ad Tags Junction Table
CREATE TABLE IF NOT EXISTS ad_tags (
    ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (ad_id, tag_id)
);

-- 📍 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ads_location ON ads USING GIST (
    ST_Point(longitude, latitude)
);

CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);
CREATE INDEX IF NOT EXISTS idx_ads_expires_at ON ads(expires_at);
CREATE INDEX IF NOT EXISTS idx_ads_price ON ads(price);
CREATE INDEX IF NOT EXISTS idx_ads_city ON ads(city);

CREATE INDEX IF NOT EXISTS idx_ad_images_ad_id ON ad_images(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_images_sort_order ON ad_images(sort_order);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_ad_id ON user_favorites(ad_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_ad_id ON messages(ad_id);

CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON ad_views(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_viewed_at ON ad_views(viewed_at);

-- 🔄 Update Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 📊 View for Ad Stats
CREATE OR REPLACE VIEW ad_stats AS
SELECT 
    a.id,
    a.title,
    a.status,
    a.price,
    a.created_at,
    a.views,
    a.favorites_count,
    COUNT(ai.id) as image_count,
    COUNT(m.id) as message_count
FROM ads a
LEFT JOIN ad_images ai ON a.id = ai.ad_id
LEFT JOIN messages m ON a.id = m.ad_id
GROUP BY a.id, a.title, a.status, a.price, a.created_at, a.views, a.favorites_count;

-- 🌟 Sample Data
INSERT INTO categories (name, name_fa, slug, icon) VALUES
('Real Estate', 'املاک', 'real-estate', 'home'),
('Vehicles', 'خودرو', 'vehicles', 'car'),
('Electronics', 'الکترونیک', 'electronics', 'smartphone'),
('Fashion', 'مد و پوشاک', 'fashion', 'shirt'),
('Services', 'خدمات', 'services', 'tool'),
('Jobs', 'استخدام', 'jobs', 'briefcase');

-- 📝 Comments
COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON TABLE categories IS 'Ad categories and subcategories';
COMMENT ON TABLE ads IS 'Main ads table with location data';
COMMENT ON TABLE ad_images IS 'Images associated with ads';
COMMENT ON TABLE user_favorites IS 'User favorite ads';
COMMENT ON TABLE messages IS 'Messages between users about ads';
COMMENT ON TABLE ad_views IS 'Ad view tracking for analytics';
COMMENT ON TABLE search_history IS 'User search history';
COMMENT ON TABLE analytics IS 'Daily analytics data';
COMMENT ON TABLE tags IS 'Tags for categorizing ads';
COMMENT ON TABLE ad_tags IS 'Many-to-many relationship between ads and tags';

