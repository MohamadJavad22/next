// 🗄️ Database Models for Next.js Ad Platform
// Data Access Layer (DAL) for all database operations

import { 
  executeQuery, 
  executeSingle, 
  executeTransaction,
  DatabaseUser,
  DatabaseAd,
  DatabaseAdImage,
  DatabaseCategory
} from './database-config';

// 👤 User Model
export class UserModel {
  // Create new user
  static async create(userData: {
    username: string;
    email: string;
    password_hash: string;
    phone?: string;
    full_name?: string;
    role?: 'user' | 'admin' | 'moderator';
  }): Promise<DatabaseUser> {
    const query = `
      INSERT INTO users (username, email, password_hash, phone, full_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await executeSingle<DatabaseUser>(query, [
      userData.username,
      userData.email,
      userData.password_hash,
      userData.phone,
      userData.full_name,
      userData.role || 'user'
    ]);
    
    if (!result) throw new Error('Failed to create user');
    return result;
  }

  // Get user by ID
  static async findById(id: number): Promise<DatabaseUser | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
    return await executeSingle<DatabaseUser>(query, [id]);
  }

  // Get user by email
  static async findByEmail(email: string): Promise<DatabaseUser | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    return await executeSingle<DatabaseUser>(query, [email]);
  }

  // Get user by username
  static async findByUsername(username: string): Promise<DatabaseUser | null> {
    const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
    return await executeSingle<DatabaseUser>(query, [username]);
  }

  // Update user
  static async update(id: number, updates: Partial<DatabaseUser>): Promise<DatabaseUser | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    return await executeSingle<DatabaseUser>(query, [id, ...values]);
  }

  // Delete user (soft delete)
  static async delete(id: number): Promise<boolean> {
    const query = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await executeQuery(query, [id]);
    return result.length > 0;
  }

  // Get user stats
  static async getUserStats(id: number) {
    const query = `
      SELECT 
        COUNT(a.id) as total_ads,
        COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_ads,
        COUNT(CASE WHEN a.status = 'sold' THEN 1 END) as sold_ads,
        COALESCE(SUM(a.views), 0) as total_views,
        COUNT(f.id) as total_favorites
      FROM users u
      LEFT JOIN ads a ON u.id = a.user_id
      LEFT JOIN user_favorites f ON u.id = f.user_id
      WHERE u.id = $1 AND u.is_active = true
      GROUP BY u.id
    `;
    
    return await executeSingle(query, [id]);
  }
}

// 📋 Ad Model
export class AdModel {
  // Create new ad
  static async create(adData: {
    user_id: number;
    category_id?: number;
    title: string;
    description: string;
    price?: number;
    currency?: string;
    condition: 'new' | 'good' | 'fair' | 'poor';
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
  }): Promise<DatabaseAd> {
    const query = `
      INSERT INTO ads (
        user_id, category_id, title, description, price, currency, condition,
        latitude, longitude, address, city, province, postal_code,
        slug, meta_title, meta_description, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    
    const result = await executeSingle<DatabaseAd>(query, [
      adData.user_id,
      adData.category_id,
      adData.title,
      adData.description,
      adData.price,
      adData.currency || 'IRR',
      adData.condition,
      adData.latitude,
      adData.longitude,
      adData.address,
      adData.city,
      adData.province,
      adData.postal_code,
      adData.slug,
      adData.meta_title,
      adData.meta_description,
      expiresAt
    ]);
    
    if (!result) throw new Error('Failed to create ad');
    return result;
  }

  // Get ad by ID
  static async findById(id: number): Promise<DatabaseAd | null> {
    const query = 'SELECT * FROM ads WHERE id = $1';
    return await executeSingle<DatabaseAd>(query, [id]);
  }

  // Get ads by user ID
  static async findByUserId(userId: number, limit = 50, offset = 0): Promise<DatabaseAd[]> {
    const query = `
      SELECT * FROM ads 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    return await executeQuery<DatabaseAd>(query, [userId, limit, offset]);
  }

  // Get ads by location (bounds)
  static async findByLocation(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, limit = 100): Promise<DatabaseAd[]> {
    const query = `
      SELECT * FROM ads 
      WHERE latitude BETWEEN $1 AND $2 
      AND longitude BETWEEN $3 AND $4 
      AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT $5
    `;
    
    return await executeQuery<DatabaseAd>(query, [
      bounds.south,
      bounds.north,
      bounds.west,
      bounds.east,
      limit
    ]);
  }

  // Get ads by category
  static async findByCategory(categoryId: number, limit = 50, offset = 0): Promise<DatabaseAd[]> {
    const query = `
      SELECT * FROM ads 
      WHERE category_id = $1 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    return await executeQuery<DatabaseAd>(query, [categoryId, limit, offset]);
  }

  // Search ads
  static async search(query: string, filters: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    city?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<DatabaseAd[]> {
    let whereClause = "WHERE status = 'active' AND (title ILIKE $1 OR description ILIKE $1)";
    const params: any[] = [`%${query}%`];
    let paramIndex = 2;

    if (filters.categoryId) {
      whereClause += ` AND category_id = $${paramIndex}`;
      params.push(filters.categoryId);
      paramIndex++;
    }

    if (filters.minPrice) {
      whereClause += ` AND price >= $${paramIndex}`;
      params.push(filters.minPrice);
      paramIndex++;
    }

    if (filters.maxPrice) {
      whereClause += ` AND price <= $${paramIndex}`;
      params.push(filters.maxPrice);
      paramIndex++;
    }

    if (filters.condition) {
      whereClause += ` AND condition = $${paramIndex}`;
      params.push(filters.condition);
      paramIndex++;
    }

    if (filters.city) {
      whereClause += ` AND city ILIKE $${paramIndex}`;
      params.push(`%${filters.city}%`);
      paramIndex++;
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const finalQuery = `
      SELECT * FROM ads 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    return await executeQuery<DatabaseAd>(finalQuery, params);
  }

  // Update ad
  static async update(id: number, updates: Partial<DatabaseAd>): Promise<DatabaseAd | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE ads 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    return await executeSingle<DatabaseAd>(query, [id, ...values]);
  }

  // Delete ad
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM ads WHERE id = $1';
    const result = await executeQuery(query, [id]);
    return result.length > 0;
  }

  // Increment views
  static async incrementViews(id: number): Promise<void> {
    const query = 'UPDATE ads SET views = views + 1 WHERE id = $1';
    await executeQuery(query, [id]);
  }

  // Get popular ads
  static async getPopular(limit = 20): Promise<DatabaseAd[]> {
    const query = `
      SELECT * FROM ads 
      WHERE status = 'active'
      ORDER BY views DESC, favorites_count DESC
      LIMIT $1
    `;
    
    return await executeQuery<DatabaseAd>(query, [limit]);
  }

  // Get recent ads
  static async getRecent(limit = 20): Promise<DatabaseAd[]> {
    const query = `
      SELECT * FROM ads 
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    return await executeQuery<DatabaseAd>(query, [limit]);
  }
}

// 🖼️ Ad Image Model
export class AdImageModel {
  // Create new image
  static async create(imageData: {
    ad_id: number;
    image_url: string;
    image_alt?: string;
    sort_order?: number;
    is_primary?: boolean;
    file_size?: number;
    width?: number;
    height?: number;
  }): Promise<DatabaseAdImage> {
    const query = `
      INSERT INTO ad_images (ad_id, image_url, image_alt, sort_order, is_primary, file_size, width, height)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await executeSingle<DatabaseAdImage>(query, [
      imageData.ad_id,
      imageData.image_url,
      imageData.image_alt,
      imageData.sort_order || 0,
      imageData.is_primary || false,
      imageData.file_size,
      imageData.width,
      imageData.height
    ]);
    
    if (!result) throw new Error('Failed to create ad image');
    return result;
  }

  // Get images by ad ID
  static async findByAdId(adId: number): Promise<DatabaseAdImage[]> {
    const query = `
      SELECT * FROM ad_images 
      WHERE ad_id = $1 
      ORDER BY sort_order ASC, created_at ASC
    `;
    
    return await executeQuery<DatabaseAdImage>(query, [adId]);
  }

  // Get primary image by ad ID
  static async getPrimaryByAdId(adId: number): Promise<DatabaseAdImage | null> {
    const query = `
      SELECT * FROM ad_images 
      WHERE ad_id = $1 AND is_primary = true
      LIMIT 1
    `;
    
    return await executeSingle<DatabaseAdImage>(query, [adId]);
  }

  // Update image
  static async update(id: number, updates: Partial<DatabaseAdImage>): Promise<DatabaseAdImage | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE ad_images 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    
    return await executeSingle<DatabaseAdImage>(query, [id, ...values]);
  }

  // Delete image
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM ad_images WHERE id = $1';
    const result = await executeQuery(query, [id]);
    return result.length > 0;
  }

  // Delete all images by ad ID
  static async deleteByAdId(adId: number): Promise<boolean> {
    const query = 'DELETE FROM ad_images WHERE ad_id = $1';
    const result = await executeQuery(query, [adId]);
    return result.length > 0;
  }
}

// 📂 Category Model
export class CategoryModel {
  // Get all categories
  static async findAll(): Promise<DatabaseCategory[]> {
    const query = `
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC, name ASC
    `;
    
    return await executeQuery<DatabaseCategory>(query);
  }

  // Get category by ID
  static async findById(id: number): Promise<DatabaseCategory | null> {
    const query = 'SELECT * FROM categories WHERE id = $1 AND is_active = true';
    return await executeSingle<DatabaseCategory>(query, [id]);
  }

  // Get category by slug
  static async findBySlug(slug: string): Promise<DatabaseCategory | null> {
    const query = 'SELECT * FROM categories WHERE slug = $1 AND is_active = true';
    return await executeSingle<DatabaseCategory>(query, [slug]);
  }

  // Get subcategories
  static async findSubcategories(parentId: number): Promise<DatabaseCategory[]> {
    const query = `
      SELECT * FROM categories 
      WHERE parent_id = $1 AND is_active = true 
      ORDER BY sort_order ASC, name ASC
    `;
    
    return await executeQuery<DatabaseCategory>(query, [parentId]);
  }
}

// 📊 Analytics Model
export class AnalyticsModel {
  // Get daily stats
  static async getDailyStats(date: Date) {
    const query = `
      SELECT 
        COUNT(*) as total_ads,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_ads,
        COUNT(CASE WHEN created_at::date = $1 THEN 1 END) as new_ads
      FROM ads
    `;
    
    return await executeSingle(query, [date]);
  }

  // Get user stats
  static async getUserStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at::date = CURRENT_DATE THEN 1 END) as new_users,
        COUNT(CASE WHEN last_login::date = CURRENT_DATE THEN 1 END) as active_users
      FROM users
      WHERE is_active = true
    `;
    
    return await executeSingle(query);
  }

  // Get view stats
  static async getViewStats(days = 7) {
    const query = `
      SELECT 
        DATE(viewed_at) as date,
        COUNT(*) as views
      FROM ad_views
      WHERE viewed_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
    `;
    
    return await executeQuery(query);
  }
}

// 🎯 Export all models
export const Models = {
  User: UserModel,
  Ad: AdModel,
  AdImage: AdImageModel,
  Category: CategoryModel,
  Analytics: AnalyticsModel
};

export default Models;

