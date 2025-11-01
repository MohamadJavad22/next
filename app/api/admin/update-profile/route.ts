import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { userId, username, phone } = await request.json();

    // بررسی ورودی‌ها
    if (!userId || !username || !phone) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    // بررسی فرمت شماره تماس
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'شماره موبایل معتبر نیست' },
        { status: 400 }
      );
    }

    // بررسی طول نام کاربری
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'نام کاربری باید بین ۳ تا ۳۰ کاراکتر باشد' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر با همین username (غیر از کاربر فعلی)
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ? AND id != ?').get(username, userId);
    if (existingUser) {
      return NextResponse.json(
        { error: 'این نام کاربری قبلاً استفاده شده است' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر با همین phone (غیر از کاربر فعلی)
    const existingPhone = db.prepare('SELECT * FROM users WHERE phone = ? AND id != ?').get(phone, userId);
    if (existingPhone) {
      return NextResponse.json(
        { error: 'این شماره تماس قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // بروزرسانی اطلاعات کاربر
    db.prepare(
      'UPDATE users SET username = ?, phone = ? WHERE id = ?'
    ).run(username, phone, userId);

    // دریافت نام کاربر از دیتابیس
    const updatedUser = db.prepare('SELECT id, name, username, phone FROM users WHERE id = ?').get(userId) as any;

    return NextResponse.json({
      success: true,
      message: 'اطلاعات شما با موفقیت بروزرسانی شد',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی اطلاعات' },
      { status: 500 }
    );
  }
}

