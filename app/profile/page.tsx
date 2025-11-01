"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { getUser, isAuthenticated, logout } from '@/lib/auth-client';
import BottomNav from '@/app/components/BottomNav';
import { useUserShop } from '@/app/hooks/useUserShop';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const { userShop, loading: shopLoading } = useUserShop();
  const [user, setUser] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdFormOpen, setIsAdFormOpen] = useState(false);
  const [userAds, setUserAds] = useState<any[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [adsTab, setAdsTab] = useState<'active' | 'inactive' | 'sold'>('active');
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isAdDetailOpen, setIsAdDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // فرم ویرایش پروفایل
  const [profileForm, setProfileForm] = useState({
    username: '',
    phone: ''
  });

  // فرم ایجاد آگهی
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    location: '', // آدرس یا توضیح لوکیشن
    latitude: null as number | null,
    longitude: null as number | null,
    address: '', // آدرس استخراج شده از مختصات
    condition: 'سالم',
    price: '',
    images: [] as File[],
    primaryImageIndex: null as number | null
  });

  // وضعیت انتخاب لوکیشن روی نقشه
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const mapContainerId = 'ad-map-picker';
  const [mapReady, setMapReady] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(15);
  const [visibleAds, setVisibleAds] = useState<any[]>([]);
  const [adCache, setAdCache] = useState<Map<string, any>>(new Map());
  const [isSEOOptimized, setIsSEOOptimized] = useState(false);
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
    timestamp: number;
  }>({
    hasError: false,
    message: '',
    timestamp: 0
  });
  const mapInstanceRef = (typeof window !== 'undefined') ? (window as any)._adMapInstanceRef ?? { current: null } : { current: null };
  if (typeof window !== 'undefined' && !(window as any)._adMapInstanceRef) {
    (window as any)._adMapInstanceRef = mapInstanceRef;
  }
  const markerRef = (typeof window !== 'undefined') ? (window as any)._adMapMarkerRef ?? { current: null } : { current: null };
  if (typeof window !== 'undefined' && !(window as any)._adMapMarkerRef) {
    (window as any)._adMapMarkerRef = markerRef;
  }

  // 🚀 Performance Optimization: Memory Management
  const cleanupResources = useCallback(() => {
    // پاک کردن image URLs برای جلوگیری از memory leak
    if (adForm.images.length > 0) {
      adForm.images.forEach((image: File) => {
        const url = URL.createObjectURL(image);
        URL.revokeObjectURL(url);
      });
    }
    
    // پاک کردن cache قدیمی
    if (adCache.size > 50) {
      const newCache = new Map();
      let count = 0;
      for (const [key, value] of adCache) {
        if (count < 25) {
          newCache.set(key, value);
          count++;
        }
      }
      setAdCache(newCache);
    }
  }, [adForm.images, adCache]);

  // 🎯 Smart Zoom Management
  const getOptimalScale = useCallback((zoom: number) => {
    // فرمول بهینه‌سازی شده برای scale
    const baseScale = Math.max(0.15, Math.min(2.5, (zoom - 6) * 0.12));
    
    // اضافه کردن smoothing برای transition نرم‌تر
    const smoothedScale = Math.round(baseScale * 100) / 100;
    
    return smoothedScale;
  }, []);


  // 🚨 Advanced Error Handling System
  const handleError = useCallback((error: Error, context: string) => {
    console.error(`🚨 Error in ${context}:`, error);
    
    setErrorState({
      hasError: true,
      message: `${context}: ${error.message}`,
      timestamp: Date.now()
    });
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setErrorState(prev => ({ ...prev, hasError: false }));
    }, 5000);
  }, []);

  // 📋 Load User Ads
  const loadUserAds = useCallback(async () => {
    if (!user || !user.id) {
      console.log('⚠️ No user or user ID found, skipping ad load');
      return;
    }
    
    try {
      setIsLoadingAds(true);
      console.log('🔍 Loading ads for user:', user.id);
      
      const response = await fetch(`/api/ads?user_id=${user.id}`);
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to load ads: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw API data:', data);
      console.log('📦 Data type:', typeof data);
      console.log('📦 Is array:', Array.isArray(data));
      
      const ads = Array.isArray(data) ? data : [];
      console.log('✅ Processed ads:', ads);
      console.log('✅ Ads count:', ads.length);
      
      setUserAds(ads);
      
      if (ads.length === 0) {
        console.log('⚠️ No ads found for user:', user.id);
      } else {
        console.log('✅ Successfully loaded', ads.length, 'ads');
      }
    } catch (error) {
      console.error('❌ Error loading user ads:', error);
      handleError(error as Error, 'Load User Ads');
      setUserAds([]); // Set empty array on error
    } finally {
      setIsLoadingAds(false);
    }
  }, [user, handleError]);

  // 🗑️ Delete Ad
  const deleteAd = useCallback(async (adId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این آگهی را حذف کنید؟')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ads/${adId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete ad');
      }
      
      // Remove from state
      setUserAds(prev => prev.filter(ad => ad.id !== adId));
      setSuccessMessage('آگهی با موفقیت حذف شد');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error deleting ad:', error);
      handleError(error as Error, 'Delete Ad');
    }
  }, [handleError]);

  // 📊 Viewport-based Ad Loading with Enhanced Error Handling
  const loadVisibleAds = useCallback(async (bounds: any, zoom: number) => {
    if (!mapInstanceRef.current) return;
    
    try {
      // Construct API URL with proper encoding
      const boundsStr = encodeURIComponent(JSON.stringify(bounds));
      const apiUrl = `/api/ads?bounds=${boundsStr}&zoom=${zoom}`;
      
      console.log('🌐 Fetching ads from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response:', contentType);
        throw new Error('API returned HTML instead of JSON');
      }
      
      const data = await response.json();
      
      // Debug logging
      console.log('🔍 Raw API response:', data);
      console.log('🔍 Data type:', typeof data);
      console.log('🔍 Is array:', Array.isArray(data));
      
      // Validate API response structure
      if (!data) {
        throw new Error('Empty response from API');
      }
      
      // API now returns array directly - with extra safety
      let ads = [];
      if (Array.isArray(data)) {
        ads = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.ads)) {
        ads = data.ads;
      } else {
        console.warn('⚠️ Unexpected API response format:', data);
        ads = [];
      }
      
      // Debug logging for ads
      console.log('🔍 Processed ads:', ads);
      console.log('🔍 Ads length:', ads.length);
      
      // Additional validation
      if (!Array.isArray(ads)) {
        console.warn('⚠️ API returned non-array data:', data);
        // Set empty array as fallback
        setVisibleAds([]);
        return; // Exit early if data is invalid
      }
      
      // Enhanced cache management with size limits
      const newCache = new Map(adCache);
      
      // Triple check that ads is actually an array
      if (Array.isArray(ads)) {
        console.log('✅ Processing ads array with length:', ads.length);
        try {
          ads.forEach((ad: any, index: number) => {
            if (ad && ad.id) {
              newCache.set(ad.id, {
                ...ad,
                timestamp: Date.now()
              });
            } else {
              console.warn(`⚠️ Invalid ad at index ${index}:`, ad);
            }
          });
        } catch (forEachError) {
          console.error('🚨 Error in forEach:', forEachError);
          console.error('🚨 ads value:', ads);
          console.error('🚨 ads type:', typeof ads);
          console.error('🚨 ads constructor:', (ads as any)?.constructor?.name);
        }
      } else {
        console.error('🚨 CRITICAL: ads is not an array!');
        console.error('🚨 ads value:', ads);
        console.error('🚨 ads type:', typeof ads);
        console.error('🚨 ads constructor:', (ads as any)?.constructor?.name);
        console.error('🚨 data value:', data);
        console.error('🚨 data type:', typeof data);
      }
      
      // Clean old cache entries (older than 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      for (const [key, value] of newCache) {
        if (value.timestamp && value.timestamp < fiveMinutesAgo) {
          newCache.delete(key);
        }
      }
      
      setAdCache(newCache);
      setVisibleAds(ads);
      setCurrentZoom(zoom);
      
      // Log success for debugging
      console.log(`✅ Loaded ${ads.length} ads for zoom ${zoom}`);
      
    } catch (error) {
      console.error('🚨 Error in loadVisibleAds:', error);
      console.error('📊 Bounds:', bounds);
      console.error('📊 Zoom:', zoom);
      
      // Set empty state on error
      setVisibleAds([]);
      
      // Try to use cached data as fallback
      if (adCache.size > 0) {
        console.log('🔄 Using cached data as fallback');
        const cachedAds = Array.from(adCache.values());
        setVisibleAds(cachedAds);
      }
      
      handleError(error as Error, 'Loading Ads');
    }
  }, [adCache, handleError]);

  // 🔧 Error Boundary Effect
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      // Skip script errors from external sources
      if (event.filename && !event.filename.includes(window.location.origin)) {
        return;
      }
      
      // Handle only meaningful errors
      if (event.message && event.message !== 'Script error.') {
        handleError(new Error(event.message), 'Global Error Handler');
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
      handleError(new Error(reason), 'Unhandled Promise Rejection');
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);

  // 🎯 SEO Optimization
  useEffect(() => {
    // Update document title and meta for better SEO
    const originalTitle = document.title;
    if (adForm.title) {
      document.title = `${adForm.title} - آگهی محلی`;
      
      // Add meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `آگهی: ${adForm.title} - ${adForm.description || 'توضیحات آگهی'} - قیمت: ${adForm.price || 'توافقی'} تومان`);
      }
    }
    
    setIsSEOOptimized(true);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [adForm.title, adForm.description, adForm.price]);

  // 🧹 Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    if (userData) {
      setUser(userData);
    }
  }, [router]);

  // Load user ads when user is available
  useEffect(() => {
    if (user) {
      loadUserAds();
    }
  }, [user, loadUserAds]);

  // بارگذاری Leaflet برای نقشه
  useEffect(() => {
    if (!isMapOpen) return;
    
    // اضافه کردن CSS Leaflet
    const existingCss = document.querySelector('link[data-leaflet-css]');
    if (!existingCss) {
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
      linkEl.setAttribute('data-leaflet-css', 'true');
      document.head.appendChild(linkEl);
    }

    // بارگذاری Leaflet JS
    const loadLeaflet = () => {
      if ((window as any).L) {
        console.log('Leaflet already loaded');
        setIsLeafletLoaded(true);
        return;
      }
      
      const scriptEl = document.createElement('script');
      scriptEl.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
      scriptEl.async = true;
      scriptEl.onload = () => {
        console.log('Leaflet loaded successfully');
        setIsLeafletLoaded(true);
      };
      scriptEl.onerror = () => {
        console.error('Failed to load Leaflet from CDN');
        // تلاش با CDN دیگه
        const backupScript = document.createElement('script');
        backupScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        backupScript.async = true;
        backupScript.onload = () => {
          console.log('Leaflet loaded from backup CDN');
          setIsLeafletLoaded(true);
        };
        backupScript.onerror = () => {
          console.error('All CDN failed');
          showError('خطا در بارگذاری نقشه - اینترنت را بررسی کنید');
        };
        document.body.appendChild(backupScript);
      };
      document.body.appendChild(scriptEl);
    };

    // تاخیر برای اطمینان از بارگذاری CSS
    setTimeout(loadLeaflet, 100);
  }, [isMapOpen]);

  // ساخت یا بروزرسانی نقشه
  useEffect(() => {
    if (!isMapOpen || !isLeafletLoaded) return;
    const L = (window as any).L;
    if (!L) {
      console.error('Leaflet not available');
      return;
    }

    // تاخیر کوتاه برای اطمینان از render شدن DOM
    const timer = setTimeout(() => {
      const container = document.getElementById(mapContainerId);
      if (!container) {
        console.error('Map container not found');
        return;
      }

      // بررسی اینکه آیا container قبلی با این instance یکی است
      const needsRecreate = mapInstanceRef.current && mapInstanceRef.current.getContainer() !== container;
      
      // پاک کردن نقشه قبلی اگر container عوض شده
      if (needsRecreate) {
        console.log('Container changed, recreating map');
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log('Error removing old map:', e);
        }
        mapInstanceRef.current = null;
        markerRef.current = null;
        setMapReady(false);
        setMapInitialized(false);
      }

      // ایجاد نقشه فقط یکبار
      if (!mapInstanceRef.current) {
        try {
          const initialCenter = adForm.latitude && adForm.longitude
            ? [adForm.latitude, adForm.longitude]
            : [35.6892, 51.3890]; // تهران
          
          const map = L.map(mapContainerId, { 
            zoomControl: true,
            attributionControl: true
          }).setView(initialCenter, 15);
          
          // بارگذاری نقشه با fallback هوشمند
          const loadMapLayer = () => {
            // تشخیص تم دارک
            const isDark = document.documentElement.classList.contains('dark');
            
            // ابتدا تلاش برای نشان
            const neshanLayer = L.tileLayer('https://static.neshan.org/api/web/1/layer/neshan-web/{z}/{x}/{y}.png', {
              attribution: '© <a href="https://neshan.org">نشان</a> | Neshan',
              maxZoom: 20,
              minZoom: 6,
              tileSize: 256
            });
            
            // fallback به OpenStreetMap (دارک یا روشن)
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              maxZoom: 19,
              tileSize: 256
            });
            
            // نقشه دارک
            const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
              maxZoom: 19,
              tileSize: 256
            });
            
            // انتخاب tile layer بر اساس تم
            if (isDark) {
              console.log('🌙 Using dark map theme');
              darkLayer.addTo(map);
            } else {
              // تست نشان با timeout
              let fallbackTriggered = false;
              const fallbackTimer = setTimeout(() => {
                if (!fallbackTriggered) {
                  console.log('Neshan timeout - switching to OpenStreetMap');
                  map.removeLayer(neshanLayer);
                  osmLayer.addTo(map);
                  fallbackTriggered = true;
                }
              }, 3000);
              
              neshanLayer.on('load', () => {
                console.log('✅ Neshan tiles loaded successfully');
                clearTimeout(fallbackTimer);
              });
              
              neshanLayer.on('tileerror', (e: any) => {
                console.log('⚠️ Neshan tile error - switching to OpenStreetMap');
                if (!fallbackTriggered) {
                  clearTimeout(fallbackTimer);
                  map.removeLayer(neshanLayer);
                  osmLayer.addTo(map);
                  fallbackTriggered = true;
                }
              });
              
              // شروع با نشان
              neshanLayer.addTo(map);
            }
          };
          
          loadMapLayer();
          
          // تابع برای تغییر تم نقشه
          const updateMapTheme = () => {
            if (mapInstanceRef.current) {
              const isDark = document.documentElement.classList.contains('dark');
              const currentLayers = mapInstanceRef.current.getLayers();
              
              // حذف تمام tile layers
              currentLayers.forEach((layer: any) => {
                if (layer instanceof L.TileLayer) {
                  mapInstanceRef.current.removeLayer(layer);
                }
              });
              
              // اضافه کردن tile layer جدید
              if (isDark) {
                console.log('🌙 Switching to dark map theme');
                const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
                  maxZoom: 19,
                  tileSize: 256
                });
                darkLayer.addTo(mapInstanceRef.current);
              } else {
                console.log('☀️ Switching to light map theme');
                // استفاده از نشان یا OSM
                const neshanLayer = L.tileLayer('https://static.neshan.org/api/web/1/layer/neshan-web/{z}/{x}/{y}.png', {
                  attribution: '© <a href="https://neshan.org">نشان</a> | Neshan',
                  maxZoom: 20,
                  minZoom: 6,
                  tileSize: 256
                });
                
                const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  maxZoom: 19,
                  tileSize: 256
                });
                
                // تست نشان
                let fallbackTriggered = false;
                const fallbackTimer = setTimeout(() => {
                  if (!fallbackTriggered) {
                    mapInstanceRef.current.removeLayer(neshanLayer);
                    osmLayer.addTo(mapInstanceRef.current);
                    fallbackTriggered = true;
                  }
                }, 3000);
                
                neshanLayer.on('load', () => {
                  clearTimeout(fallbackTimer);
                });
                
                neshanLayer.on('tileerror', () => {
                  if (!fallbackTriggered) {
                    clearTimeout(fallbackTimer);
                    mapInstanceRef.current.removeLayer(neshanLayer);
                    osmLayer.addTo(mapInstanceRef.current);
                    fallbackTriggered = true;
                  }
                });
                
                neshanLayer.addTo(mapInstanceRef.current);
              }
            }
          };
          
          // ذخیره تابع برای استفاده در تغییر تم
          (window as any).updateProfileMapTheme = updateMapTheme;

          // کلیک برای انتخاب
          map.on('click', async (e: any) => {
            const { lat, lng } = e.latlng;
            
            // نمایش loading
            setIsLoading(true);
            
            // آپدیت مختصات
            setAdForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
            
            // دریافت آدرس از مختصات
            const address = await getAddressFromCoords(lat, lng);
            if (address) {
              setAdForm(prev => ({ ...prev, address, location: address }));
              showSuccess(`✅ آدرس دریافت شد: ${address.substring(0, 50)}...`);
            } else {
              showError('⚠️ آدرس دریافت نشد، اما مختصات ذخیره شد');
            }
            
            // آپدیت نشانگر
            if (!markerRef.current) {
              markerRef.current = L.marker([lat, lng]).addTo(map);
            } else {
              markerRef.current.setLatLng([lat, lng]);
            }
            
            // اضافه کردن tooltip با عنوان آگهی
            if (markerRef.current && adForm.title) {
              markerRef.current.unbindTooltip();
              markerRef.current.bindTooltip(adForm.title, {
                permanent: true,
                direction: 'top',
                className: 'custom-tooltip',
                offset: [0, -10]
              }).openTooltip();
            }
            
            setIsLoading(false);
          });

          // نشانگر اولیه اگر مختصات موجود است - کارت متناسب با دایره
          if (adForm.latitude && adForm.longitude) {
            // ساخت marker نقطه‌ای
            markerRef.current = L.marker([adForm.latitude, adForm.longitude]).addTo(map);
            
            // ساخت دایره برای محدوده آگهی (20 متر شعاع)
            const adCircle = L.circle([adForm.latitude, adForm.longitude], {
              radius: 20, // 20 متر
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              color: '#2563eb',
              weight: 2,
              interactive: true
            }).addTo(map);
            
            // اضافه کردن popup با کارت آگهی به دایره
            if (adForm.title) {
              const imageUrl = adForm.images.length > 0 && adForm.primaryImageIndex !== null
                ? URL.createObjectURL(adForm.images[adForm.primaryImageIndex])
                : adForm.images.length > 0
                ? URL.createObjectURL(adForm.images[0])
                : '';
              
              // 🎯 Unified Scale System - کل popup یکپارچه
              const getUnifiedPopupScale = (zoom: number) => {
                // فرمول یکپارچه برای کل popup
                const baseScale = Math.max(0.1, Math.min(1.5, (zoom - 8) * 0.1));
                
                // Responsive scaling برای موبایل
                const viewportWidth = window.innerWidth;
                const mobileMultiplier = viewportWidth < 768 ? 0.7 : 0.9;
                
                // Scale نهایی برای کل popup
                const finalScale = baseScale * mobileMultiplier;
                
                return Math.max(0.08, Math.min(1.2, finalScale));
              };
              
              // 🎨 Unified Popup Content - کل popup یکپارچه
              const createUnifiedPopupContent = (scale: number) => {
                const baseSize = 200; // سایز پایه
                const scaledSize = baseSize * scale;
                
                return `
                  <div style="
                    width: ${scaledSize}px;
                    min-width: ${scaledSize}px;
                    max-width: ${scaledSize}px;
                    font-family: system-ui, sans-serif;
                    transform-origin: center top;
                    transition: all 0.2s ease;
                    will-change: transform;
                    box-sizing: border-box;
                  ">
                    <!-- Compact Header -->
                    <div style="
                      padding: ${8 * scale}px; 
                      display: flex; 
                      gap: ${8 * scale}px; 
                      align-items: center;
                      background: rgba(255,255,255,0.95);
                      border-radius: ${8 * scale}px ${8 * scale}px 0 0;
                    ">
                      <!-- Small Image -->
                      <div style="position: relative;">
                        ${imageUrl ? `
                          <img 
                            src="${imageUrl}" 
                            style="
                              width: ${40 * scale}px; 
                              height: ${40 * scale}px; 
                              border-radius: ${6 * scale}px; 
                              object-fit: cover; 
                              border: 1px solid rgba(59, 130, 246, 0.3);
                            " 
                            loading="lazy"
                            alt="تصویر آگهی"
                          />
                        ` : `
                          <div style="
                            width: ${40 * scale}px; 
                            height: ${40 * scale}px; 
                            border-radius: ${6 * scale}px; 
                            background: linear-gradient(135deg, #dbeafe, #e0e7ff); 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            border: 1px solid rgba(59, 130, 246, 0.3);
                          ">
                            <svg style="width: ${20 * scale}px; height: ${20 * scale}px; color: #3b82f6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        `}
                      </div>
                      
                      <!-- Compact Content -->
                      <div style="flex: 1; min-width: 0;">
                        <h4 style="
                          font-size: ${11 * scale}px; 
                          font-weight: 600; 
                          color: #111827; 
                          margin: 0 0 ${2 * scale}px 0; 
                          line-height: 1.2;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                        ">${adForm.title || 'عنوان'}</h4>
                        
                        <p style="
                          font-size: ${9 * scale}px; 
                          color: #6b7280; 
                          margin: 0 0 ${4 * scale}px 0; 
                          line-height: 1.2;
                          display: -webkit-box;
                          -webkit-line-clamp: 1;
                          -webkit-box-orient: vertical;
                          overflow: hidden;
                        ">${adForm.description || 'توضیحات...'}</p>
                        
                        <!-- Compact Price -->
                        <div style="display: flex; gap: ${4 * scale}px; align-items: center;">
                          <span style="
                            font-size: ${10 * scale}px; 
                            font-weight: 700; 
                            color: #059669;
                            background: #ecfdf5;
                            padding: ${2 * scale}px ${4 * scale}px;
                            border-radius: ${4 * scale}px;
                          ">${adForm.price ? parseInt(adForm.price).toLocaleString('fa-IR') + ' تومان' : 'قیمت'}</span>
                          
                          <span style="
                            font-size: ${8 * scale}px; 
                            padding: ${1 * scale}px ${4 * scale}px; 
                            border-radius: ${6 * scale}px; 
                            background: #dbeafe; 
                            color: #1e40af;
                          ">${adForm.condition}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Compact Footer -->
                    <div style="
                      padding: ${4 * scale}px ${8 * scale}px; 
                      background: #f8fafc; 
                      border-top: 1px solid rgba(59, 130, 246, 0.1); 
                      display: flex; 
                      align-items: center;
                      border-radius: 0 0 ${8 * scale}px ${8 * scale}px;
                    ">
                      <svg style="width: ${8 * scale}px; height: ${8 * scale}px; color: #6b7280; margin-left: ${2 * scale}px;" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                      </svg>
                      <span style="
                        font-size: ${8 * scale}px; 
                        color: #6b7280;
                        white-space: nowrap; 
                        overflow: hidden; 
                        text-overflow: ellipsis;
                        flex: 1;
                      ">${adForm.address || 'آدرس'}</span>
                    </div>
                  </div>
                `;
              };
              
              // 🎯 Unified Event System - کل popup یکپارچه
              const bindUnifiedPopup = () => {
                const currentZoom = map.getZoom();
                const initialScale = getUnifiedPopupScale(currentZoom);
                
                adCircle.bindPopup(createUnifiedPopupContent(initialScale), {
                  maxWidth: 300,
                  className: 'custom-ad-popup unified-popup',
                  closeButton: true,
                  autoClose: false,
                  keepInView: true
                });
                
                // باز کردن popup با animation
                setTimeout(() => {
                  adCircle.openPopup();
                }, 100);
              };
              
              // 📊 Unified Zoom Event Handler
              const handleZoomChange = () => {
                const newZoom = map.getZoom();
                const newScale = getUnifiedPopupScale(newZoom);
                
                // فقط اگر popup باز است، محتوا را به‌روزرسانی کن
                if (adCircle.isPopupOpen()) {
                  // Smooth transition برای کل popup
                  const popupWrapper = document.querySelector('.unified-popup .leaflet-popup-content-wrapper') as HTMLElement;
                  if (popupWrapper) {
                    popupWrapper.style.transition = 'all 0.2s ease';
                  }
                  
                  // Update content with new scale
                  setTimeout(() => {
                    adCircle.setPopupContent(createUnifiedPopupContent(newScale));
                  }, 50);
                }
                
                // Update zoom state
                setCurrentZoom(newZoom);
              };
              
              // 🎪 Unified Event Listeners
              const setupUnifiedEvents = () => {
                // Zoom events
                map.on('zoomend', handleZoomChange);
                
                // Viewport change events
                map.on('moveend', () => {
                  const bounds = map.getBounds();
                  loadVisibleAds(bounds, map.getZoom());
                });
                
                // Popup events
                adCircle.on('popupopen', () => {
                  console.log('🚀 Unified popup opened');
                });
                
                adCircle.on('popupclose', () => {
                  console.log('🎭 Unified popup closed');
                });
                
                // Mouse events for better UX
                adCircle.on('mouseover', () => {
                  adCircle.setStyle({
                    fillOpacity: 0.25,
                    weight: 2.5
                  });
                });
                
                adCircle.on('mouseout', () => {
                  adCircle.setStyle({
                    fillOpacity: 0.15,
                    weight: 2
                  });
                });
              };
              
              // Initialize everything with error handling
              try {
                bindUnifiedPopup();
                setupUnifiedEvents();
              } catch (error) {
                handleError(error as Error, 'Map Initialization');
              }
            }
          }

          mapInstanceRef.current = map;
          setMapReady(true);
          setMapInitialized(true);
          console.log('Map initialized successfully');
          
          // مجبور کردن نقشه به بارگذاری مجدد تایل‌ها
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        } catch (error) {
          console.error('Error creating map:', error);
          showError('خطا در ایجاد نقشه');
        }
      } else {
        // اگر قبلا ایجاد شده، فقط ویو را به مختصات موجود ببر
        const map = mapInstanceRef.current;
        if (adForm.latitude && adForm.longitude) {
          map.setView([adForm.latitude, adForm.longitude], 16);
          if (!markerRef.current) {
            markerRef.current = L.marker([adForm.latitude, adForm.longitude]).addTo(map);
          } else {
            markerRef.current.setLatLng([adForm.latitude, adForm.longitude]);
          }
        }
        map.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isMapOpen, isLeafletLoaded]);

  // بروزرسانی نقشه وقتی مختصات تغییر می‌کنه یا نقشه باز می‌شه
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInitialized) return;
    
    const map = mapInstanceRef.current;
    const L = (window as any).L;
    
    // اگر مختصات موجود است، نقشه رو به اون موقعیت ببر
    if (adForm.latitude && adForm.longitude) {
      map.setView([adForm.latitude, adForm.longitude], 16);
      
      // آپدیت یا ایجاد نشانگر
      if (!markerRef.current) {
        markerRef.current = L.marker([adForm.latitude, adForm.longitude]).addTo(map);
      } else {
        markerRef.current.setLatLng([adForm.latitude, adForm.longitude]);
      }
    }
    
    // مجبور کردن نقشه به بروزرسانی
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [adForm.latitude, adForm.longitude, mapInitialized]);

  // بروزرسانی نقشه وقتی باز می‌شه
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInitialized || !isMapOpen) return;
    
    const map = mapInstanceRef.current;
    
    // مجبور کردن نقشه به بروزرسانی
    setTimeout(() => {
      map.invalidateSize();
      if (adForm.latitude && adForm.longitude) {
        map.setView([adForm.latitude, adForm.longitude], 16);
      }
    }, 200);
  }, [isMapOpen, mapInitialized]);

  // تغییر تم نقشه
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).updateProfileMapTheme) {
      (window as any).updateProfileMapTheme();
    }
  }, [resolvedTheme]);

  // ایجاد نقشه کوچک در کارت لوکیشن
  useEffect(() => {
    if (!adForm.latitude || !adForm.longitude || !isLeafletLoaded) return;
    
    const L = (window as any).L;
    if (!L) return;

    const miniMapContainer = document.getElementById('mini-map');
    if (!miniMapContainer) return;

    // پاک کردن نقشه قبلی اگر وجود دارد
    if ((window as any)._miniMapInstance) {
      (window as any)._miniMapInstance.remove();
    }

    try {
      // ایجاد نقشه کوچک
      const miniMap = L.map('mini-map', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false
      }).setView([adForm.latitude, adForm.longitude], 16);

      // اضافه کردن تایل (دارک یا روشن)
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 19,
          tileSize: 256
        }).addTo(miniMap);
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '',
          maxZoom: 19,
          tileSize: 256
        }).addTo(miniMap);
      }

      // اضافه کردن نشانگر با عنوان آگهی
      const marker = L.marker([adForm.latitude, adForm.longitude]).addTo(miniMap);
      
      // اضافه کردن popup با عنوان آگهی
      if (adForm.title) {
        marker.bindTooltip(adForm.title, {
          permanent: true,
          direction: 'top',
          className: 'custom-tooltip',
          offset: [0, -10]
        }).openTooltip();
      }

      // ذخیره instance برای پاک کردن بعدی
      (window as any)._miniMapInstance = miniMap;

    } catch (error) {
      console.error('Mini map error:', error);
    }
  }, [adForm.latitude, adForm.longitude, isLeafletLoaded]);

  // تبدیل آدرس به مختصات (Geocoding)
  const getCoordsFromAddress = async (address: string) => {
    if (!address || address.length < 5) return null;
    
    try {
      // استفاده از API داخلی برای جلوگیری از CORS
      const response = await fetch('/api/forward-geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.lat && data.lng) {
          return {
            lat: data.lat,
            lng: data.lng,
            displayName: data.displayName
          };
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    return null;
  };

  // تبدیل مختصات به آدرس دقیق
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      // استفاده از API داخلی Next.js برای جلوگیری از CORS
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('API geocoding result:', data.address);
          return data.address;
        } else {
          console.error('API returned non-JSON response');
          throw new Error('API returned HTML instead of JSON');
        }
      } else {
        console.error('API response not ok:', response.status);
        // اگر API کار نکرد، مستقیماً از Nominatim استفاده کن
        throw new Error('API not available');
      }
      
    } catch (error) {
      console.error('API geocoding error:', error);
      // ادامه به Nominatim
    }
    
    // اگر API کار نکرد، مستقیماً از Nominatim استفاده کن

    // تلاش مستقیم با Nominatim (بدون CORS)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa,en&zoom=18&addressdetails=1`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'AdApp/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          let address = data.display_name
            .replace(/،/g, ', ')
            .replace(/ایران$/, 'ایران')
            .trim();
          
          if (address.length > 100) {
            address = address.substring(0, 97) + '...';
          }
          
          console.log('Direct Nominatim result:', address);
          return address;
        }
      }
    } catch (error) {
      console.error('Direct Nominatim error:', error);
    }

    // Fallback نهایی: مختصات دقیق
    return `موقعیت دقیق (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
  };

  // تایمر برای debounce آدرس
  const addressTimerRef = typeof window !== 'undefined' ? (window as any)._addressTimerRef ?? { current: null } : { current: null };
  if (typeof window !== 'undefined' && !(window as any)._addressTimerRef) {
    (window as any)._addressTimerRef = addressTimerRef;
  }

  // جستجوی آدرس و بروزرسانی نقشه
  const handleAddressChange = (newAddress: string) => {
    // بروزرسانی state
    setAdForm(prev => ({ ...prev, address: newAddress, location: newAddress }));
    
    // پاک کردن تایمر قبلی
    if (addressTimerRef.current) {
      clearTimeout(addressTimerRef.current);
    }
    
    // اگر آدرس کوتاه‌تر از 5 کاراکتر بود، مختصات رو پاک کن
    if (!newAddress || newAddress.length < 5) {
      setAdForm(prev => ({ 
        ...prev, 
        latitude: null, 
        longitude: null 
      }));
      return;
    }
    
    // تنظیم تایمر جدید برای جستجو (بعد از 1 ثانیه توقف تایپ)
    addressTimerRef.current = setTimeout(async () => {
      setIsGeocodingAddress(true);
      
      try {
        const coords = await getCoordsFromAddress(newAddress);
        
        if (coords) {
          setAdForm(prev => ({
            ...prev,
            latitude: coords.lat,
            longitude: coords.lng
          }));
          
          // اگر نقشه اصلی باز باشه، بروزرسانی کن
          if (mapInstanceRef.current) {
            const L = (window as any).L;
            mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
            
            if (!markerRef.current) {
              markerRef.current = L.marker([coords.lat, coords.lng]).addTo(mapInstanceRef.current);
            } else {
              markerRef.current.setLatLng([coords.lat, coords.lng]);
            }
          }
          
          showSuccess('✅ موقعیت روی نقشه بروز شد');
        } else {
          // پاک کردن مختصات اگه آدرس پیدا نشد
          setAdForm(prev => ({ 
            ...prev, 
            latitude: null, 
            longitude: null 
          }));
          showError('⚠️ آدرس پیدا نشد - از دکمه "موقعیت فعلی" استفاده کنید');
        }
      } catch (error) {
        console.error('Address geocoding failed:', error);
        setAdForm(prev => ({ 
          ...prev, 
          latitude: null, 
          longitude: null 
        }));
        showError('❌ خطا در جستجوی آدرس - از دکمه "موقعیت فعلی" استفاده کنید');
      } finally {
        setIsGeocodingAddress(false);
      }
    }, 1000);
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showError('دستگاه شما از موقعیت مکانی پشتیبانی نمی‌کند');
      return;
    }
    
    setIsLoading(true);
    showSuccess('در حال دریافت موقعیت دقیق...');
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        
        // نمایش دقت موقعیت به کاربر
        if (accuracy > 50) {
          showError(`⚠️ دقت موقعیت: ${Math.round(accuracy)} متر - ممکن است دقیق نباشد`);
        } else if (accuracy > 20) {
          showSuccess(`✅ موقعیت دریافت شد (دقت: ${Math.round(accuracy)} متر)`);
        } else {
          showSuccess(`🎯 موقعیت با دقت بالا دریافت شد (دقت: ${Math.round(accuracy)} متر)`);
        }
        
        setAdForm(prev => ({ ...prev, latitude, longitude }));
        
        // دریافت آدرس از مختصات
        getAddressFromCoords(latitude, longitude).then(address => {
          if (address) {
            setAdForm(prev => ({ ...prev, address, location: address }));
          }
        });
        
        if (mapInstanceRef.current && (window as any).L) {
          const L = (window as any).L;
          const map = mapInstanceRef.current;
          map.setView([latitude, longitude], 17);
          
          // حذف دایره دقت قبلی اگر وجود دارد
          if ((window as any)._accuracyCircle) {
            map.removeLayer((window as any)._accuracyCircle);
          }
          
          // نمایش دایره دقت GPS (خیلی کوچک برای دقت حداکثر)
          (window as any)._accuracyCircle = L.circle([latitude, longitude], {
            radius: Math.min(accuracy, 20), // حداکثر 20 متر برای دقت بالا
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.3,
            weight: 2
          }).addTo(map);
          
          if (!markerRef.current) {
            markerRef.current = L.marker([latitude, longitude]).addTo(map);
          } else {
            markerRef.current.setLatLng([latitude, longitude]);
          }
        }
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        if (error.code === 1) {
          showError('دسترسی به موقعیت مکانی رد شد. لطفاً در تنظیمات مرورگر اجازه دهید.');
        } else if (error.code === 2) {
          showError('موقعیت مکانی در دسترس نیست. لطفاً GPS دستگاه را فعال کنید.');
        } else if (error.code === 3) {
          showError('زمان درخواست موقعیت تمام شد. دوباره تلاش کنید.');
        } else {
          showError('خطا در دریافت موقعیت مکانی');
        }
      },
      {
        enableHighAccuracy: true,  // درخواست دقت بالا
        timeout: 15000,            // حداکثر 15 ثانیه صبر
        maximumAge: 0              // عدم استفاده از کش قدیمی
      }
    );
  };

  // فرم تغییر رمز عبور
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // نمایش/مخفی کردن رمزها
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    
    if (userData?.role === 'admin') {
      router.push('/admin');
      return;
    }

    // بررسی وضعیت فروشگاه کاربر
    if (!shopLoading && userShop && searchParams) {
      // اگر کاربر فروشگاه دارد و action=create-ad نیست، به پروفایل فروشگاه هدایت کن
      const action = searchParams.get('action');
      if (action !== 'create-ad') {
        console.log('🔄 User has shop, redirecting to shop profile:', userShop.id);
        router.replace(`/shop/${userShop.id}`);
        return;
      }
    }

    // کاربر از طریق useUserProfile hook مدیریت می‌شود
    if (userData) {
      setProfileForm({
        username: userData.username || '',
        phone: userData.phone || ''
      });
    }
  }, [router, shopLoading, userShop, searchParams]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 4000);
  };

  // تغییر اطلاعات پروفایل
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: profileForm.username,
          phone: profileForm.phone
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response:', contentType);
        showError('خطا در ارتباط با سرور');
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'خطا در بروزرسانی اطلاعات');
        setIsLoading(false);
        return;
      }

      const updatedUser = { ...user, ...data.user };
      // بروزرسانی localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // بروزرسانی state
      setUser(updatedUser);

      showSuccess('✅ اطلاعات شما با موفقیت بروزرسانی شد');
      setIsLoading(false);
    } catch (error) {
      console.error('Profile update error:', error);
      showError('خطا در ارتباط با سرور');
      setIsLoading(false);
    }
  };

  // تغییر رمز عبور
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('رمز عبور جدید و تکرار آن مطابقت ندارند');
      setIsLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response:', contentType);
        showError('خطا در ارتباط با سرور');
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'خطا در تغییر رمز عبور');
        setIsLoading(false);
        return;
      }

      showSuccess('✅ رمز عبور شما با موفقیت تغییر یافت');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Password change error:', error);
      showError('خطا در ارتباط با سرور');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // مدیریت فرم آگهی
  const handleAdFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // اعتبارسنجی فرم
    if (!adForm.title.trim()) {
      showError('لطفاً عنوان آگهی را وارد کنید');
      setIsLoading(false);
      return;
    }

    if (!adForm.description.trim()) {
      showError('لطفاً توضیحات آگهی را وارد کنید');
      setIsLoading(false);
      return;
    }

    if (!adForm.location.trim()) {
      showError('لطفاً لوکیشن را وارد کنید');
      setIsLoading(false);
      return;
    }

    if (!adForm.price.trim()) {
      showError('لطفاً قیمت را وارد کنید');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🚀 Creating ad...');
      console.log('📦 Ad data:', {
        title: adForm.title,
        price: adForm.price,
        latitude: adForm.latitude,
        longitude: adForm.longitude,
        address: adForm.address
      });
      
      // تبدیل تصاویر به base64
      const imagePromises = adForm.images.map(img => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(img);
        });
      });
      
      const imageBase64 = await Promise.all(imagePromises);
      console.log('📷 Images converted to base64:', imageBase64.length);
      
      // ارسال به API (با user info در body چون cookie کار نمی‌کنه)
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          // User info
          userId: user.id,
          userName: user.username,
          // Ad data
          title: adForm.title,
          description: adForm.description,
          price: adForm.price,
          condition: adForm.condition,
          latitude: adForm.latitude,
          longitude: adForm.longitude,
          address: adForm.address,
          images: imageBase64 // base64 instead of blob URLs
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('❌ API Error:', errorData);
          throw new Error(errorData.error || 'Failed to create ad');
        } else {
          console.error('❌ API returned non-JSON response:', contentType);
          throw new Error('Server returned HTML instead of JSON');
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response:', contentType);
        throw new Error('Server returned HTML instead of JSON');
      }
      
      const result = await response.json();
      console.log('✅ Ad created:', result);
      
      showSuccess('✅ آگهی شما با موفقیت ایجاد شد');
      setAdForm({
        title: '',
        description: '',
        location: '',
        latitude: null,
        longitude: null,
        address: '',
        condition: 'سالم',
        price: '',
        images: [],
        primaryImageIndex: null
      });
      setIsAdFormOpen(false);
      setIsLoading(false);
      
      // بارگذاری مجدد آگهی‌های کاربر
      console.log('🔄 Reloading ads...');
      setTimeout(() => {
        loadUserAds();
      }, 500);
    } catch (error) {
      console.error('❌ Ad creation error:', error);
      showError('خطا در ایجاد آگهی');
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const nextImages = [...adForm.images, ...files];
    const hasPrimary = adForm.primaryImageIndex !== null && adForm.primaryImageIndex >= 0 && adForm.primaryImageIndex < nextImages.length;
    setAdForm({
      ...adForm,
      images: nextImages,
      primaryImageIndex: hasPrimary ? adForm.primaryImageIndex : (nextImages.length > 0 ? 0 : null)
    });
  };

  const removeImage = (index: number) => {
    const newImages = adForm.images.filter((_, i) => i !== index);
    let nextPrimary: number | null = adForm.primaryImageIndex;
    if (adForm.primaryImageIndex !== null) {
      if (index === adForm.primaryImageIndex) {
        // if primary removed, set to first image if exists
        nextPrimary = newImages.length > 0 ? 0 : null;
      } else if (index < adForm.primaryImageIndex) {
        // shift left
        nextPrimary = adForm.primaryImageIndex - 1;
      }
    }
    setAdForm({ ...adForm, images: newImages, primaryImageIndex: nextPrimary });
  };

  const setPrimaryImage = (index: number) => {
    setAdForm({ ...adForm, primaryImageIndex: index });
  };

  // تنظیم background body و html
  // حذف شد - اجازه می‌دهیم تا تم کلاس‌های Tailwind مدیریت کنند

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-black pb-24">
      {/* Header Card */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 dark:bg-[#1976D2] px-4 pt-8 pb-20 overflow-hidden isolate">
        {/* حباب بزرگ - بالا راست */}
        <div className="absolute -top-20 -right-20 w-72 h-72 border-8 border-white/40 dark:border-white/20 rounded-full animate-float shadow-[0_0_60px_rgba(255,255,255,0.3)] dark:shadow-[0_0_60px_rgba(0,0,0,0.3)]"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 border-4 border-white/30 dark:border-white/15 rounded-full animate-float shadow-[0_0_80px_rgba(255,255,255,0.2)] dark:shadow-[0_0_80px_rgba(0,0,0,0.2)]"></div>
        
        {/* حباب کوچک - پایین چپ */}
        <div className="absolute -bottom-12 -left-12 w-40 h-40 border-6 border-white/50 dark:border-white/25 rounded-full animate-float-slow shadow-[0_0_40px_rgba(255,255,255,0.3)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)]"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 border-4 border-white/30 dark:border-white/15 rounded-full animate-float-slow shadow-[0_0_50px_rgba(255,255,255,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,0.2)]"></div>
        
        <div className="max-w-md mx-auto relative z-10">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
                title="تنظیمات"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">خروج</span>
            </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 ring-4 ring-white/50 dark:ring-white/30">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user.name?.charAt(0)}
                </span>
              </div>
              <div className="absolute bottom-3 right-0 w-7 h-7 bg-blue-500 rounded-full border-4 border-white shadow-sm"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-white/90 dark:text-white/80 text-sm" dir="ltr">@{user.username}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 -mt-12 relative z-20">
        {/* پیام‌های موفقیت و خطا */}
        {successMessage && (
          <div className="mb-4 bg-blue-500 text-white px-4 py-3 rounded-2xl shadow-lg animate-slide-down">
            <p className="text-sm text-center font-medium">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 bg-red-500 text-white px-4 py-3 rounded-2xl shadow-lg animate-slide-down">
            <p className="text-sm text-center font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* ایجاد آگهی */}
          <button 
            onClick={() => setIsAdFormOpen(true)}
            className="relative overflow-hidden bg-gradient-to-b from-white/40 to-white/80 dark:from-gray-800/40 dark:to-gray-800/80 backdrop-blur-xl hover:from-white/50 hover:to-white/90 dark:hover:from-gray-800/50 dark:hover:to-gray-800/90 rounded-2xl p-4 shadow-lg text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl group border border-white/50 dark:border-gray-700/50"
          >
            <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
              <svg className="w-12 h-12 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">ایجاد آگهی</div>
            </div>
          </button>
          
          {/* ایجاد فروشگاه */}
          <button 
            onClick={() => router.push('/shop')}
            className="relative overflow-hidden bg-gradient-to-b from-white/40 to-white/80 dark:from-gray-800/40 dark:to-gray-800/80 backdrop-blur-xl hover:from-white/50 hover:to-white/90 dark:hover:from-gray-800/50 dark:hover:to-gray-800/90 rounded-2xl p-4 shadow-lg text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl group border border-white/50 dark:border-gray-700/50"
          >
            <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
              <svg className="w-12 h-12 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">ایجاد فروشگاه</div>
            </div>
          </button>
          
          {/* تعمیرگاه */}
          <button 
            disabled
            className="relative overflow-hidden bg-gradient-to-b from-white/20 to-white/40 dark:from-gray-800/20 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl p-4 shadow-lg text-center transition-all duration-300 group border border-white/30 dark:border-gray-700/30 opacity-50 cursor-not-allowed"
          >
            <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
              <svg className="w-12 h-12 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">تعمیرگاه</div>
            </div>
          </button>
        </div>

        {/* اطلاعات حساب */}
        <div className="space-y-4">
          {/* اطلاعات کاربری */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              اطلاعات حساب
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">نام</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">نام کاربری</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white" dir="ltr">@{user.username}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">شماره تماس</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white" dir="ltr">{user.phone}</span>
          </div>
          </div>
          </div>

          {/* آگهی‌های من */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  آگهی‌های من
                  <span className="mr-2 px-2 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                    {userAds.length}
                  </span>
                </h3>
                
                {/* Refresh Button */}
                <button
                  onClick={loadUserAds}
                  disabled={isLoadingAds}
                  className="mr-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  title="بارگذاری مجدد"
                >
                  <svg 
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isLoadingAds ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              {/* Ads Tab Filter */}
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => setAdsTab('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    adsTab === 'active'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  فعال
                </button>
                <button
                  onClick={() => setAdsTab('inactive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    adsTab === 'inactive'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  غیرفعال
                </button>
                <button
                  onClick={() => setAdsTab('sold')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    adsTab === 'sold'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  فروخته شده
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoadingAds && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Ads Grid - Image Only Cards */}
            {!isLoadingAds && userAds.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {userAds
                  .filter(ad => ad.status === adsTab)
                  .map((ad) => (
                    <div
                      key={ad.id}
                      onClick={() => {
                        setSelectedAd(ad);
                        setIsAdDetailOpen(true);
                        setCurrentImageIndex(0);
                        setIsEditMode(false);
                        setEditForm({
                          title: ad.title,
                          description: ad.description,
                          price: ad.price,
                          condition: ad.condition,
                          address: ad.address,
                          status: ad.status
                        });
                      }}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      {/* Ad Image */}
                      {ad.images && ad.images.length > 0 ? (
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Overlay with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>


                      {/* Title & Price on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">
                          {ad.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400">
                            {ad.price ? parseInt(ad.price).toLocaleString('fa-IR') + ' تومان' : 'توافقی'}
                          </span>
                          <span className="text-xs text-white/80 flex items-center">
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {ad.views || 0}
                          </span>
                        </div>
                      </div>

                      {/* Click indicator */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoadingAds && userAds.filter(ad => ad.status === adsTab).length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {adsTab === 'active' && 'هنوز آگهی فعالی ندارید'}
                  {adsTab === 'inactive' && 'آگهی غیرفعالی وجود ندارد'}
                  {adsTab === 'sold' && 'آگهی فروخته شده‌ای وجود ندارد'}
                </p>
                <button
                  onClick={() => setIsAdFormOpen(true)}
                  className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  ایجاد اولین آگهی
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setIsSettingsOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="flex min-h-screen items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-800 shadow-2xl transition-all max-h-[85vh] overflow-y-auto animate-slide-up">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
        {/* Tabs */}
                  <div className="flex flex-1 space-x-2 space-x-reverse">
            <button
              onClick={() => setActiveTab('info')}
                      className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'info'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              اطلاعات حساب
            </button>
            <button
              onClick={() => setActiveTab('security')}
                      className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'security'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              امنیت و رمز
                    </button>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all flex-shrink-0"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
            </button>
          </div>
        </div>

              {/* Modal Body */}
              <div className="p-6">
        {/* تب اطلاعات حساب */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ویرایش اطلاعات
              </h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="مثال: ali_123"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    پیشنهاد: استفاده از حروف انگلیسی
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    شماره موبایل
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base"
                    placeholder="09123456789"
                    dir="ltr"
                    maxLength={11}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse text-base"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>در حال ذخیره...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>ذخیره تغییرات</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* تب امنیت */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                تغییر رمز عبور
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رمز عبور فعلی
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      className="w-full px-4 py-3.5 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base"
                      placeholder="رمز عبور فعلی"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.current ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رمز عبور جدید
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      className="w-full px-4 py-3.5 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base"
                      placeholder="رمز عبور جدید"
                      dir="ltr"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.new ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">حداقل ۶ کاراکتر</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    تکرار رمز عبور
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      className="w-full px-4 py-3.5 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base"
                      placeholder="تکرار رمز عبور"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.confirm ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse text-base"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>در حال تغییر...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>تغییر رمز عبور</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* نکته امنیتی */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">نکته امنیتی</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    پس از تغییر رمز عبور، از تمام دستگاه‌ها خارج می‌شوید و باید مجدداً وارد شوید.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Creation Modal */}
      {isAdFormOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setIsAdFormOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="flex min-h-screen items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-800 shadow-2xl transition-all max-h-[90vh] overflow-y-auto animate-slide-up">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 px-6 py-4 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">ایجاد آگهی جدید</h2>
                      <p className="text-xs text-blue-100">اطلاعات آگهی خود را وارد کنید</p>
                    </div>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setIsAdFormOpen(false)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all flex-shrink-0"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <form onSubmit={handleAdFormSubmit} className="space-y-6">
                  {/* عنوان آگهی */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      عنوان آگهی *
                    </label>
                    <input
                      type="text"
                      value={adForm.title}
                      onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                      required
                      className="w-full px-4 py-3.5 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base hover:border-blue-300 dark:hover:border-blue-700"
                      placeholder="مثال: فروش آیفون 13 پرو"
                    />
                  </div>

                  {/* توضیحات */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      توضیحات آگهی *
                    </label>
                    <textarea
                      value={adForm.description}
                      onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-4 py-3.5 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base resize-none hover:border-blue-300 dark:hover:border-blue-700"
                      placeholder="توضیحات کامل محصول یا خدمات خود را بنویسید..."
                    />
                  </div>

                  {/* لوکیشن با نقشه */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span>موقعیت مکانی</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                      {/* دکمه‌های انتخاب موقعیت */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={useCurrentLocation}
                          className="flex-1 group relative overflow-hidden px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                            <span className="text-sm">موقعیت فعلی من</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdForm(prev => ({
                              ...prev,
                              latitude: null,
                              longitude: null,
                              address: '',
                              location: ''
                            }));
                            setIsMapOpen(true);
                          }}
                          className="flex-1 group relative overflow-hidden px-4 py-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 dark:from-indigo-600 dark:via-purple-700 dark:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <span className="text-sm">انتخاب روی نقشه</span>
                          </div>
                        </button>
                      </div>
                          
                      {/* نقشه کوچک یا پیام راهنما */}
                      <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm bg-gradient-to-br from-slate-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border-2 border-blue-200/80 dark:border-blue-800/80 shadow-inner">
                        {adForm.latitude && adForm.longitude ? (
                          <div className="space-y-3">
                            {/* نقشه کوچک */}
                            <div className="relative group">
                              <div id="mini-map" className="w-full h-48 relative transition-all duration-300" style={{ zIndex: 1 }}></div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" style={{ zIndex: 2 }}></div>
                              <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 px-3 py-2 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50" style={{ zIndex: 3 }}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">موقعیت ثبت شد</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* پیش‌نمایش کارت آگهی */}
                            <div className="p-3">
                              <div className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl border-2 border-blue-500/50 dark:border-blue-400/50 overflow-hidden">
                                <div className="p-3 space-y-2">
                                  <div className="flex items-start gap-3">
                                    {adForm.images.length > 0 && adForm.primaryImageIndex !== null ? (
                                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-blue-500/30">
                                        <img
                                          src={URL.createObjectURL(adForm.images[adForm.primaryImageIndex])}
                                          alt="preview"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : adForm.images.length > 0 ? (
                                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-blue-500/30">
                                        <img
                                          src={URL.createObjectURL(adForm.images[0])}
                                          alt="preview"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border-2 border-blue-500/30">
                                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {adForm.title || 'عنوان آگهی'}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                        {adForm.description || 'توضیحات...'}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {adForm.price ? `${parseInt(adForm.price).toLocaleString('fa-IR')} تومان` : 'قیمت'}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                          {adForm.condition}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-blue-200/30 dark:border-blue-700/30 flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="truncate max-w-[150px]">{adForm.address || 'آدرس'}</span>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setIsMapOpen(true)}
                                    className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    پیش‌نمایش
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (adForm.address && adForm.address.length >= 5) ? (
                          <div className="relative w-full h-48 bg-gradient-to-br from-orange-400/10 via-amber-400/10 to-yellow-400/10 dark:from-orange-500/20 dark:via-amber-500/20 dark:to-yellow-500/20 border-2 border-dashed border-orange-400/30 dark:border-orange-500/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl"></div>
                            <div className="relative">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600 flex items-center justify-center mb-3 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <p className="text-sm font-bold text-orange-700 dark:text-orange-300 mb-1">
                                آدرس پیدا نشد!
                              </p>
                              <p className="text-xs text-orange-600 dark:text-orange-400">
                                از دکمه &ldquo;موقعیت فعلی من&rdquo; استفاده کنید
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-48 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-purple-500/20 border-2 border-dashed border-blue-400/30 dark:border-blue-500/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                            <div className="absolute inset-0">
                              <div className="absolute top-4 right-4 w-20 h-20 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-2xl animate-pulse"></div>
                              <div className="absolute bottom-4 left-4 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-2xl animate-pulse delay-700"></div>
                            </div>
                            <div className="relative">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-700 flex items-center justify-center mb-3 shadow-lg animate-bounce">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">
                                موقعیت مکانی انتخاب نشده
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                آدرس تایپ کنید یا از دکمه‌های بالا استفاده کنید
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* آدرس اصلی */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition duration-300"></div>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            {isGeocodingAddress ? (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-xs font-medium">در حال جستجو...</span>
                              </div>
                            ) : adForm.latitude && adForm.longitude ? (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-medium">یافت شد</span>
                              </div>
                            ) : null}
                          </div>
                          <input
                            type="text"
                            value={adForm.address || adForm.location || ''}
                            onChange={(e) => handleAddressChange(e.target.value)}
                            className="relative w-full px-4 py-4 pr-4 pl-32 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-transparent outline-none transition-all text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="🏠 آدرس کامل را وارد کنید..."
                          />
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50">
                        <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          <span className="font-semibold">راهنما:</span> آدرس را تایپ کنید تا خودکار روی نقشه نمایش داده شود، یا روی نقشه کلیک کنید تا آدرس وارد شود.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* وضعیت و قیمت */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* وضعیت */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        وضعیت محصول
                      </label>
                      <select
                        value={adForm.condition}
                        onChange={(e) => setAdForm({ ...adForm, condition: e.target.value })}
                        className="w-full px-4 py-3.5 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base hover:border-blue-300 dark:hover:border-blue-700"
                      >
                        <option value="سالم">سالم</option>
                        <option value="کار کرده">کار کرده</option>
                        <option value="استوک">استوک</option>
                        <option value="نو">نو</option>
                        <option value="نیاز به تعمیر">نیاز به تعمیر</option>
                      </select>
                    </div>

                    {/* قیمت */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        قیمت (تومان) *
                      </label>
                      <input
                        type="text"
                        value={adForm.price}
                        onChange={(e) => setAdForm({ ...adForm, price: e.target.value })}
                        required
                        className="w-full px-4 py-3.5 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base hover:border-blue-300 dark:hover:border-blue-700"
                        placeholder="مثال: 15000000"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* آپلود تصاویر */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تصاویر آگهی
                    </label>
                    
                    {/* نمایش تصاویر انتخاب شده */}
                    {adForm.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {adForm.images.map((image, index) => {
                          const isPrimary = adForm.primaryImageIndex === index;
                          return (
                            <div key={index} className={`relative group ${isPrimary ? 'ring-2 ring-yellow-400 rounded-lg' : ''}`}>
                              {/* Crown badge when primary */}
                              {isPrimary && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-0">
                                  <div className="w-7 h-7 rounded-full bg-yellow-400 text-white shadow-md flex items-center justify-center">
                                    {/* Crown icon */}
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M3 14l1-7 4 3 2-5 2 5 4-3 1 7H3z" />
                                    </svg>
                                  </div>
                                </div>
                              )}

                              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`تصویر ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Set as primary button */}
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(index)}
                                  className="absolute bottom-2 left-2 right-2 px-2 py-1 text-xs rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  انتخاب به عنوان تصویر اصلی
                                </button>
                              )}

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* دکمه آپلود */}
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all cursor-pointer group"
                      >
                        <svg className="w-8 h-8 text-blue-400 dark:text-blue-500 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          کلیک کنید تا تصاویر را انتخاب کنید
                        </span>
                        <span className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                          حداکثر 5 تصویر
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* دکمه‌های عملیات */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAdFormOpen(false)}
                      className="flex-1 px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>در حال ایجاد...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>ایجاد آگهی</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[110] overflow-y-auto animate-fade-in">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setIsMapOpen(false)}
          ></div>
          <div className="flex min-h-screen items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="relative w-full max-w-3xl transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-800 shadow-2xl transition-all max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 px-6 py-4 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold">انتخاب موقعیت روی نقشه</h3>
                      <p className="text-xs text-blue-100">روی نقشه کلیک کنید تا موقعیت انتخاب شود</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMapOpen(false)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="relative w-full h-[60vh] rounded-xl overflow-hidden">
                  <div id={mapContainerId} className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                  
                  {/* Loading overlay */}
                  {!mapReady && (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">در حال بارگذاری نقشه...</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Leaflet: {isLeafletLoaded ? '✅' : '⏳'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Debug info */}
                  {mapReady && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Map Ready ✅
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      موقعیت فعلی
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(false)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg transform hover:scale-105 active:scale-95 transition-all"
                    >
                      ✓ تایید و بستن
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* انیمیشن */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-5px) translateX(5px);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(8px) translateX(-8px);
          }
        }
        
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        
        /* Custom Tooltip Style */
        :global(.custom-tooltip) {
          background: linear-gradient(135deg, rgb(59 130 246) 0%, rgb(99 102 241) 100%) !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 8px 16px !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4) !important;
          font-size: 13px !important;
          white-space: nowrap !important;
          backdrop-filter: blur(10px) !important;
        }
        
        :global(.custom-tooltip::before) {
          border-top-color: rgb(59 130 246) !important;
        }
        
        :global(.leaflet-container .leaflet-control-attribution) {
          display: none !important;
        }
        
        /* Custom Ad Popup */
        :global(.custom-ad-popup .leaflet-popup-content-wrapper) {
          padding: 0 !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2) !important;
          border: 2px solid rgba(59, 130, 246, 0.5) !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          overflow: visible !important;
        }
        
        :global(.custom-ad-popup .leaflet-popup-content) {
          margin: 0 !important;
          overflow: visible !important;
        }
        
        :global(.custom-ad-popup .leaflet-popup-tip) {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 2px solid rgba(59, 130, 246, 0.5) !important;
          border-top: none !important;
          border-right: none !important;
        }
        
        :global(.custom-ad-popup .leaflet-popup-close-button) {
          color: #3b82f6 !important;
          font-size: 20px !important;
          padding: 4px 8px !important;
          z-index: 1000 !important;
        }
        
        /* 🎨 Unified Popup Styles - کل popup یکپارچه */
        :global(.unified-popup .leaflet-popup-content-wrapper) {
          transition: all 0.2s ease !important;
          transform: translateZ(0) !important;
          will-change: transform !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
          border: 2px solid rgba(59, 130, 246, 0.3) !important;
          overflow: hidden !important;
        }
        
        :global(.unified-popup .leaflet-popup-content) {
          margin: 0 !important;
          overflow: hidden !important;
          transform: translateZ(0) !important;
          width: 100% !important;
          height: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* 🎪 Unified Animations */
        :global(.unified-popup .leaflet-popup-content-wrapper) {
          animation: unifiedFadeIn 0.3s ease !important;
        }
        
        @keyframes unifiedFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        /* 🎯 Unified Hover Effects */
        :global(.unified-popup:hover .leaflet-popup-content-wrapper) {
          transform: translateZ(0) scale(1.02) !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2) !important;
          border-color: rgba(59, 130, 246, 0.5) !important;
        }
        
        /* 📱 Unified Responsive Design */
        @media (max-width: 768px) {
          :global(.unified-popup .leaflet-popup-content-wrapper) {
            max-width: 90vw !important;
            max-height: 70vh !important;
          }
        }
        
        /* 🚀 Unified Performance Optimizations */
        :global(.unified-popup *) {
          backface-visibility: hidden !important;
          perspective: 1000px !important;
        }
        
        /* 🎨 Unified Popup Specific Styles */
        :global(.unified-popup .leaflet-popup-tip) {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 2px solid rgba(59, 130, 246, 0.3) !important;
          border-top: none !important;
          border-right: none !important;
        }
        
        :global(.unified-popup .leaflet-popup-close-button) {
          color: #3b82f6 !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
          z-index: 1000 !important;
        }
      `}</style>

      {/* 🚨 Error Display */}
      {errorState.hasError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '300px',
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <svg style={{ width: '20px', height: '20px', color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span style={{ fontWeight: '700', color: '#dc2626' }}>خطا</span>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#7f1d1d',
            margin: '0',
            lineHeight: '1.4'
          }}>
            {errorState.message}
          </p>
          <button
            onClick={() => setErrorState(prev => ({ ...prev, hasError: false }))}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}


      {/* Ad Detail Modal - Full Screen */}
      {isAdDetailOpen && selectedAd && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-md">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setIsAdDetailOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-4 py-2 rounded-full ${
                    isEditMode 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  } transition-all flex items-center`}
                >
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditMode ? 'حالت مشاهده' : 'ویرایش'}
                </button>
                
                <button
                  onClick={() => {
                    deleteAd(selectedAd.id.toString());
                    setIsAdDetailOpen(false);
                  }}
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 pb-20">
            {/* Image Carousel */}
            {selectedAd.images && selectedAd.images.length > 0 && (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl mb-6">
                <img
                  src={selectedAd.images[currentImageIndex]}
                  alt={selectedAd.title}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {selectedAd.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? selectedAd.images.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === selectedAd.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {selectedAd.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedAd.images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                  <span className="text-white text-sm font-medium">
                    {currentImageIndex + 1} / {selectedAd.images.length}
                  </span>
                </div>
              </div>
            )}

            {/* Details Section */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden border border-white/10">
              {/* Title & Status */}
              <div className="p-6 border-b border-white/10">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-2xl font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-white mb-2">{selectedAd.title}</h1>
                )}
                
                <div className="flex items-center gap-3 flex-wrap mt-4">
                  {isEditMode ? (
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="active">فعال</option>
                      <option value="inactive">غیرفعال</option>
                      <option value="sold">فروخته شده</option>
                    </select>
                  ) : (
                    <>
                      {selectedAd.status === 'active' && (
                        <span className="px-3 py-1.5 text-sm font-bold bg-blue-500 text-white rounded-full">
                          فعال
                        </span>
                      )}
                      {selectedAd.status === 'sold' && (
                        <span className="px-3 py-1.5 text-sm font-bold bg-blue-500 text-white rounded-full">
                          فروخته شده
                        </span>
                      )}
                      {selectedAd.status === 'inactive' && (
                        <span className="px-3 py-1.5 text-sm font-bold bg-gray-500 text-white rounded-full">
                          غیرفعال
                        </span>
                      )}
                    </>
                  )}
                  
                  <span className="px-3 py-1.5 text-sm bg-white/10 text-white/80 rounded-full flex items-center">
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedAd.views || 0} بازدید
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                {isEditMode ? (
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">قیمت (تومان)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="قیمت را وارد کنید"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white/60 mb-1">قیمت</div>
                      <div className="text-3xl font-black text-blue-400">
                        {selectedAd.price ? parseInt(selectedAd.price).toLocaleString('fa-IR') : 'توافقی'}
                        {selectedAd.price && <span className="text-lg text-white/60 mr-2">تومان</span>}
                      </div>
                    </div>
                    <div className="text-6xl opacity-10">💰</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 ml-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <h3 className="text-lg font-bold text-white">توضیحات</h3>
                </div>
                {isEditMode ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                ) : (
                  <p className="text-white/80 leading-relaxed">{selectedAd.description}</p>
                )}
              </div>

              {/* Info Grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Condition */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 ml-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-white/60">وضعیت کالا</span>
                  </div>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editForm.condition}
                      onChange={(e) => setEditForm({...editForm, condition: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                  ) : (
                    <div className="text-white font-medium">{selectedAd.condition}</div>
                  )}
                </div>

                {/* Location */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 ml-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-white/60">موقعیت</span>
                  </div>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  ) : (
                    <div className="text-white font-medium text-sm line-clamp-2">{selectedAd.address || 'نامشخص'}</div>
                  )}
                </div>

                {/* Date */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 ml-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-white/60">تاریخ ثبت</span>
                  </div>
                  <div className="text-white font-medium text-sm">
                    {new Date(selectedAd.created_at).toLocaleDateString('fa-IR')}
                  </div>
                </div>

                {/* Views */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 ml-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm text-white/60">آمار بازدید</span>
                  </div>
                  <div className="text-white font-medium text-sm">{selectedAd.views || 0} بازدید</div>
                </div>
              </div>

              {/* Save Button (Edit Mode) */}
              {isEditMode && (
                <div className="p-6 border-t border-white/10">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/ads/${selectedAd.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editForm)
                        });
                        
                        if (response.ok) {
                          showSuccess('آگهی با موفقیت بروزرسانی شد');
                          setIsEditMode(false);
                          loadUserAds();
                          setSelectedAd({...selectedAd, ...editForm});
                        }
                      } catch (error) {
                        showError('خطا در بروزرسانی آگهی');
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ذخیره تغییرات
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
