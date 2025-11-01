"use client";

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '@/lib/auth-client';
import BottomNav from '@/app/components/BottomNav';
import AdCard from '@/app/components/AdCard/AdCard';
import AdFormModal from '@/app/components/AdFormModal/AdFormModal';
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

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: shopId } = use(params);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopImages, setShopImages] = useState<ShopImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userAds, setUserAds] = useState<any[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [isAdFormOpen, setIsAdFormOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isAdDetailOpen, setIsAdDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!shopId) return;
    fetchShopData();
  }, [shopId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const fetchShopData = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}`);
      if (!response.ok) throw new Error('Failed to fetch shop data');

      const data = await response.json();
      if (data.success && data.shop) {
        setShop(data.shop);
        
        // Check if current user is the owner
        const user = getUser();
        if (user && data.shop.user_id === user.id) {
          setIsOwner(true);
        }

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
    if (!shop || !shop.user_id) {
      console.log('⚠️ No shop or user_id found, skipping ad load');
      return;
    }
    
    try {
      setIsLoadingAds(true);
      console.log('🔍 Loading ads for shop owner:', shop.user_id);
      
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
    }
  }, [shop, shop?.user_id]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 4000);
  };

  const deleteAd = async (adId: string) => {
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
      showSuccess('آگهی با موفقیت حذف شد');
      
      if (isAdDetailOpen) {
        setIsAdDetailOpen(false);
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      showError('خطا در حذف آگهی');
    }
  };

  const handleAdSubmit = async (formData: any) => {
    const user = getUser();
    if (!user) {
      alert('لطفاً ابتدا وارد شوید');
      return;
    }

    try {
      // Convert images to base64
      const imagePromises = formData.images.map((img: File) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(img);
        });
      });
      
      const imageBase64 = await Promise.all(imagePromises);

      // Submit to API
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.username,
          shop_id: shop?.id || null,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          condition: formData.condition,
          latitude: formData.latitude,
          longitude: formData.longitude,
          address: formData.address || formData.location,
          images: imageBase64
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create ad');
      }

      console.log('✅ Ad created successfully');
      
      // Close form
      setIsAdFormOpen(false);
      
      // Reload ads
      loadUserAds();
      showSuccess('آگهی با موفقیت ایجاد شد');
    } catch (error) {
      console.error('Error creating ad:', error);
      showError('خطا در ثبت آگهی');
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
        
        {/* Settings Button - Top Left Corner */}
        {isOwner && (
          <Link
            href={`/shop/${shop.id}/edit`}
            className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543-.94-3.31.826-2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 001.066 2.573c.94 1.543-.826 3.31-2.37 2.37-.996.608-2.296.07-2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        )}
        
        {/* Shop Name - Top Right Corner */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <h1 className="text-xl font-bold text-white">{shop.shop_name}</h1>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 text-white ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 text-gray-700 dark:text-gray-300 text-right text-sm border-b border-gray-200 dark:border-gray-700">
                  {shop.shop_name}
                </div>
                <button className="w-full px-4 py-3 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-right text-sm font-medium">
                  ایجاد اکانت جدید
                </button>
              </div>
            )}
          </div>
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
                    <p className="text-white text-sm font-semibold">1.2K</p>
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
              <div className="flex items-center gap-4 text-sm">
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
          {isOwner && (
            <button
              onClick={() => setIsAdFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>ایجاد آگهی جدید</span>
            </button>
          )}
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
                  if (isOwner) {
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
                  } else {
                    window.location.href = `/ad/${ad.id}`;
                  }
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

      {/* Ad Creation Modal */}
      <AdFormModal
        isOpen={isAdFormOpen}
        onClose={() => setIsAdFormOpen(false)}
        onSubmit={handleAdSubmit}
      />

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-[300] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-right">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-[300] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-right">
          {errorMessage}
        </div>
      )}

      {/* Ad Detail Modal - Full Screen */}
      {isAdDetailOpen && selectedAd && isOwner && (
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
                        } else {
                          showError('خطا در بروزرسانی آگهی');
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

      {/* Hide BottomNav when form is open */}
      {!isAdFormOpen && !isAdDetailOpen && <BottomNav />}
    </div>
  );
}
