import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'مختصات ارسال نشده است' },
        { status: 400 }
      );
    }

    // تلاش برای دریافت آدرس از Nominatim با دقت بالا
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa,en&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
        {
          headers: {
            'User-Agent': 'AdApp/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.display_name) {
          // پاکسازی و فرمت آدرس با دقت بالا
          let address = data.display_name;
          
          // تبدیل کاماهای فارسی به انگلیسی
          address = address.replace(/،/g, ', ');
          
          // بهبود فرمت آدرس
          if (data.address) {
            const addr = data.address;
            // ساخت آدرس بهتر از جزئیات
            let betterAddress = '';
            
            if (addr.house_number) betterAddress += addr.house_number + ' ';
            if (addr.road) betterAddress += addr.road + ', ';
            if (addr.suburb || addr.neighbourhood) betterAddress += (addr.suburb || addr.neighbourhood) + ', ';
            if (addr.city || addr.town || addr.village) betterAddress += (addr.city || addr.town || addr.village) + ', ';
            if (addr.state) betterAddress += addr.state + ', ';
            if (addr.country) betterAddress += addr.country;
            
            if (betterAddress.trim()) {
              address = betterAddress.trim();
            }
          }
          
          // حذف بخش‌های اضافی
          address = address.replace(/, ایران$/, '، ایران');
          
          // کوتاه کردن آدرس اگر خیلی طولانی باشد
          if (address.length > 120) {
            address = address.substring(0, 117) + '...';
          }

          console.log('Geocoding result:', address);
          return NextResponse.json({ address });
        }
      }
    } catch (fetchError) {
      console.error('Nominatim fetch error:', fetchError);
    }

    // Fallback: آدرس ساده
    const fallbackAddress = `موقعیت انتخاب شده (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`;
    
    return NextResponse.json({ address: fallbackAddress });

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آدرس' },
      { status: 500 }
    );
  }
}
