"use client";

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import MapSearch from './MapSearch';

interface MapContainerProps {
  isOpen: boolean;
  ads: any[];
  userLocation: { latitude: number; longitude: number } | null;
  searchRadius: number;
  onMapReady: (mapInstance: any) => void;
  onClose: () => void;
  onLocationSelect?: (location: { latitude: number; longitude: number; address: string }) => void;
}

export default function MapContainer({ 
  isOpen, 
  ads, 
  userLocation, 
  searchRadius, 
  onMapReady, 
  onClose,
  onLocationSelect
}: MapContainerProps) {
  const { resolvedTheme } = useTheme();
  const [isMapReady, setIsMapReady] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || ads.length === 0) {
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
        const mapContainer = document.getElementById('all-ads-map-container');
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
          const map = L.map('all-ads-map-container', {
            center: userLocation ? [userLocation.latitude, userLocation.longitude] : [35.6892, 51.3890],
            zoom: 12,
            zoomControl: false,
            scrollWheelZoom: true,
            attributionControl: false,
          });

          mapInstanceRef.current = map;
          onMapReady(map);

          // Load map layer
          const isDark = resolvedTheme === 'dark';
          
          const neshanLayer = L.tileLayer('https://static.neshan.org/api/web/1/layer/neshan-web/{z}/{x}/{y}.png', {
            attribution: '',
            tileSize: 256,
            className: isDark ? 'map-tiles-dark' : ''
          });
          
          const fallbackLayer = isDark 
            ? L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: ''
              })
            : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: ''
              });

          // Try Neshan first, fallback to others
          neshanLayer.addTo(map);
          neshanLayer.on('tileerror', () => {
            map.removeLayer(neshanLayer);
            fallbackLayer.addTo(map);
          });

          // Add markers for ads
          ads.forEach(ad => {
            if (ad.latitude && ad.longitude) {
              const marker = L.marker([ad.latitude, ad.longitude], {
                icon: L.divIcon({
                  className: 'custom-marker',
                  html: `
                    <div class="relative group">
                      <!-- Ad Icon Only -->
                      <div class="w-8 h-8 flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer transform hover:rotate-12">
                        <svg class="w-8 h-8 text-blue-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24" stroke="url(#adGradient)" stroke-width="2">
                          <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" fill="black"/>
                          <!-- Gradient Definition -->
                          <defs>
                            <linearGradient id="adGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
                              <stop offset="50%" style="stop-color:#7c3aed;stop-opacity:1" />
                              <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      
                      <!-- Pulse Animation -->
                      <div class="absolute inset-0 w-8 h-8 flex items-center justify-center">
                        <svg class="w-8 h-8 text-blue-400 animate-ping opacity-20" fill="currentColor" viewBox="0 0 24 24" stroke="url(#adGradientPulse)" stroke-width="2">
                          <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" fill="black"/>
                          <!-- Gradient Definition for Pulse -->
                          <defs>
                            <linearGradient id="adGradientPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
                              <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.8" />
                              <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:0.8" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  `,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16]
                })
              });

              const popupContent = `
                <div class="w-56 h-20 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex">
                  <!-- Image Section -->
                  ${ad.images && ad.images.length > 0 ? `
                    <div class="relative w-16 h-20 bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      <img 
                        src="${ad.images[0]}" 
                        alt="${ad.title}"
                        class="w-full h-full object-cover popup-image"
                        loading="lazy"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                      />
                      <div class="absolute inset-0 bg-gray-200 dark:bg-gray-600 hidden items-center justify-center">
                        <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  ` : `
                    <div class="w-16 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0">
                      <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `}
                  
                  <!-- Content Section -->
                  <div class="flex-1 p-2 flex flex-col justify-between">
                    <!-- Top Row: Title -->
                    <div class="mb-1">
                      <h3 class="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 leading-tight">
                        ${ad.title}
                      </h3>
                    </div>
                    
                    <!-- Middle Row: Price -->
                    <div class="mb-1">
                      <span class="text-sm font-bold text-blue-600 dark:text-blue-400">
                        ${ad.price ? new Intl.NumberFormat('fa-IR').format(ad.price) + ' تومان' : 'توافقی'}
                      </span>
                    </div>
                    
                    <!-- Bottom Row: Button -->
                    <div class="flex justify-end">
                      <!-- Action Button -->
                      <button 
                        onclick="window.openAdDetail && window.openAdDetail(${ad.id})"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded-lg popup-button flex items-center gap-1 text-xs"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        جزئیات
                      </button>
                    </div>
                  </div>
                </div>
              `;

              marker.bindPopup(popupContent);
              marker.addTo(map);
            }
          });

          // Add user location marker if available
          if (userLocation) {
            const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
              icon: L.divIcon({
                className: 'user-marker',
                html: `
                  <div class="relative group">
                    <!-- User Pin Icon -->
                    <div class="w-8 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer transform hover:rotate-12">
                      <svg class="w-8 h-10 text-red-500 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="red" stroke-width="2">
                        <!-- Pin Shape with User Icon -->
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <!-- User Head -->
                        <circle cx="12" cy="9" r="2.5" fill="blue" stroke="red" stroke-width="1"/>
                        <!-- User Body -->
                        <path d="M12 12.5c-1.5 0-3 0.5-3 2v1h6v-1c0-1.5-1.5-2-3-2z" fill="blue" stroke="red" stroke-width="1"/>
                      </svg>
                    </div>
                    
                    <!-- Pulse Animation -->
                    <div class="absolute inset-0 w-8 h-10 flex items-center justify-center">
                      <svg class="w-8 h-10 text-red-400 animate-ping opacity-20" fill="none" viewBox="0 0 24 24" stroke="red" stroke-width="2">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5" fill="blue" stroke="red" stroke-width="1"/>
                        <path d="M12 12.5c-1.5 0-3 0.5-3 2v1h6v-1c0-1.5-1.5-2-3-2z" fill="blue" stroke="red" stroke-width="1"/>
                      </svg>
                    </div>
                  </div>
                `,
                iconSize: [32, 40],
                iconAnchor: [16, 40]
              })
            });
            userMarker.addTo(map);

            // Add enhanced search radius circle
            const circle = L.circle([userLocation.latitude, userLocation.longitude], {
              color: '#8b5cf6',
              fillColor: '#8b5cf6',
              fillOpacity: 0.15,
              weight: 3,
              dashArray: '10, 5',
              radius: searchRadius * 1000
            });
            circle.addTo(map);

          }

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
  }, [isOpen, ads, userLocation, searchRadius, resolvedTheme, onMapReady]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="fixed inset-0 bg-white dark:bg-gray-900 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Search between existing buttons */}
        {onLocationSelect && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[10000]">
            <div className="w-48">
              <MapSearch onLocationSelect={onLocationSelect} />
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="absolute top-4 right-4 z-[10000]">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            title="بازگشت"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>


        <div className="relative w-full h-full">
          <div id="all-ads-map-container" className="w-full h-full"></div>
          
          {!isMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">در حال بارگذاری نقشه...</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">لطفاً صبر کنید</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
