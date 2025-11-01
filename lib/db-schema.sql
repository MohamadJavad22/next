-- جدول آگهی‌ها با قابلیت جستجوی جغرافیایی
CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  condition VARCHAR(50) NOT NULL,
  
  -- اطلاعات مکانی
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  
  -- تصاویر (JSON array)
  images TEXT[] DEFAULT '{}',
  primary_image_index INTEGER DEFAULT 0,
  
  -- اطلاعات کاربر
  user_id INTEGER NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_phone VARCHAR(20),
  
  -- وضعیت آگهی
  status VARCHAR(20) DEFAULT 'active', -- active, sold, expired
  views INTEGER DEFAULT 0,
  
  -- زمان‌ها
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- ایندکس برای جستجوی سریع‌تر
CREATE INDEX IF NOT EXISTS idx_ads_location ON ads(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_user ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_created ON ads(created_at DESC);

-- جدول فروشگاه‌ها
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

-- جدول تصاویر فروشگاه
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

-- ایندکس برای فروشگاه‌ها
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shops_city ON shops(city);
CREATE INDEX IF NOT EXISTS idx_shops_created_at ON shops(created_at);
CREATE INDEX IF NOT EXISTS idx_shops_rating ON shops(rating);

CREATE INDEX IF NOT EXISTS idx_shop_images_shop_id ON shop_images(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_images_sort_order ON shop_images(sort_order);

-- Function برای محاسبه فاصله (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- کیلومتر
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


