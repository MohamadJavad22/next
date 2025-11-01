"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  views: number;
  created_at: string;
  user_id: number;
  images: string[];
}

interface AdModalProps {
  ad: Ad | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdModal({ ad, isOpen, onClose }: AdModalProps) {
  const { resolvedTheme } = useTheme();
  const [isMapReady, setIsMapReady] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !ad) {
      setIsMapReady(false);
      return;
    }

    const loadLeafletCSS = () => {
      if (document.querySelector('link[data-leaflet-css]')) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet-css', 'true');
      document.head.appendChild(link);
    };

    const loadLeaflet = () => {
      if ((window as any).L) {
        initMap();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => {
        const backupScript = document.createElement('script');
        backupScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        backupScript.async = true;
        backupScript.defer = true;
        backupScript.onload = () => initMap();
        document.body.appendChild(backupScript);
      };
      document.body.appendChild(script);
    };

    const initMap = () => {
      setTimeout(() => {
        const mapContainer = document.getElementById('detail-map-container');
        if (!mapContainer) {
          console.error('Map container not found');
          return;
        }

        // Clean up previous map
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.log('Error removing old map:', e);
          }
          mapInstanceRef.current = null;
        }

        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet not available');
          return;
        }

        try {
          // Create map
          const map = L.map('detail-map-container', {
            center: [ad.latitude, ad.longitude],
            zoom: 15,
            zoomControl: false,
            scrollWheelZoom: true,
            attributionControl: false,
          });

          mapInstanceRef.current = map;

          // Load map layer
          const isDark = resolvedTheme === 'dark';
          
          const neshanLayer = L.tileLayer('https://static.neshan.org/api/web/1/layer/neshan-web/{z}/{x}/{y}.png', {
            attribution: '',
            maxZoom: 20,
            minZoom: 6,
            tileSize: 256,
            className: isDark ? 'map-tiles-dark' : ''
          });
          
          const fallbackLayer = isDark 
            ? L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '',
                maxZoom: 20,
                minZoom: 6
              })
            : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '',
                maxZoom: 19,
                minZoom: 6
              });

          // Try Neshan first, fallback to others
          neshanLayer.addTo(map);
          neshanLayer.on('tileerror', () => {
            map.removeLayer(neshanLayer);
            fallbackLayer.addTo(map);
          });

          // Add marker
          const marker = L.marker([ad.latitude, ad.longitude], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `
                <div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5" fill="white"/>
                  </svg>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })
          });
          marker.addTo(map);

          setIsMapReady(true);
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }, 100);
    };

    loadLeafletCSS();
    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log('Error cleaning up map:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, ad, resolvedTheme]);

  const formatPrice = (price: number) => {
    if (!price) return 'توافقی';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'امروز';
    if (diffDays === 2) return 'دیروز';
    if (diffDays <= 7) return `${diffDays} روز پیش`;
    return date.toLocaleDateString('fa-IR');
  };

  if (!isOpen || !ad) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            جزئیات آگهی
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Images */}
          <div className="mb-6">
            {ad.images && ad.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ad.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${ad.title} - تصویر ${index + 1}`}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {ad.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 mr-2 ${
                ad.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {ad.status === 'active' ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
            
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(ad.price)}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            {/* Condition */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">وضعیت</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {ad.condition === 'new' ? 'نو' : ad.condition === 'good' ? 'سالم' : ad.condition}
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">زمان ثبت</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(ad.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">توضیحات</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {ad.description}
            </p>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">موقعیت مکانی</h3>
            
            {/* Address */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  {ad.address || 'آدرس ثبت نشده'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  مختصات: {ad.latitude.toFixed(4)}, {ad.longitude.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden" style={{ paddingBottom: '50%' }}>
              <div 
                id="detail-map-container" 
                className="absolute inset-0 w-full h-full"
              ></div>
              
              {!isMapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری نقشه...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">مسیریابی با:</p>
              <div className="grid grid-cols-4 gap-3">
                {/* Snapp */}
                <a
                  href={`https://snapp.ir/deeplink/directions?destination_lat=${ad.latitude}&destination_lng=${ad.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#21C17C"/>
                      <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#21C17C"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white">اسنپ</span>
                </a>

                {/* Neshan */}
                <a
                  href={`https://neshan.org/maps/@${ad.latitude},${ad.longitude},16z`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#EE3148"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white">نشان</span>
                </a>

                {/* Balad */}
                <a
                  href={`https://balad.ir/place?latitude=${ad.latitude}&longitude=${ad.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 2Z" fill="#5B4FFF"/>
                      <path d="M12 8L10 12H12V16L14 12H12V8Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white">بلد</span>
                </a>

                {/* Tapsi */}
                <a
                  href={`https://app.tapsi.cab/deep-link?source=web&destination_lat=${ad.latitude}&destination_lng=${ad.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#FF6B00"/>
                      <path d="M12 6C8.5 6 6 9 6 12C6 15 8.5 18 12 18C15.5 18 18 15 18 12C18 9 15.5 6 12 6Z" fill="white"/>
                      <path d="M12 8V12L15 14" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white">تپسی</span>
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              تماس با فروشنده
            </button>
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              چت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
