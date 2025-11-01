"use client";

import { useState, useEffect, useRef } from 'react';

interface AdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

// Helper functions for geocoding
const getCoordsFromAddress = async (address: string) => {
  if (!address || address.length < 5) return null;
  
  try {
    const response = await fetch('/api/forward-geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.lat && data.lng) {
        return { lat: data.lat, lng: data.lng };
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
};

const getAddressFromCoords = async (lat: number, lng: number) => {
  try {
    const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.address;
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
  
  return `موقعیت دقیق (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
};

export default function AdFormModal({ isOpen, onClose, onSubmit }: AdFormModalProps) {
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    address: '',
    condition: 'سالم',
    price: '',
    images: [] as File[],
    primaryImageIndex: null as number | null
  });
  
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  
  // Timer for address debounce
  const addressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if Leaflet is already loaded
    if ((window as any).L) {
      setIsLeafletLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setIsLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize full map modal
  useEffect(() => {
    if (!isMapOpen || !isLeafletLoaded) return;
    
    const L = (window as any).L;
    if (!L) return;

    const fullMapContainer = document.getElementById('full-map-ad-form');
    if (!fullMapContainer) return;

    // Clear previous map if exists
    if ((window as any)._fullMapAdFormInstance) {
      (window as any)._fullMapAdFormInstance.remove();
    }

    try {
      // Initialize map
      const initialLat = adForm.latitude || 35.6892; // Default to Tehran
      const initialLng = adForm.longitude || 51.3890;
      
      const fullMap = L.map('full-map-ad-form', {
        zoomControl: true,
        attributionControl: true
      }).setView([initialLat, initialLng], 13);

      // Add tile layer
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(fullMap);
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(fullMap);
      }

      // Add marker if coordinates exist
      let marker: any = null;
      if (adForm.latitude && adForm.longitude) {
        marker = L.marker([adForm.latitude, adForm.longitude]).addTo(fullMap);
      }

      // Handle map click
      fullMap.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Update coordinates
        setAdForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));

        // Get address from coordinates
        const address = await getAddressFromCoords(lat, lng);
        if (address) {
          setAdForm(prev => ({
            ...prev,
            address,
            location: address
          }));
        }

        // Update marker
        if (!marker) {
          marker = L.marker([lat, lng]).addTo(fullMap);
          (window as any)._fullMapMarker = marker;
        } else {
          marker.setLatLng([lat, lng]);
        }
      });

      // Save instances
      (window as any)._fullMapAdFormInstance = fullMap;
      (window as any)._fullMapMarker = marker;

      // Force invalidate size after a short delay
      setTimeout(() => {
        fullMap.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Full map error:', error);
    }
  }, [isMapOpen, isLeafletLoaded]);

  // Update map when coordinates change (from useCurrentLocation or other sources)
  useEffect(() => {
    if (!isMapOpen || !isLeafletLoaded) return;
    
    const map = (window as any)._fullMapAdFormInstance;
    const marker = (window as any)._fullMapMarker;
    
    if (!map) return;
    
    if (adForm.latitude && adForm.longitude) {
      // Update map view
      map.setView([adForm.latitude, adForm.longitude], 16);
      
      // Update or create marker
      if (!marker) {
        const L = (window as any).L;
        if (L) {
          const newMarker = L.marker([adForm.latitude, adForm.longitude]).addTo(map);
          (window as any)._fullMapMarker = newMarker;
        }
      } else {
        marker.setLatLng([adForm.latitude, adForm.longitude]);
      }
    }
  }, [adForm.latitude, adForm.longitude, isMapOpen, isLeafletLoaded]);

  // Initialize mini map when coordinates are available
  useEffect(() => {
    if (!adForm.latitude || !adForm.longitude || !isLeafletLoaded || !isOpen) return;
    
    const L = (window as any).L;
    if (!L) return;

    const miniMapContainer = document.getElementById('mini-map-ad-form');
    if (!miniMapContainer) return;

    // Clear previous map
    if ((window as any)._miniMapAdFormInstance) {
      (window as any)._miniMapAdFormInstance.remove();
    }

    try {
      // Create mini map
      const miniMap = L.map('mini-map-ad-form', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false
      }).setView([adForm.latitude, adForm.longitude], 16);

      // Add tile layer
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 19
        }).addTo(miniMap);
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '',
          maxZoom: 19
        }).addTo(miniMap);
      }

      // Add marker
      const marker = L.marker([adForm.latitude, adForm.longitude]).addTo(miniMap);
      
      if (adForm.title) {
        marker.bindTooltip(adForm.title, {
          permanent: true,
          direction: 'top',
          className: 'custom-tooltip',
          offset: [0, -10]
        }).openTooltip();
      }

      // Save instance
      (window as any)._miniMapAdFormInstance = miniMap;

    } catch (error) {
      console.error('Mini map error:', error);
    }
  }, [adForm.latitude, adForm.longitude, isLeafletLoaded, adForm.title, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(adForm);
    // Reset form
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
  };

  const handleAddressChange = (newAddress: string) => {
    // Update state
    setAdForm(prev => ({ ...prev, address: newAddress, location: newAddress }));
    
    // Clear previous timer
    if (addressTimerRef.current) {
      clearTimeout(addressTimerRef.current);
    }
    
    // If address is shorter than 5 chars, clear coordinates
    if (!newAddress || newAddress.length < 5) {
      setAdForm(prev => ({ 
        ...prev, 
        latitude: null, 
        longitude: null 
      }));
      return;
    }
    
    // Set new timer for search (after 1 second of not typing)
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
        } else {
          // Clear coordinates if address not found
          setAdForm(prev => ({ 
            ...prev, 
            latitude: null, 
            longitude: null 
          }));
          alert('⚠️ آدرس پیدا نشد - از دکمه "موقعیت فعلی" استفاده کنید');
        }
      } catch (error) {
        console.error('Address geocoding failed:', error);
        setAdForm(prev => ({ 
          ...prev, 
          latitude: null, 
          longitude: null 
        }));
        alert('❌ خطا در جستجوی آدرس');
      } finally {
        setIsGeocodingAddress(false);
      }
    }, 1000);
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
        nextPrimary = newImages.length > 0 ? 0 : null;
      } else if (index < adForm.primaryImageIndex) {
        nextPrimary = adForm.primaryImageIndex - 1;
      }
    }
    setAdForm({ ...adForm, images: newImages, primaryImageIndex: nextPrimary });
  };

  const setPrimaryImage = (index: number) => {
    setAdForm({ ...adForm, primaryImageIndex: index });
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('دستگاه شما از موقعیت مکانی پشتیبانی نمی‌کند');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        setAdForm(prev => ({ ...prev, latitude, longitude }));
        
        // Get address from coordinates
        const address = await getAddressFromCoords(latitude, longitude);
        if (address) {
          setAdForm(prev => ({ ...prev, address, location: address }));
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('خطا در دریافت موقعیت');
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان آگهی *
              </label>
              <input
                type="text"
                value={adForm.title}
                onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="مثال: فروش آیفون 13 پرو"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                توضیحات *
              </label>
              <textarea
                value={adForm.description}
                onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="توضیحات کامل محصول را بنویسید..."
              />
            </div>

            {/* Price and Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  قیمت (تومان) *
                </label>
                <input
                  type="text"
                  value={adForm.price}
                  onChange={(e) => setAdForm({ ...adForm, price: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="15000000"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وضعیت
                </label>
                <select
                  value={adForm.condition}
                  onChange={(e) => setAdForm({ ...adForm, condition: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="سالم">سالم</option>
                  <option value="نو">نو</option>
                  <option value="کار کرده">کار کرده</option>
                  <option value="استوک">استوک</option>
                  <option value="نیاز به تعمیر">نیاز به تعمیر</option>
                </select>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تصاویر آگهی
              </label>
              
              {adForm.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {adForm.images.map((image, index) => {
                    const isPrimary = adForm.primaryImageIndex === index;
                    return (
                      <div key={index} className={`relative group ${isPrimary ? 'ring-2 ring-yellow-400 rounded-lg' : ''}`}>
                        {isPrimary && (
                          <div className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-yellow-400 text-white shadow-md flex items-center justify-center">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 14l1-7 4 3 2-5 2 5 4-3 1 7H3z" />
                            </svg>
                          </div>
                        )}

                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="absolute bottom-2 left-2 right-2 px-2 py-1 text-xs rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            اصلی
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">کلیک کنید</span> یا فایل را اینجا بکشید
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG یا GIF</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Location with Map */}
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
                {/* Location selection buttons */}
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
                    onClick={() => setIsMapOpen(true)}
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
                          
                {/* Mini map or guide message */}
                <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm bg-gradient-to-br from-slate-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border-2 border-blue-200/80 dark:border-blue-800/80 shadow-inner">
                  {adForm.latitude && adForm.longitude ? (
                    <div className="space-y-3">
                      {/* Mini map */}
                      <div className="relative group">
                        <div id="mini-map-ad-form" className="w-full h-48 relative transition-all duration-300" style={{ zIndex: 1 }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" style={{ zIndex: 2 }}></div>
                        <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 px-3 py-2 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50" style={{ zIndex: 3 }}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">موقعیت ثبت شد</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ad Card Preview */}
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

                {/* Address input with geocoding status */}
                <div className="relative group">
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
                    className="w-full px-4 py-4 pr-4 pl-32 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="🏠 آدرس کامل را وارد کنید..."
                  />
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

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
              >
                ثبت آگهی
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[110] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMapOpen(false)}
          ></div>
          <div className="flex min-h-screen items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="relative w-full max-w-3xl transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-800 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
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
                  <div id="full-map-ad-form" className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                  
                  {/* Loading overlay */}
                  {!isLeafletLoaded && (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">در حال بارگذاری نقشه...</p>
                      </div>
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
    </div>
  );
}

