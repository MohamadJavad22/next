"use client";

import { useState, useEffect, useCallback } from 'react';

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface UseLocationReturn {
  userLocation: UserLocation | null;
  isGettingLocation: boolean;
  locationError: string | null;
  getCurrentLocation: () => Promise<void>;
  setUserLocation: (location: UserLocation) => void;
}

export function useLocation(): UseLocationReturn {
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        setUserLocationState(JSON.parse(savedLocation));
      } catch (e) {
        console.error('Error parsing saved location:', e);
      }
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('مرورگر شما از Geolocation پشتیبانی نمی‌کند');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates
        try {
          const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const data = await response.json();
          
          const location: UserLocation = {
            latitude,
            longitude,
            address: data.address || 'آدرس نامشخص'
          };
          
          setUserLocationState(location);
          localStorage.setItem('userLocation', JSON.stringify(location));
          localStorage.setItem('hasSeenLocationPrompt', 'true');
          setIsGettingLocation(false);
        } catch (err) {
          const location: UserLocation = { latitude, longitude };
          setUserLocationState(location);
          localStorage.setItem('userLocation', JSON.stringify(location));
          localStorage.setItem('hasSeenLocationPrompt', 'true');
          setIsGettingLocation(false);
        }
      },
      (err) => {
        setLocationError('نتوانستیم به موقعیت شما دسترسی پیدا کنیم');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  const setUserLocation = useCallback((location: UserLocation) => {
    setUserLocationState(location);
    localStorage.setItem('userLocation', JSON.stringify(location));
  }, []);

  return {
    userLocation,
    isGettingLocation,
    locationError,
    getCurrentLocation,
    setUserLocation
  };
}

