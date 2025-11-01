"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import EnhancedMapContainer from './components/Map/EnhancedMapContainer';
import AdCard from './components/AdCard/AdCard';
import AdModal from './components/AdCard/AdModal';
import StoriesSection from './components/Stories/StoriesSection';
import LoadingSpinner from './components/LoadingStates/LoadingSpinner';
import ErrorMessage from './components/ErrorStates/ErrorMessage';
import ErrorBoundary from './components/ErrorStates/ErrorBoundary';
import { useAds } from './hooks/useAds';
import { useLocation } from './hooks/useLocation';
import { useMap } from './hooks/useMap';

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
  distance?: number;
}

interface Shop {
  id: number;
  shop_name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  email: string;
  views: number;
  rating: number;
  created_at: string;
  user_id: number;
  profile_image?: string;
  distance?: number;
}

interface MapMarker {
  id: number;
  top: string;
  left: string;
  delay: number;
}

// Shop Card Component
const ShopCard = React.memo(function ShopCard({ shop, onShopClick }: { shop: Shop; onShopClick: (shop: Shop) => void }) {
  return (
    <div 
      onClick={() => onShopClick(shop)}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
    >
      {/* Banner Image */}
      <div className="relative h-24 bg-gradient-to-br from-purple-500 to-pink-500">
        {shop.profile_image ? (
          <img 
            src={shop.profile_image} 
            alt={shop.shop_name}
            className="w-full h-full object-cover"
          />
        ) : null}
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
            {shop.category}
          </span>
        </div>
      </div>

      {/* Shop Info with Profile Image */}
      <div className="p-4 pb-6">
        <div className="flex gap-4">
          {/* Profile Image (Circular) */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
              {shop.profile_image ? (
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src={shop.profile_image} 
                    alt={shop.shop_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Shop Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{shop.shop_name}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">{shop.description}</p>
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {shop.views}
              </span>
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {shop.rating.toFixed(1)}
              </span>
              {shop.distance && (
                <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {shop.distance.toFixed(1)} کیلومتر
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized components for better performance
const MemoizedAdCard = React.memo(AdCard);
const MemoizedStoriesSection = React.memo(StoriesSection);
const MemoizedShopCard = React.memo(ShopCard);

export default function Home() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  
  // State
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllAdsMapOpen, setIsAllAdsMapOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ads' | 'shops' | 'repair'>('all');
  
  // Custom hooks
  const { ads, isLoading, error, retry } = useAds();
  const { userLocation, isGettingLocation, locationError, getCurrentLocation, setUserLocation } = useLocation();
  const { filteredAds } = useMap(ads, userLocation, searchRadius);
  
  // State for shops
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  
  // Map markers for preview
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  // Show location modal on first visit
  useEffect(() => {
    const hasSeenLocationPrompt = localStorage.getItem('hasSeenLocationPrompt');
    const savedLocation = localStorage.getItem('userLocation');
    
    if (!hasSeenLocationPrompt && !savedLocation) {
      setTimeout(() => {
        setShowLocationModal(true);
      }, 500);
    }
  }, []);

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoadingShops(true);
      try {
        const response = await fetch('/api/shops');
        const data = await response.json();
        if (data.success) {
          setShops(data.shops || []);
        }
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setIsLoadingShops(false);
      }
    };

    fetchShops();
  }, []);

  // Generate random markers for map preview (memoized)
  const generateRandomMarkers = useCallback(() => {
    const getRandomPosition = () => ({
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      delay: 0
    });

    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      ...getRandomPosition()
    }));
  }, []);

  useEffect(() => {
    setMapMarkers(generateRandomMarkers());

    const interval = setInterval(() => {
      setMapMarkers(generateRandomMarkers());
    }, 5000);

    return () => clearInterval(interval);
  }, [generateRandomMarkers]);

  // Cleanup scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Memoized handlers
  const openAdDetail = useCallback((ad: Ad) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => setSelectedAd(null), 300);
  }, []);

  const openAllAdsMap = useCallback(() => {
    setIsAllAdsMapOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeAllAdsMap = useCallback(() => {
    setIsAllAdsMapOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const handleLocationFromSearch = useCallback((location: { latitude: number; longitude: number; address: string }) => {
    setUserLocation(location);
  }, [setUserLocation]);

  const handleMapReady = useCallback((map: any) => {
    setMapInstance(map);
  }, []);

  const handleSearchRadiusChange = useCallback((radius: number) => {
    setSearchRadius(radius);
    localStorage.setItem('searchRadius', radius.toString());
  }, []);

  const handleLocationRequest = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleShopClick = useCallback((shop: Shop) => {
    // Navigate to public shop page (not profile)
    window.location.href = `/public-shop/${shop.id}`;
  }, []);

  // Filter data based on active filter
  const getFilteredData = useCallback(() => {
    switch (activeFilter) {
      case 'ads':
        return filteredAds;
      case 'shops':
        return shops.filter(shop => shop.category !== 'تعمیرگاه');
      case 'repair':
        return shops.filter(shop => shop.category === 'تعمیرگاه');
      case 'all':
      default:
        return [...filteredAds, ...shops];
    }
  }, [activeFilter, filteredAds, shops]);

  // ESC key handler
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAllAdsMapOpen) {
          closeAllAdsMap();
        } else if (isModalOpen) {
          closeModal();
        }
      }
    };

    if (isAllAdsMapOpen || isModalOpen) {
      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }
  }, [isAllAdsMapOpen, isModalOpen, closeAllAdsMap, closeModal]);

  // Memoized map preview component
  const MapPreview = useMemo(() => {
    if (isLoading || ads.length === 0) return null;

    return (
      <div 
        onClick={openAllAdsMap}
        className="relative w-full mb-6 rounded-3xl overflow-hidden cursor-pointer group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200/50 dark:border-slate-700/50"
        style={{ 
          paddingBottom: '60%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
        }}
      >
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
          {/* Map Iframe */}
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=46.5,27.0,61.0,38.5&layer=mapnik"
            className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40"
            style={{ 
              border: 0, 
              pointerEvents: 'none',
              marginBottom: '-50px',
              height: 'calc(100% + 50px)'
            }}
            title="نقشه ایران"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30"></div>
          
          {/* Animated Markers */}
          <div className="absolute inset-0">
            {mapMarkers.map((marker) => (
              <div 
                key={marker.id} 
                className="absolute transition-all duration-1000 ease-in-out" 
                style={{ top: marker.top, left: marker.left }}
              >
                <div 
                  className="relative animate-random-appear" 
                  style={{ animationDelay: `${marker.delay}s` }}
                >
                  <div className="absolute -inset-2 bg-red-500/20 rounded-full blur-md animate-pulse"></div>
                  <svg 
                    className="relative w-6 h-6 text-red-500 drop-shadow-lg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5" fill="white"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Overlay with Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold mb-1">مشاهده روی نقشه</h3>
                <p className="text-white/80 text-sm">تمام آگهی‌ها را روی نقشه ببینید</p>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [isLoading, ads.length, openAllAdsMap, mapMarkers]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Hide header when map is open */}
        {!isAllAdsMapOpen && <Header onLocationSelect={handleLocationFromSearch} />}
        
        <main className={`${isAllAdsMapOpen ? 'pt-0' : 'pb-20 pt-4'} px-4 max-w-4xl mx-auto`}>
          {/* Hide main content when map is open */}
          {!isAllAdsMapOpen && (
            <>
              {/* Stories Section */}
              <div className="mb-6">
                <MemoizedStoriesSection />
              </div>

              {/* Map Preview */}
              {MapPreview}

              {/* Filter Icons */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
                      activeFilter === 'all'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-current/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">همه</span>
                  </button>

                  <button
                    onClick={() => setActiveFilter('ads')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
                      activeFilter === 'ads'
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-current/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">آگهی</span>
                  </button>

                  <button
                    onClick={() => setActiveFilter('shops')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
                      activeFilter === 'shops'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-current/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">فروشگاه</span>
                  </button>

                  <button
                    onClick={() => setActiveFilter('repair')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
                      activeFilter === 'repair'
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-current/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">تعمیرگاه</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">در حال بارگذاری آگهی‌ها...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {!isLoading && error && (
                <div className="mb-6">
                  <ErrorMessage 
                    error={error} 
                    onRetry={retry} 
                    className="mb-6" 
                  />
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && !isLoadingShops && getFilteredData().length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {userLocation ? 'موردی در این منطقه یافت نشد' : 'هنوز موردی ثبت نشده'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto">
                    {userLocation ? 'شعاع جستجو را افزایش دهید یا موقعیت خود را تغییر دهید' : 'اولین نفری باشید که آگهی یا فروشگاه خود را ثبت می‌کند!'}
                  </p>
                </div>
              )}

              {/* Content Cards */}
              <div className="space-y-4">
                {getFilteredData().map((item: Ad | Shop) => {
                  if ('price' in item) {
                    // It's an Ad
                    return (
                      <MemoizedAdCard
                        key={`ad-${item.id}`}
                        ad={item as Ad}
                        userLocation={userLocation}
                        onAdClick={openAdDetail}
                      />
                    );
                  } else {
                    // It's a Shop
                    return (
                      <MemoizedShopCard
                        key={`shop-${item.id}`}
                        shop={item as Shop}
                        onShopClick={handleShopClick}
                      />
                    );
                  }
                })}
              </div>
            </>
          )}
        </main>

        {/* Ad Modal */}
        <AdModal
          ad={selectedAd}
          isOpen={isModalOpen}
          onClose={closeModal}
        />

        {/* Enhanced Map with Drawer */}
        <EnhancedMapContainer
          isOpen={isAllAdsMapOpen}
          ads={ads}
          userLocation={userLocation}
          searchRadius={searchRadius}
          onMapReady={handleMapReady}
          onClose={closeAllAdsMap}
          onLocationSelect={handleLocationFromSearch}
          onSearchRadiusChange={handleSearchRadiusChange}
          onLocationRequest={handleLocationRequest}
        />

        {/* Location Modal */}
        {showLocationModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowLocationModal(false);
                localStorage.setItem('hasSeenLocationPrompt', 'true');
              }
            }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  localStorage.setItem('hasSeenLocationPrompt', 'true');
                }}
                className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors text-white"
                title="بستن"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">موقعیت خود را انتخاب کنید</h3>
                    <p className="text-sm text-white/90">برای مشاهده آگهی‌های نزدیک</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Get Current Location Button */}
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">در حال دریافت موقعیت...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                      <span className="text-sm">استفاده از موقعیت فعلی</span>
                    </>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 text-xs">یا</span>
                  </div>
                </div>

                {/* Select on Map Button */}
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    localStorage.setItem('hasSeenLocationPrompt', 'true');
                    openAllAdsMap();
                  }}
                  className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-sm">انتخاب روی نقشه</span>
                </button>

                {/* Error */}
                {locationError && (
                  <ErrorMessage 
                    error={locationError} 
                    className="mt-4" 
                  />
                )}

                {/* Cancel Button */}
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    localStorage.setItem('hasSeenLocationPrompt', 'true');
                  }}
                  className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-2 text-sm transition-colors"
                >
                  بعداً انتخاب می‌کنم
                </button>
              </div>

              {/* Info */}
              <div className="px-6 pb-6">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-blue-900 dark:text-blue-300">
                      <p className="font-medium mb-1">چرا به موقعیت من نیاز است؟</p>
                      <p className="text-blue-700 dark:text-blue-400">برای نمایش آگهی‌های نزدیک به شما</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        {!isModalOpen && !isAllAdsMapOpen && <BottomNav />}
      </div>
    </ErrorBoundary>
  );
}