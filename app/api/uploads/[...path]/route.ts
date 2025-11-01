import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: imagePath } = await params;
    const fullPath = imagePath.join('/');
    
    // امنیت: فقط مسیرهای مجاز
    if (!fullPath.startsWith('shops/')) {
      return NextResponse.json(
        { error: 'مسیر غیرمجاز' },
        { status: 403 }
      );
    }

    // مسیر کامل فایل
    const filePath = path.join(process.cwd(), 'public', 'uploads', fullPath);
    
    // بررسی وجود فایل
    if (!fs.existsSync(filePath)) {
      // اگر فایل وجود ندارد، یک تصویر placeholder برگردان
      return NextResponse.json(
        { error: 'تصویر یافت نشد' },
        { status: 404 }
      );
    }

    // خواندن فایل
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // تعیین نوع محتوا
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // کش برای یک سال
      },
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'خطا در بارگذاری تصویر' },
      { status: 500 }
    );
  }
}

