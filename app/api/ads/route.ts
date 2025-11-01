import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

// ✅ SQLite database is always available
console.log('✅ Using SQLite database for ads');

// POST: ایجاد آگهی جدید
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // دریافت user از body (چون cookie کار نمی‌کنه)
    let user: any;
    
    if (data.userId) {
      // User از body
      user = {
        id: data.userId,
        username: data.userName
      };
      console.log('👤 User from body:', user);
    } else {
      // تلاش برای دریافت از cookie
      const cookieStore = await cookies();
      const userCookie = cookieStore.get('user');
      
      console.log('🍪 Cookie check:', {
        hasCookie: !!userCookie,
        cookieValue: userCookie?.value?.substring(0, 50) + '...'
      });
      
      if (!userCookie) {
        console.error('❌ No user found in body or cookie!');
        return NextResponse.json(
          { error: 'لطفا ابتدا وارد شوید' },
          { status: 401 }
        );
      }
      
      user = JSON.parse(userCookie.value);
    }

    // اعتبارسنجی
    if (!data.title || !data.description || !data.latitude || !data.longitude) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص است' },
        { status: 400 }
      );
    }

    // ذخیره در SQLite
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // اگر shop_id داده شده، بررسی کن که آیا کاربر مالک این فروشگاه است
    let shopId = data.shop_id || null;
    if (shopId) {
      const shop = db.prepare('SELECT user_id FROM shops WHERE id = ?').get(shopId) as { user_id: number } | undefined;
      if (!shop || shop.user_id !== user.id) {
        shopId = null; // اگر کاربر مالک فروشگاه نیست، shop_id را null کن
      }
    }

    const insertStmt = db.prepare(`
      INSERT INTO ads (
        user_id, shop_id, title, description, price, condition,
        latitude, longitude, address, status, views,
        created_at, updated_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertStmt.run(
      user.id,
      shopId,
      data.title,
      data.description,
      data.price || null,
      data.condition || 'good',
      data.latitude,
      data.longitude,
      data.address || null,
      'active',
      0,
      new Date().toISOString(),
      new Date().toISOString(),
      expiresAt
    );
    
    const adId = result.lastInsertRowid;
    
    // ذخیره تصاویر
    if (data.images && data.images.length > 0) {
      const imageStmt = db.prepare(`
        INSERT INTO ad_images (ad_id, image_url, sort_order, is_primary)
        VALUES (?, ?, ?, ?)
      `);
      
      for (let i = 0; i < data.images.length; i++) {
        imageStmt.run(adId, data.images[i], i, i === 0 ? 1 : 0);
      }
    }
    
    console.log('✅ آگهی در SQLite ذخیره شد:', adId, data.title);
    
    const newAd = {
      id: adId,
      user_id: user.id,
      title: data.title,
      description: data.description,
      price: data.price,
      condition: data.condition,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      status: 'active',
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'آگهی با موفقیت ثبت شد',
      ad: {
        id: newAd.id,
        title: newAd.title,
        description: newAd.description,
        price: newAd.price,
        latitude: newAd.latitude,
        longitude: newAd.longitude,
        address: newAd.address,
        condition: newAd.condition,
        user_id: newAd.user_id,
        created_at: newAd.created_at,
        status: newAd.status || 'active'
      }
    });

  } catch (error) {
    console.error('خطا در ثبت آگهی:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت آگهی' },
      { status: 500 }
    );
  }
}

// GET: دریافت آگهی‌ها با فیلتر مکانی
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // پارامترهای جدید برای bounds و zoom
    const boundsStr = searchParams.get('bounds');
    const zoom = parseInt(searchParams.get('zoom') || '15');
    
    // پارامترهای قدیمی (backward compatibility)
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '50'); // کیلومتر
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // فیلتر بر اساس کاربر یا فروشگاه
    const userId = searchParams.get('user_id');
    const shopId = searchParams.get('shop_id');

    let filteredAds: any[] = [];

    // اگر shop_id داده شده، فقط آگهی‌های آن فروشگاه را برگردان
    if (shopId) {
      // بررسی وجود ستون shop_id
      const tableInfo = db.prepare("PRAGMA table_info(ads)").all() as Array<{ name: string }>;
      const hasShopIdColumn = tableInfo.some(col => col.name === 'shop_id');

      if (!hasShopIdColumn) {
        console.error('❌ shop_id column does not exist in ads table');
        return NextResponse.json([], { status: 500 });
      }

      const stmt = db.prepare(`
        SELECT ads.*, 
               (SELECT image_url FROM ad_images WHERE ad_id = ads.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM ads 
        WHERE shop_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `);
      
      filteredAds = stmt.all(parseInt(shopId), limit);
      
      // Get all images for each ad
      filteredAds = filteredAds.map((ad: any) => {
        const images = db.prepare('SELECT image_url FROM ad_images WHERE ad_id = ? ORDER BY sort_order').all(ad.id);
        return {
          ...ad,
          images: images.map((img: any) => img.image_url)
        };
      });
      
      console.log(`✅ SQLite: Found ${filteredAds.length} ads for shop ${shopId}`);
      return NextResponse.json(filteredAds);
    }

    // اگر user_id داده شده، فقط آگهی‌های آن کاربر را برگردان (فقط آگهی‌های بدون shop_id)
    if (userId) {
      // بررسی وجود ستون shop_id
      const tableInfo = db.prepare("PRAGMA table_info(ads)").all() as Array<{ name: string }>;
      const hasShopIdColumn = tableInfo.some(col => col.name === 'shop_id');

      let stmt;
      if (hasShopIdColumn) {
        stmt = db.prepare(`
          SELECT ads.*, 
                 (SELECT image_url FROM ad_images WHERE ad_id = ads.id AND is_primary = 1 LIMIT 1) as primary_image
          FROM ads 
          WHERE user_id = ? AND (shop_id IS NULL OR shop_id = '')
          ORDER BY created_at DESC 
          LIMIT ?
        `);
      } else {
        stmt = db.prepare(`
          SELECT ads.*, 
                 (SELECT image_url FROM ad_images WHERE ad_id = ads.id AND is_primary = 1 LIMIT 1) as primary_image
          FROM ads 
          WHERE user_id = ?
          ORDER BY created_at DESC 
          LIMIT ?
        `);
      }
      
      filteredAds = stmt.all(parseInt(userId), limit);
      
      // Get all images for each ad
      filteredAds = filteredAds.map((ad: any) => {
        const images = db.prepare('SELECT image_url FROM ad_images WHERE ad_id = ? ORDER BY sort_order').all(ad.id);
        return {
          ...ad,
          images: images.map((img: any) => img.image_url)
        };
      });
      
      console.log(`✅ SQLite: Found ${filteredAds.length} ads for user ${userId} (excluding shop ads)`);
      return NextResponse.json(filteredAds);
    }

    // فیلتر بر اساس bounds (اولویت اول)
    // اما آگهی‌های کاربرانی که فروشگاه دارند را حذف کن
    if (boundsStr) {
      try {
        const bounds = JSON.parse(decodeURIComponent(boundsStr));
        const { _southWest, _northEast } = bounds;
        
        // بررسی وجود ستون shop_id
        const tableInfo = db.prepare("PRAGMA table_info(ads)").all() as Array<{ name: string }>;
        const hasShopIdColumn = tableInfo.some(col => col.name === 'shop_id');

        let stmt;
        if (hasShopIdColumn) {
          stmt = db.prepare(`
            SELECT ads.*
            FROM ads 
            WHERE ads.latitude BETWEEN ? AND ? 
              AND ads.longitude BETWEEN ? AND ? 
              AND ads.status = ?
              AND (ads.shop_id IS NULL OR ads.shop_id = '')
            ORDER BY ads.created_at DESC 
            LIMIT ?
          `);
        } else {
          stmt = db.prepare(`
            SELECT ads.*
            FROM ads 
            WHERE ads.latitude BETWEEN ? AND ? 
              AND ads.longitude BETWEEN ? AND ? 
              AND ads.status = ?
            ORDER BY ads.created_at DESC 
            LIMIT ?
          `);
        }
        
        filteredAds = stmt.all(
          _southWest.lat,
          _northEast.lat,
          _southWest.lng,
          _northEast.lng,
          'active',
          limit
        );
        
        // Get images for each ad
        filteredAds = filteredAds.map((ad: any) => {
          const images = db.prepare('SELECT image_url FROM ad_images WHERE ad_id = ? ORDER BY sort_order').all(ad.id);
          return {
            ...ad,
            images: images.map((img: any) => img.image_url)
          };
        });
        
        console.log(`🗺️ SQLite: Found ${filteredAds.length} ads within bounds for zoom ${zoom} (excluding shop ads)`);
      } catch (error) {
        console.error('❌ Error parsing bounds:', error);
        filteredAds = [];
      }
    }
    // اگر هیچ فیلتری نباشد، تمام آگهی‌های فعال را برگردان
    // اما آگهی‌های کاربرانی که فروشگاه دارند را حذف کن
    else {
      try {
        // بررسی وجود ستون shop_id
        const tableInfo = db.prepare("PRAGMA table_info(ads)").all() as Array<{ name: string }>;
        const hasShopIdColumn = tableInfo.some(col => col.name === 'shop_id');

        let stmt;
        if (hasShopIdColumn) {
          stmt = db.prepare(`
            SELECT ads.*
            FROM ads 
            WHERE ads.status = ? 
              AND (ads.shop_id IS NULL OR ads.shop_id = '')
            ORDER BY ads.created_at DESC 
            LIMIT ?
          `);
        } else {
          // اگر ستون shop_id وجود ندارد، همه آگهی‌ها را برگردان
          stmt = db.prepare(`
            SELECT ads.*
            FROM ads 
            WHERE ads.status = ?
            ORDER BY ads.created_at DESC 
            LIMIT ?
          `);
        }
        
        filteredAds = hasShopIdColumn ? stmt.all(status, limit) : stmt.all(status, limit);
        
        // Get images for each ad
        filteredAds = filteredAds.map((ad: any) => {
          const images = db.prepare('SELECT image_url FROM ad_images WHERE ad_id = ? ORDER BY sort_order').all(ad.id);
          return {
            ...ad,
            images: images.map((img: any) => img.image_url)
          };
        });
        
        console.log(`✅ SQLite: Found ${filteredAds.length} active ads (excluding shop ads)`);
      } catch (queryError) {
        console.error('❌ Error in else block query:', queryError);
        // Fallback: اگر query با shop_id خطا داد، بدون shop_id امتحان کن
        const stmt = db.prepare(`
          SELECT ads.*
          FROM ads 
          WHERE ads.status = ?
          ORDER BY ads.created_at DESC 
          LIMIT ?
        `);
        filteredAds = stmt.all(status, limit);
        
        filteredAds = filteredAds.map((ad: any) => {
          const images = db.prepare('SELECT image_url FROM ad_images WHERE ad_id = ? ORDER BY sort_order').all(ad.id);
          return {
            ...ad,
            images: images.map((img: any) => img.image_url)
          };
        });
      }
    }

    // محدود کردن تعداد
    filteredAds = filteredAds.slice(0, limit);

    // Debug logging
    console.log('🔍 API returning ads:', filteredAds);
    console.log('🔍 Ads count:', filteredAds.length);
    console.log('🔍 Is array:', Array.isArray(filteredAds));
    
    // Return ads directly as array (for compatibility with frontend)
    return NextResponse.json(filteredAds);

  } catch (error) {
    console.error('خطا در دریافت آگهی‌ها:', error);
    console.error('Error details:', error);
    // Return empty array instead of error object
    return NextResponse.json([], { status: 500 });
  }
}

// محاسبه فاصله بین دو نقطه (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // شعاع زمین به کیلومتر
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

