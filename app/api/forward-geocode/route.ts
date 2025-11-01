import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// GET برای جستجو
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'پارامتر جستجو (q) ارسال نشده است' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=fa,en&limit=5&countrycodes=ir&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AdApp/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data && data.length > 0) {
        return NextResponse.json({
          results: data,
          count: data.length
        });
      } else {
        return NextResponse.json({
          results: [],
          count: 0
        });
      }
    }
  } catch (fetchError) {
    console.error('Nominatim fetch error:', fetchError);
  }
  
  return NextResponse.json(
    { error: 'خطا در جستجوی آدرس' },
    { status: 500 }
  );
}

// POST برای forward geocoding
export async function POST(request: Request) {
  const { address } = await request.json();

  if (!address) {
    return NextResponse.json(
      { error: 'آدرس ارسال نشده است' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&accept-language=fa,en&limit=1&countrycodes=ir&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AdApp/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return NextResponse.json({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name
        });
      } else {
        return NextResponse.json(
          { error: 'آدرس پیدا نشد' },
          { status: 404 }
        );
      }
    }
  } catch (fetchError) {
    console.error('Nominatim fetch error:', fetchError);
  }
  
  return NextResponse.json(
    { error: 'خطا در جستجوی آدرس' },
    { status: 500 }
  );
}


