"use client";

import { useState, useEffect, useCallback } from 'react';

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

interface UseAdsReturn {
  ads: Ad[];
  isLoading: boolean;
  error: string | null;
  fetchAds: () => Promise<void>;
  retry: () => void;
}

export function useAds(): UseAdsReturn {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ads', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        if (retryCount < 2) {
          setTimeout(() => fetchAds(retryCount + 1), 1000);
          return;
        }
        throw new Error(`خطا در دریافت آگهی‌ها (${response.status})`);
      }
      
      const data = await response.json();
      const adsArray = Array.isArray(data) ? data : [];
      setAds(adsArray);
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    fetchAds();
  }, [fetchAds]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return {
    ads,
    isLoading,
    error,
    fetchAds,
    retry
  };
}

