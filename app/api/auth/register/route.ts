import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, password } = body;

    // بررسی ورودی‌ها
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر با این شماره
    const existingUser = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (existingUser) {
      return NextResponse.json(
        { error: 'این شماره قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // ساخت username از شماره تلفن
    const username = phone;

    // hash کردن رمز عبور
    const hashedPassword = await hashPassword(password);

    // تعیین نقش پیش‌فرض (user)
    const role = 'user';

    // ذخیره کاربر در دیتابیس
    const result = db.prepare(
      'INSERT INTO users (name, phone, username, password, role) VALUES (?, ?, ?, ?, ?)'
    ).run(name, phone, username, hashedPassword, role);

    // ساخت توکن
    const token = createToken(result.lastInsertRowid as number, username);

    // ارسال پاسخ با توکن
    const response = NextResponse.json(
      { 
        message: 'ثبت‌نام با موفقیت انجام شد',
        token: token,
        user: { id: result.lastInsertRowid, name, username, role }
      },
      { status: 201 }
    );

    // تنظیم cookie برای توکن (7 روز)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 روز
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت‌نام' },
      { status: 500 }
    );
  }
}

