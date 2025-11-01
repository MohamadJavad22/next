import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { cookies } from 'next/headers';

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

// GET: Check follow status
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

    // Get user from cookie
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    let userId: number | null = null;

    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value);
        userId = user.id;
      } catch (e) {
        console.log('No valid user cookie');
      }
    }

    // Get followers count
    const followersCount = db.prepare('SELECT COUNT(*) as count FROM shop_followers WHERE shop_id = ?').get(shopId) as { count: number };

    // Check if user is following
    let isFollowing = false;
    if (userId) {
      const follow = db.prepare('SELECT id FROM shop_followers WHERE shop_id = ? AND user_id = ?').get(shopId, userId);
      isFollowing = !!follow;
    }

    return NextResponse.json({
      success: true,
      isFollowing,
      followersCount: followersCount.count
    });

  } catch (error) {
    console.error('❌ Error checking follow status:', error);
    return NextResponse.json(
      { error: 'خطا در بررسی وضعیت دنبال کردن' },
      { status: 500 }
    );
  }
}

