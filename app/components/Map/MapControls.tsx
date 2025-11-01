"use client";

import { useState } from 'react';

interface MapControlsProps {
  mapInstance: any;
  userLocation: { latitude: number; longitude: number } | null;
  searchRadius: number;
  onSearchRadiusChange: (radius: number) => void;
  onLocationRequest: () => void;
}

export default function MapControls({ 
  mapInstance, 
  userLocation, 
  searchRadius, 
  onSearchRadiusChange, 
  onLocationRequest 
}: MapControlsProps) {
  const [currentZoom, setCurrentZoom] = useState(12);
  const [zoomSpeed, setZoomSpeed] = useState(1);

  if (!mapInstance) return null;

  const handleZoomIn = () => {
    const currentZoomVal = mapInstance.getZoom();
    mapInstance.setZoom(Math.min(20, currentZoomVal + 1));
    setCurrentZoom(mapInstance.getZoom());
  };

  const handleZoomOut = () => {
    const currentZoomVal = mapInstance.getZoom();
    mapInstance.setZoom(Math.max(6, currentZoomVal - 1));
    setCurrentZoom(mapInstance.getZoom());
  };

  const handleLocationClick = () => {
    if (userLocation) {
      mapInstance.setView([userLocation.latitude, userLocation.longitude], 15);
    } else {
      onLocationRequest();
    }
  };

  const handleSearchRadiusClick = () => {
    const newRadius = prompt(`شعاع جستجو فعلی: ${searchRadius} کیلومتر\nشعاع جدید را وارد کنید (1-50):`, searchRadius.toString());
    if (newRadius) {
      const radius = parseInt(newRadius);
      if (radius >= 1 && radius <= 50) {
        onSearchRadiusChange(radius);
      } else {
        alert('لطفاً عددی بین 1 تا 50 وارد کنید');
      }
    }
  };

  return (
    <div className="absolute top-20 sm:top-24 right-2 sm:right-4 z-[10000]">
      <div className="flex flex-col gap-0.5 sm:gap-1">
        {/* Location Button */}
        <button
          onClick={handleLocationClick}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border sm:border-2 border-blue-400 text-blue-500 shadow-md hover:shadow-lg hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 flex items-center justify-center"
          title="موقعیت مکانی"
        >
          <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2}/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
          </svg>
        </button>

        {/* Search Radius Button */}
        {userLocation && (
          <button
            onClick={handleSearchRadiusClick}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border sm:border-2 border-blue-400 text-blue-500 shadow-md hover:shadow-lg hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 flex items-center justify-center relative"
            title="شعاع جستجو"
          >
            <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2}/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
            </svg>
            <span className="absolute bottom-0 right-0 text-[6px] sm:text-[7px] font-bold bg-blue-500 text-white rounded-full w-2 h-2 sm:w-2.5 sm:h-2.5 flex items-center justify-center">{searchRadius}</span>
          </button>
        )}

        {/* Zoom Level Display */}
        <div className="w-6 h-4 sm:w-8 sm:h-5 rounded bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border sm:border-2 border-blue-400 flex items-center justify-center">
          <span className="text-blue-500 font-bold text-[8px] sm:text-[10px]">
            {Math.round(currentZoom * 10) / 10}x
          </span>
        </div>
        
      </div>
    </div>
  );
}
