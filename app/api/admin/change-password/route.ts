import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { comparePassword, hashPassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    // بررسی ورودی‌ها
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    // بررسی طول رمز عبور جدید
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد' },
        { status: 400 }
      );
    }

    // دریافت کاربر
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    
    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی رمز عبور فعلی
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'رمز عبور فعلی اشتباه است' },
        { status: 401 }
      );
    }

    // hash کردن رمز عبور جدید
    const hashedNewPassword = await hashPassword(newPassword);

    // بروزرسانی رمز عبور
    db.prepare(
      'UPDATE users SET password = ? WHERE id = ?'
    ).run(hashedNewPassword, userId);

    return NextResponse.json({
      success: true,
      message: 'رمز عبور شما با موفقیت تغییر یافت'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر رمز عبور' },
      { status: 500 }
    );
  }
}

