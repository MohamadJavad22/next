import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { DatabaseAd } from '@/lib/database-config';

// GET: دریافت یک آگهی خاص
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const stmt = db.prepare('SELECT * FROM ads WHERE id = ?');
    const ad = stmt.get(parseInt(id)) as DatabaseAd | undefined;
    
    if (!ad) {
      return NextResponse.json(
        { error: 'آگهی یافت نشد' },
        { status: 404 }
      );
    }
    
    // Get images
    const images = db.prepare('SELECT image_url FROM ad_images WHERE ad_id = ? ORDER BY sort_order').all(parseInt(id));
    
    return NextResponse.json({
      ...ad,
      images: images.map((img: any) => img.image_url)
    });
  } catch (error) {
    console.error('خطا در دریافت آگهی:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آگهی' },
      { status: 500 }
    );
  }
}

// DELETE: حذف آگهی
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Check if ad exists
    const stmt = db.prepare('SELECT * FROM ads WHERE id = ?');
    const ad = stmt.get(parseInt(id)) as DatabaseAd | undefined;
    
    if (!ad) {
      return NextResponse.json(
        { error: 'آگهی یافت نشد' },
        { status: 404 }
      );
    }
    
    // Delete images first
    db.prepare('DELETE FROM ad_images WHERE ad_id = ?').run(parseInt(id));
    
    // Delete ad
    db.prepare('DELETE FROM ads WHERE id = ?').run(parseInt(id));
    
    console.log('✅ آگهی از SQLite حذف شد:', id);
    
    return NextResponse.json({
      success: true,
      message: 'آگهی با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('خطا در حذف آگهی:', error);
    return NextResponse.json(
      { error: 'خطا در حذف آگهی' },
      { status: 500 }
    );
  }
}

// PUT: ویرایش آگهی
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    // Check if ad exists
    const stmt = db.prepare('SELECT * FROM ads WHERE id = ?');
    const ad = stmt.get(parseInt(id)) as DatabaseAd | undefined;
    
    if (!ad) {
      return NextResponse.json(
        { error: 'آگهی یافت نشد' },
        { status: 404 }
      );
    }
    
    // Update ad
    const updateStmt = db.prepare(`
      UPDATE ads 
      SET title = ?, description = ?, price = ?, condition = ?, 
          address = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
    
    updateStmt.run(
      data.title || ad.title,
      data.description || ad.description,
      data.price || ad.price,
      data.condition || ad.condition,
      data.address || ad.address,
      data.status || ad.status,
      new Date().toISOString(),
      parseInt(id)
    );
    
    console.log('✅ آگهی در SQLite بروزرسانی شد:', id);
    
    // Get updated ad
    const updatedAd = stmt.get(parseInt(id));
    
    return NextResponse.json({
      success: true,
      message: 'آگهی با موفقیت بروزرسانی شد',
      ad: updatedAd
    });
  } catch (error) {
    console.error('خطا در ویرایش آگهی:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش آگهی' },
      { status: 500 }
    );
  }
}
