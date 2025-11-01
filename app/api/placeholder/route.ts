import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || '?';
    const size = searchParams.get('size') || '150';
    const bgColor = searchParams.get('bg') || '3b82f6';
    const textColor = searchParams.get('color') || 'ffffff';
    
    const width = parseInt(size);
    const height = parseInt(size);
    
    // ایجاد SVG placeholder ساده‌تر
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}" rx="12"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(width * 0.4)}" 
            font-weight="bold" fill="#${textColor}" text-anchor="middle" 
            dominant-baseline="middle">
        ${text.toUpperCase()}
      </text>
    </svg>`;
    
    // تبدیل SVG به base64
    const base64 = Buffer.from(svg).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    
    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      svg: svg
    });
    
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد تصویر placeholder' },
      { status: 500 }
    );
  }
}
