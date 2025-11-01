"use client";

import { useState, useCallback, useMemo } from 'react';

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

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface UseMapReturn {
  filteredAds: (Ad & { distance?: number })[];
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

export function useMap(ads: Ad[], userLocation: UserLocation | null, searchRadius: number): UseMapReturn {
  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Filter ads based on user location
  const filteredAds = useMemo(() => {
    if (!userLocation) return ads;
    
    return ads.filter(ad => {
      if (!ad.latitude || !ad.longitude) return false;
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        ad.latitude,
        ad.longitude
      );
      return distance <= searchRadius;
    }).map(ad => ({
      ...ad,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        ad.latitude,
        ad.longitude
      )
    })).sort((a: any, b: any) => a.distance - b.distance);
  }, [ads, userLocation, searchRadius, calculateDistance]);

  return {
    filteredAds,
    calculateDistance
  };
}

