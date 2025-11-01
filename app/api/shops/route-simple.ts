import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/shops called');
    
    return NextResponse.json({
      success: true,
      message: 'API endpoint is working',
      shops: []
    });
    
  } catch (error) {
    console.error('❌ GET /api/shops error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فروشگاه‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/shops called');
    
    return NextResponse.json({
      success: true,
      message: 'فروشگاه با موفقیت ایجاد شد',
      shop: {
        id: 1,
        shopName: 'Test Shop',
        description: 'Test Description'
      }
    });
    
  } catch (error) {
    console.error('❌ POST /api/shops error:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد فروشگاه' },
      { status: 500 }
    );
  }
}

