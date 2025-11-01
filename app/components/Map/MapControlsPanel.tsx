"use client";

import { useState, useCallback, useEffect } from 'react';
import MapSearch from './MapSearch';
import AdCard from '../AdCard/AdCard';
import AdModal from '../AdCard/AdModal';

interface MapControlsPanelProps {
  mapInstance: any;
  userLocation: { latitude: number; longitude: number } | null;
  searchRadius: number;
  onSearchRadiusChange: (radius: number) => void;
  onLocationRequest: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  filteredAdsCount: number;
  showJoystick: boolean;
  onToggleJoystick: () => void;
  filteredAds: any[];
  onAdClick: (ad: any) => void;
  selectedAdForDrawer: any;
  onClearSelectedAd: () => void;
}

export default function MapControlsPanel({
  mapInstance,
  userLocation,
  searchRadius,
  onSearchRadiusChange,
  onLocationRequest,
  onLocationSelect,
  filteredAdsCount,
  showJoystick,
  onToggleJoystick,
  filteredAds,
  onAdClick,
  selectedAdForDrawer,
  onClearSelectedAd
}: MapControlsPanelProps) {
  const [currentZoom, setCurrentZoom] = useState(12);
  const [mapFilter, setMapFilter] = useState<'all' | 'ad' | 'store' | 'repair'>('all');
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [showAdModal, setShowAdModal] = useState(false);


  const handleZoomIn = useCallback(() => {
    if (!mapInstance) return;
    const currentZoomVal = mapInstance.getZoom();
    mapInstance.setZoom(Math.min(20, currentZoomVal + 1));
    setCurrentZoom(mapInstance.getZoom());
  }, [mapInstance]);

  const handleZoomOut = useCallback(() => {
    if (!mapInstance) return;
    const currentZoomVal = mapInstance.getZoom();
    mapInstance.setZoom(Math.max(6, currentZoomVal - 1));
    setCurrentZoom(mapInstance.getZoom());
  }, [mapInstance]);

  const handleLocationClick = useCallback(() => {
    if (userLocation && mapInstance) {
      mapInstance.setView([userLocation.latitude, userLocation.longitude], 15);
    } else {
      onLocationRequest();
    }
  }, [userLocation, mapInstance, onLocationRequest]);

  const handleSearchRadiusClick = useCallback(() => {
    const newRadius = prompt(`شعاع جستجو فعلی: ${searchRadius} کیلومتر\nشعاع جدید را وارد کنید (1-50):`, searchRadius.toString());
    if (newRadius) {
      const radius = parseInt(newRadius);
      if (radius >= 1 && radius <= 50) {
        onSearchRadiusChange(radius);
      } else {
        alert('لطفاً عددی بین 1 تا 50 وارد کنید');
      }
    }
  }, [searchRadius, onSearchRadiusChange]);

  const handleAdClick = useCallback((ad: any) => {
    // Set the selected ad for drawer instead of opening modal
    onAdClick(ad);
    // This will be handled by the parent component to set selectedAdForDrawer
  }, [onAdClick]);

  // If there's a selected ad for drawer, show only the modal content
  if (selectedAdForDrawer) {
  return (
      <div className="h-full overflow-y-auto">
        {/* Ad Detail Content - Inline in drawer */}
        <div className="p-4">
          {/* Images */}
          <div className="mb-6">
            {selectedAdForDrawer.images && selectedAdForDrawer.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedAdForDrawer.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${selectedAdForDrawer.title} - تصویر ${index + 1}`}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
              </div>
            )}
      </div>

          {/* Title and Price */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedAdForDrawer.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 mr-2 ${
                selectedAdForDrawer.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {selectedAdForDrawer.status === 'active' ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {selectedAdForDrawer.price ? new Intl.NumberFormat('fa-IR').format(selectedAdForDrawer.price) + ' تومان' : 'توافقی'}
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
                  {selectedAdForDrawer.condition === 'new' ? 'نو' : selectedAdForDrawer.condition === 'good' ? 'سالم' : selectedAdForDrawer.condition}
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
                  {(() => {
                    const date = new Date(selectedAdForDrawer.created_at);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - date.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) return 'امروز';
                    if (diffDays === 2) return 'دیروز';
                    if (diffDays <= 7) return `${diffDays} روز پیش`;
                    return date.toLocaleDateString('fa-IR');
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">توضیحات</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {selectedAdForDrawer.description}
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
                  {selectedAdForDrawer.address || 'آدرس ثبت نشده'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  مختصات: {selectedAdForDrawer.latitude.toFixed(4)}, {selectedAdForDrawer.longitude.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">مسیریابی با:</p>
              <div className="grid grid-cols-4 gap-3">
                {/* Snapp */}
                <a
                  href={`https://snapp.ir/deeplink/directions?destination_lat=${selectedAdForDrawer.latitude}&destination_lng=${selectedAdForDrawer.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#21C17C"/>
                      <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#21C17C"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white">اسنپ</span>
                </a>

                {/* Neshan */}
                <a
                  href={`https://neshan.org/maps/@${selectedAdForDrawer.latitude},${selectedAdForDrawer.longitude},16z`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#EE3148"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white">نشان</span>
                </a>

                {/* Balad */}
                <a
                  href={`https://balad.ir/place?latitude=${selectedAdForDrawer.latitude}&longitude=${selectedAdForDrawer.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 2Z" fill="#5B4FFF"/>
                      <path d="M12 8L10 12H12V16L14 12H12V8Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white">بلد</span>
                </a>

                {/* Tapsi */}
                <a
                  href={`https://app.tapsi.cab/deep-link?source=web&destination_lat=${selectedAdForDrawer.latitude}&destination_lng=${selectedAdForDrawer.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
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

          {/* Close Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => onClearSelectedAd()}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              بستن
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Filter Section - First and Compact */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setMapFilter('ad')}
              className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                mapFilter === 'ad'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                آگهی
              </div>
            </button>

            <button
              onClick={() => setMapFilter('store')}
              className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                mapFilter === 'store'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                فروشگاه
              </div>
            </button>

            <button
              onClick={() => setMapFilter('repair')}
              className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                mapFilter === 'repair'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                </svg>
                تعمیرگاه
              </div>
            </button>
          </div>
        </div>

        {/* Search Section - Hidden on Mobile, shown on Desktop */}
        <div className="space-y-2 hidden sm:block">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            جستجو
          </h4>
          <MapSearch onLocationSelect={onLocationSelect} />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-xs font-medium">آگهی‌ها</span>
            </div>
            <div className="text-lg font-bold mt-0.5">{filteredAdsCount}</div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">شعاع</span>
            </div>
            <div className="text-lg font-bold mt-0.5">{searchRadius}km</div>
          </div>
        </div>

        {/* Ads Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
            آگهی‌های محدوده
          </h4>
          <div className="space-y-2">
            {filteredAds.length > 0 ? (
              filteredAds.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  userLocation={userLocation}
                  onAdClick={handleAdClick}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                آگهی‌ای در این محدوده یافت نشد
              </div>
            )}
          </div>
        </div>

        {/* Ad Modal */}
        <AdModal
          ad={selectedAd}
          isOpen={showAdModal}
          onClose={() => {
            setShowAdModal(false);
            setSelectedAd(null);
          }}
        />
      </div>
    </div>
  );
}
