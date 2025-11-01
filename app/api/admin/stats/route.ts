import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// دریافت آمار کلی
export async function GET(request: NextRequest) {
  try {
    // تعداد کل کاربران
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    // کاربران امروز
    const todayUsers = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE DATE(created_at) = DATE('now')
    `).get() as { count: number };
    
    // کاربران این هفته
    const weekUsers = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE DATE(created_at) >= DATE('now', '-7 days')
    `).get() as { count: number };
    
    // کاربران این ماه
    const monthUsers = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE DATE(created_at) >= DATE('now', '-30 days')
    `).get() as { count: number };

    // آخرین کاربران
    const recentUsers = db.prepare(`
      SELECT name, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers.count,
        todayUsers: todayUsers.count,
        weekUsers: weekUsers.count,
        monthUsers: monthUsers.count,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آمار' },
      { status: 500 }
    );
  }
}

