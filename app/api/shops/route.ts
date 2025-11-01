import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'users.db');
const db = new Database(dbPath);

// Ensure shops tables exist
try {
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
  
  console.log('✅ Shops tables ready');
} catch (error) {
  console.error('❌ Error creating shops tables:', error);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/shops called');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    let query = `
      SELECT s.*, u.username, u.name as user_name, u.phone as user_phone
      FROM shops s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active'
    `;
    
    let params: any[] = [];
    
    if (userId) {
      query += ' AND s.user_id = ?';
      params.push(parseInt(userId));
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    const shops = db.prepare(query).all(...params);
    
    console.log('✅ Found shops:', shops.length, userId ? `for user ${userId}` : 'total');
    
    return NextResponse.json({
      success: true,
      message: 'فروشگاه‌ها دریافت شدند',
      shops: shops.map(shop => ({
        ...(shop as any),
        working_hours: (shop as any).working_hours ? (() => {
          try {
            return JSON.parse((shop as any).working_hours);
          } catch {
            return [];
          }
        })() : [],
        social_media: (shop as any).social_media ? (() => {
          try {
            return JSON.parse((shop as any).social_media);
          } catch {
            return {};
          }
        })() : {}
      }))
    });
    
  } catch (error) {
    console.error('❌ GET /api/shops error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فروشگاه‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/shops called');
    
    const formData = await request.formData();
    
    // دریافت اطلاعات از formData
    const shopName = formData.get('shopName') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string;
    const address = formData.get('address') as string;
    const latitudeStr = formData.get('latitude') as string;
    const longitudeStr = formData.get('longitude') as string;
    const city = formData.get('city') as string;
    const province = formData.get('province') as string;
    const postalCode = formData.get('postalCode') as string;
    const services = formData.get('services') as string;
    const specialties = formData.get('specialties') as string;
    const workingHoursStr = formData.get('workingHours') as string;
    const socialMediaStr = formData.get('socialMedia') as string;
    const userIdStr = formData.get('userId') as string;
    const userName = formData.get('userName') as string;

    // تبدیل رشته‌ها به عدد
    const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
    const longitude = longitudeStr ? parseFloat(longitudeStr) : null;
    const userId = userIdStr ? parseInt(userIdStr) : null;

    // پارس کردن JSON
    let workingHours = [];
    let socialMedia = {};
    
    try {
      workingHours = workingHoursStr ? JSON.parse(workingHoursStr) : [];
    } catch (e) {
      console.error('Error parsing workingHours:', e);
      workingHours = [];
    }
    
    try {
      socialMedia = socialMediaStr ? JSON.parse(socialMediaStr) : {};
    } catch (e) {
      console.error('Error parsing socialMedia:', e);
      socialMedia = {};
    }

    console.log('🏪 Creating shop:', { 
      shopName, 
      category, 
      userId, 
      latitude, 
      longitude,
      workingHoursLength: workingHours.length 
    });

    // اعتبارسنجی
    if (!shopName || !description || !category || !latitude || !longitude || !userId) {
      console.error('❌ Validation failed:', {
        shopName: !!shopName,
        description: !!description,
        category: !!category,
        latitude: !!latitude,
        longitude: !!longitude,
        userId: !!userId
      });
      return NextResponse.json(
        { error: 'اطلاعات ناقص است' },
        { status: 400 }
      );
    }

    // ایجاد فروشگاه
    const insertShopStmt = db.prepare(`
      INSERT INTO shops (
        user_id, shop_name, description, category, phone, email, website,
        latitude, longitude, address, city, province, postal_code,
        working_hours, services, specialties, social_media, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const shopResult = insertShopStmt.run(
      userId,
      shopName,
      description,
      category,
      phone || null,
      email || null,
      website || null,
      latitude,
      longitude,
      address || null,
      city || null,
      province || null,
      postalCode || null,
      JSON.stringify(workingHours),
      services || null,
      specialties || null,
      JSON.stringify(socialMedia),
      'active'
    );
    
    const shopId = shopResult.lastInsertRowid;
    console.log('✅ Shop created with ID:', shopId);

    // پردازش تصاویر فروشگاه
    const profileImageFile = formData.get('profileImage') as File;
    const galleryImages = formData.getAll('galleryImages') as File[];

    // ذخیره تصویر پروفایل
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        // تبدیل فایل به base64
        const arrayBuffer = await profileImageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = profileImageFile.type || 'image/jpeg';
        const profileImageUrl = `data:${mimeType};base64,${base64}`;
        
        db.prepare(`
          INSERT INTO shop_images (shop_id, image_url, image_alt, sort_order, is_primary)
          VALUES (?, ?, ?, ?, ?)
        `).run(shopId, profileImageUrl, `${shopName} - تصویر پروفایل`, 0, 1);
        
        console.log('✅ Profile image saved');
      } catch (error) {
        console.error('❌ Error saving profile image:', error);
      }
    }

    // ذخیره تصاویر گالری
    for (let index = 0; index < galleryImages.length; index++) {
      const file = galleryImages[index];
      if (file && file.size > 0) {
        try {
          // تبدیل فایل به base64
          const arrayBuffer = await file.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = file.type || 'image/jpeg';
          const galleryImageUrl = `data:${mimeType};base64,${base64}`;
          
          db.prepare(`
            INSERT INTO shop_images (shop_id, image_url, image_alt, sort_order, is_primary)
            VALUES (?, ?, ?, ?, ?)
          `).run(shopId, galleryImageUrl, `${shopName} - تصویر ${index + 1}`, index + 1, 0);
          
          console.log(`✅ Gallery image ${index + 1} saved`);
        } catch (error) {
          console.error(`❌ Error saving gallery image ${index + 1}:`, error);
        }
      }
    }

    // دریافت اطلاعات فروشگاه ایجاد شده
    const shop = db.prepare(`
      SELECT s.*, u.username, u.name as user_name, u.phone as user_phone
      FROM shops s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(shopId);

    console.log('✅ Shop creation completed:', { shopId });

    return NextResponse.json({
      success: true,
      message: 'فروشگاه با موفقیت ایجاد شد',
      shop: {
        ...(shop as any),
        working_hours: JSON.parse((shop as any).working_hours),
        social_media: JSON.parse((shop as any).social_media)
      }
    });
    
  } catch (error) {
    console.error('❌ POST /api/shops error:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد فروشگاه' },
      { status: 500 }
    );
  }
}
