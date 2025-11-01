import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const shopId = parseInt(id);

    // Get all images for this shop
    const stmt = db.prepare(`
      SELECT * FROM shop_images 
      WHERE shop_id = ? 
      ORDER BY sort_order ASC, created_at ASC
    `);
    
    const images = stmt.all(shopId);
    
    console.log(`🔍 GET /api/shops/${shopId}/images called`);
    console.log(`✅ Shop images retrieved: ${images.length}`);
    
    return NextResponse.json({
      success: true,
      images: images
    });
  } catch (error) {
    console.error('❌ Error fetching shop images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop images' },
      { status: 500 }
    );
  }
}

