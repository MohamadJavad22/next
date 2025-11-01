import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'users.db');
const db = new Database(dbPath);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shopId = parseInt(id);
    
    if (isNaN(shopId)) {
      return NextResponse.json(
        { error: 'شناسه فروشگاه نامعتبر است' },
        { status: 400 }
      );
    }

    console.log('🔍 GET /api/shops/' + shopId + ' called');

    // دریافت اطلاعات فروشگاه
    const shop = db.prepare(`
      SELECT s.*, u.username, u.name as user_name, u.phone as user_phone
      FROM shops s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.status = 'active'
    `).get(shopId);

    if (!shop) {
      return NextResponse.json(
        { error: 'فروشگاه یافت نشد' },
        { status: 404 }
      );
    }

    // دریافت تصاویر فروشگاه
    const images = db.prepare(`
      SELECT * FROM shop_images 
      WHERE shop_id = ? 
      ORDER BY sort_order ASC
    `).all(shopId);

    // افزایش تعداد بازدید
    db.prepare(`
      UPDATE shops 
      SET views = views + 1 
      WHERE id = ?
    `).run(shopId);

    console.log('✅ Shop details retrieved:', { shopId, views: (shop as any)?.views + 1 });

    // پیدا کردن تصویر پروفایل (اولین تصویر یا تصویری که is_primary = 1 باشد)
    const profileImage = (images as any[]).find(img => img.is_primary === 1)?.image_url || (images as any[])[0]?.image_url || null;

    return NextResponse.json({
      success: true,
      message: 'اطلاعات فروشگاه دریافت شد',
      shop: {
        ...shop,
        images: images,
        profile_image: profileImage,
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
      }
    });

  } catch (error) {
    console.error('❌ GET /api/shops/[id] error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات فروشگاه' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shopId = parseInt(id);
    
    if (isNaN(shopId)) {
      return NextResponse.json(
        { error: 'شناسه فروشگاه نامعتبر است' },
        { status: 400 }
      );
    }

    console.log('🔍 PUT /api/shops/' + shopId + ' called');

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

    // تبدیل رشته‌ها به عدد
    const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
    const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

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

    console.log('🏪 Updating shop:', { 
      shopName, 
      category, 
      shopId, 
      latitude, 
      longitude,
      workingHoursLength: workingHours.length 
    });

    // اعتبارسنجی
    if (!shopName || !description || !category) {
      console.error('❌ Validation failed:', {
        shopName: !!shopName,
        description: !!description,
        category: !!category
      });
      return NextResponse.json(
        { error: 'اطلاعات ناقص است' },
        { status: 400 }
      );
    }

    // به‌روزرسانی فروشگاه
    const updateShopStmt = db.prepare(`
      UPDATE shops SET
        shop_name = ?, description = ?, category = ?, phone = ?, email = ?, website = ?,
        latitude = ?, longitude = ?, address = ?, city = ?, province = ?, postal_code = ?,
        working_hours = ?, services = ?, specialties = ?, social_media = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateShopStmt.run(
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
      shopId
    );
    
    console.log('✅ Shop updated with ID:', shopId);

    // پردازش تصاویر جدید
    const profileImageFile = formData.get('profileImage') as File;
    const galleryImages = formData.getAll('galleryImages') as File[];

    // حذف تصاویر قدیمی اگر تصاویر جدید آپلود شده
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        // حذف تصویر پروفایل قدیمی
        db.prepare(`
          DELETE FROM shop_images 
          WHERE shop_id = ? AND is_primary = 1
        `).run(shopId);
        
        // تبدیل فایل به base64
        const arrayBuffer = await profileImageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = profileImageFile.type || 'image/jpeg';
        const profileImageUrl = `data:${mimeType};base64,${base64}`;
        
        db.prepare(`
          INSERT INTO shop_images (shop_id, image_url, image_alt, sort_order, is_primary)
          VALUES (?, ?, ?, ?, ?)
        `).run(shopId, profileImageUrl, `${shopName} - تصویر پروفایل`, 0, 1);
        
        console.log('✅ Profile image updated');
      } catch (error) {
        console.error('❌ Error updating profile image:', error);
      }
    }

    // اضافه کردن تصاویر گالری جدید
    if (galleryImages.length > 0) {
      try {
        // پیدا کردن آخرین sort_order
        const lastOrder = db.prepare(`
          SELECT MAX(sort_order) as max_order 
          FROM shop_images 
          WHERE shop_id = ? AND is_primary = 0
        `).get(shopId);
        
        let nextOrder = ((lastOrder as any)?.max_order || 0) + 1;
        
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
              `).run(shopId, galleryImageUrl, `${shopName} - تصویر ${nextOrder}`, nextOrder, 0);
              
              nextOrder++;
              console.log(`✅ Gallery image ${index + 1} added`);
            } catch (error) {
              console.error(`❌ Error adding gallery image ${index + 1}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error adding gallery images:', error);
      }
    }

    // دریافت اطلاعات فروشگاه به‌روزرسانی شده
    const shop = db.prepare(`
      SELECT s.*, u.username, u.name as user_name, u.phone as user_phone
      FROM shops s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(shopId);

    console.log('✅ Shop update completed:', { shopId });

    return NextResponse.json({
      success: true,
      message: 'فروشگاه با موفقیت به‌روزرسانی شد',
      shop: {
        ...(shop as any),
        working_hours: JSON.parse((shop as any).working_hours),
        social_media: JSON.parse((shop as any).social_media)
      }
    });
    
  } catch (error) {
    console.error('❌ PUT /api/shops/[id] error:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی فروشگاه' },
      { status: 500 }
    );
  }
}
