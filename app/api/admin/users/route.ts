import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// دریافت لیست تمام کاربران
export async function GET(request: NextRequest) {
  try {
    const stmt = db.prepare(`
      SELECT id, name, phone, username, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    const users = stmt.all();

    return NextResponse.json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست کاربران' },
      { status: 500 }
    );
  }
}

// حذف کاربر
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(userId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف کاربر' },
      { status: 500 }
    );
  }
}

