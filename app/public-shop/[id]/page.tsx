"use client";

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth-client';
import BottomNav from '@/app/components/BottomNav';
import AdCard from '@/app/components/AdCard/AdCard';
import Link from 'next/link';

interface ShopImage {
  id: number;
  image_url: string;
  image_alt?: string;
  is_primary: number;
  sort_order: number;
}

interface Shop {
  id: number;
  shop_name: string;
  description: string;
  category: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  services?: string;
  specialties?: string;
  status: string;
  is_verified: number;
  views: number;
  rating: number;
  review_count: number;
  created_at: string;
  user_id: number;
}

export default function PublicShopPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: shopId } = use(params);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopImages, setShopImages] = useState<ShopImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAds, setUserAds] = useState<any[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (!shopId) return;
    fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shops/${shopId}`);
      if (!response.ok) throw new Error('Failed to fetch shop data');

      const data = await response.json();
      if (data.success && data.shop) {
        setShop(data.shop);
        fetchShopImages(data.shop.id);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopImages = async (shopId: number) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/images`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.images) {
          setShopImages(data.images);
        }
      }
    } catch (error) {
      console.error('Error fetching shop images:', error);
    }
  };

  const loadUserAds = async () => {
    if (!shop || !shop.id) {
      console.log('⚠️ No shop or shop_id found, skipping ad load');
      return;
    }
    
    try {
      setIsLoadingAds(true);
      console.log('🔍 Loading ads for shop:', shop.id);
      
      const response = await fetch(`/api/ads?shop_id=${shop.id}`);
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to load ads: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw API data:', data);
      
      const ads = Array.isArray(data) ? data : [];
      console.log('✅ Processed ads:', ads);
      console.log('✅ Ads count:', ads.length);
      
      setUserAds(ads);
    } catch (error) {
      console.error('Error loading ads:', error);
      setUserAds([]);
    } finally {
      setIsLoadingAds(false);
    }
  };

  // Load ads when shop data is available
  useEffect(() => {
    if (shop && shop.user_id) {
      loadUserAds();
      checkFollowStatus();
    }
  }, [shop, shop?.user_id]);

  const checkFollowStatus = async () => {
    try {
      const user = getUser();
      if (!user || !shop) return;

      const response = await fetch(`/api/shops/${shop.id}/follow-status`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing || false);
        setFollowersCount(data.followersCount || 0);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const user = getUser();
      if (!user) {
        alert('لطفاً ابتدا وارد شوید');
        return;
      }

      const response = await fetch(`/api/shops/${shop?.id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(!isFollowing);
        setFollowersCount(data.followersCount || followersCount + (isFollowing ? -1 : 1));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">فروشگاهی یافت نشد</p>
          <Link href="/" className="btn-primary inline-block">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = shopImages.find(img => img.is_primary === 1) || shopImages[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div 
        className="bg-white dark:bg-gray-800 shadow-sm relative min-h-[10rem] bg-cover bg-center bg-no-repeat"
        style={primaryImage ? { backgroundImage: `url(${primaryImage.image_url})` } : {}}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
        
        {/* Shop Name - Top Right Corner */}
        <div className="absolute top-4 right-4 z-10">
          <h1 className="text-xl font-bold text-white">{shop.shop_name}</h1>
        </div>
      </div>

      {/* Shop Header */}
      <div className="bg-blue-600 text-white relative pb-8">
        <div className="container mx-auto px-4 pt-12 pb-4">
          <div className="flex items-start gap-4">
            {primaryImage && (
              <div className="absolute -top-12 right-8 z-20 flex items-center gap-6">
                {/* Avatar Image */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src={primaryImage.image_url}
                    alt={shop.shop_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Followers Stats */}
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold">{followersCount > 0 ? followersCount.toLocaleString('fa-IR') : '0'}</p>
                    <p className="text-white/80 text-xs">دنبال‌کننده</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold">450</p>
                    <p className="text-white/80 text-xs">دنبال‌شونده</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {shop.is_verified === 1 && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    ✓ تأیید شده
                  </span>
                )}
              </div>
              <p className="text-white/90 mb-2">{shop.category}</p>
              <div className="flex items-center gap-4 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span>{shop.rating > 0 ? shop.rating.toFixed(1) : 'جدید'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{shop.views} بازدید</span>
                </div>
              </div>
              {/* Follow Button */}
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {isFollowing ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    دنبال می‌کنید
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    دنبال کردن
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Gradient Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
      </div>

      {/* User Ads Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            آگهی‌های این فروشگاه
          </h2>
        </div>

        {isLoadingAds ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : userAds.length > 0 ? (
          <div className="space-y-4">
            {userAds.map((ad) => (
              <div 
                key={ad.id} 
                onClick={() => {
                  window.location.href = `/ad/${ad.id}`;
                }}
              >
                <AdCard
                  ad={ad}
                  userLocation={null}
                  onAdClick={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg">این فروشگاه هنوز آگهی ثبت نکرده است</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
