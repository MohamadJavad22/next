import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'users.db');
const db = new Database(dbPath);

// Ensure shop_followers table exists
db.exec(`
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
`);

// POST: Follow a shop
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shopId = parseInt(id);
    const body = await request.json();
    const { userId } = body;

    if (isNaN(shopId)) {
      return NextResponse.json(
        { error: 'شناسه فروشگاه نامعتبر است' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'شناسه کاربر مورد نیاز است' },
        { status: 400 }
      );
    }

    // Check if shop exists
    const shop = db.prepare('SELECT id FROM shops WHERE id = ?').get(shopId);
    if (!shop) {
      return NextResponse.json(
        { error: 'فروشگاه یافت نشد' },
        { status: 404 }
      );
    }

    // Check if already following
    const existing = db.prepare('SELECT id FROM shop_followers WHERE shop_id = ? AND user_id = ?').get(shopId, userId);
    if (existing) {
      return NextResponse.json(
        { error: 'قبلاً این فروشگاه را دنبال کرده‌اید' },
        { status: 400 }
      );
    }

    // Insert follow
    db.prepare('INSERT INTO shop_followers (shop_id, user_id) VALUES (?, ?)').run(shopId, userId);

    // Get followers count
    const followersCount = db.prepare('SELECT COUNT(*) as count FROM shop_followers WHERE shop_id = ?').get(shopId) as { count: number };

    console.log(`✅ User ${userId} followed shop ${shopId}`);

    return NextResponse.json({
      success: true,
      message: 'با موفقیت دنبال شد',
      followersCount: followersCount.count
    });

  } catch (error) {
    console.error('❌ Error following shop:', error);
    return NextResponse.json(
      { error: 'خطا در دنبال کردن فروشگاه' },
      { status: 500 }
    );
  }
}

// DELETE: Unfollow a shop
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shopId = parseInt(id);
    const body = await request.json();
    const { userId } = body;

    if (isNaN(shopId)) {
      return NextResponse.json(
        { error: 'شناسه فروشگاه نامعتبر است' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'شناسه کاربر مورد نیاز است' },
        { status: 400 }
      );
    }

    // Delete follow
    const result = db.prepare('DELETE FROM shop_followers WHERE shop_id = ? AND user_id = ?').run(shopId, userId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'این فروشگاه را دنبال نمی‌کنید' },
        { status: 400 }
      );
    }

    // Get followers count
    const followersCount = db.prepare('SELECT COUNT(*) as count FROM shop_followers WHERE shop_id = ?').get(shopId) as { count: number };

    console.log(`✅ User ${userId} unfollowed shop ${shopId}`);

    return NextResponse.json({
      success: true,
      message: 'با موفقیت لغو دنبال شد',
      followersCount: followersCount.count
    });

  } catch (error) {
    console.error('❌ Error unfollowing shop:', error);
    return NextResponse.json(
      { error: 'خطا در لغو دنبال کردن فروشگاه' },
      { status: 500 }
    );
  }
}

