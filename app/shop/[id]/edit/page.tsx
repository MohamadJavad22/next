"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '@/lib/auth-client';
import BottomNav from '@/app/components/BottomNav';

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

export default function EditShopPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: shopId } = use(params);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopImages, setShopImages] = useState<ShopImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  const [editForm, setEditForm] = useState({
    shop_name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    services: '',
    specialties: '',
    working_days_start: 'شنبه',
    working_days_end: 'چهارشنبه',
    working_hours_start: '08:00',
    working_hours_end: '18:00',
    friday_working: false,
    friday_start: '08:00',
    friday_end: '18:00',
  });

  const categories = [
    'تعمیرگاه',
    'فروشگاه الکترونیک',
    'فروشگاه مواد غذایی',
    'فروشگاه پوشاک',
    'فروشگاه داروخانه',
    'رستوران',
    'کافه',
    'سالن زیبایی',
    'فروشگاه کتاب',
    'فروشگاه ورزشی',
    'سایر'
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!shopId) return;
    fetchShopData();
  }, [shopId, router]);

  const fetchShopData = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}`);
      if (!response.ok) throw new Error('Failed to fetch shop data');

      const data = await response.json();
      if (data.success && data.shop) {
        setShop(data.shop);
        
        // Check if user is the owner
        const user = getUser();
        if (user && data.shop.user_id !== user.id) {
          router.push(`/shop/${shopId}`);
          return;
        }

        setEditForm({
          shop_name: data.shop.shop_name || '',
          description: data.shop.description || '',
          category: data.shop.category || '',
          phone: data.shop.phone || '',
          email: data.shop.email || '',
          website: data.shop.website || '',
          address: data.shop.address || '',
          city: data.shop.city || '',
          province: data.shop.province || '',
          postal_code: data.shop.postal_code || '',
          services: data.shop.services || '',
          specialties: data.shop.specialties || '',
          working_days_start: 'شنبه',
          working_days_end: 'چهارشنبه',
          working_hours_start: '08:00',
          working_hours_end: '18:00',
          friday_working: false,
          friday_start: '08:00',
          friday_end: '18:00',
        });

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
          const primaryImage = data.images.find((img: ShopImage) => img.is_primary === 1);
          if (primaryImage) {
            setProfileImagePreview(primaryImage.image_url);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching shop images:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedProfileImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!shop) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('shopName', editForm.shop_name);
      formData.append('description', editForm.description);
      formData.append('category', editForm.category);
      formData.append('phone', editForm.phone);
      formData.append('email', editForm.email);
      formData.append('website', editForm.website);
      formData.append('address', editForm.address);
      formData.append('city', editForm.city);
      formData.append('province', editForm.province);
      formData.append('postalCode', editForm.postal_code);
      formData.append('services', editForm.services);
      formData.append('specialties', editForm.specialties);
      formData.append('workingHours', JSON.stringify([]));
      formData.append('socialMedia', JSON.stringify({}));
      formData.append('latitude', shop.latitude.toString());
      formData.append('longitude', shop.longitude.toString());

      if (selectedProfileImage) {
        formData.append('profileImage', selectedProfileImage);
      }

      const response = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        alert('اطلاعات با موفقیت به‌روزرسانی شد');
        router.push(`/shop/${shop.id}`);
      } else {
        alert('خطا در به‌روزرسانی اطلاعات');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      alert('خطا در به‌روزرسانی اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">فروشگاهی یافت نشد</p>
          <button onClick={() => router.back()} className="btn-primary">
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold">ویرایش فروشگاه</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-4">
                 {/* Profile Image */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             تصویر پروفایل
           </h3>
           <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
             <div className="flex items-center gap-6">
               {profileImagePreview && (
                 <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-700 shadow-lg flex-shrink-0">
                   <img
                     src={profileImagePreview}
                     alt={shop.shop_name}
                     className="w-full h-full object-cover"
                   />
                 </div>
               )}
               <div className="flex-1">
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">تصویر پروفایل فروشگاه شما</p>
                 <label className="px-6 py-3 rounded-lg bg-primary text-white cursor-pointer hover:bg-primary/90 inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                   </svg>
                   تغییر تصویر
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleProfileImageChange}
                     className="hidden"
                   />
                 </label>
               </div>
             </div>
           </div>
         </div>

                 {/* Basic Info */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             اطلاعات اصلی
           </h3>
           <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نام فروشگاه <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.shop_name}
                onChange={(e) => handleInputChange('shop_name', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="نام فروشگاه"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                دسته‌بندی <span className="text-red-500">*</span>
              </label>
              <select
                value={editForm.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">انتخاب کنید</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                توضیحات <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="توضیحات فروشگاه"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            اطلاعات تماس
          </h3>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تلفن</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="09123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ایمیل</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="info@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وب‌سایت</label>
              <input
                type="url"
                value={editForm.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

         {/* Location */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            موقعیت
          </h3>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">آدرس</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="آدرس کامل"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">شهر</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="شهر"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">استان</label>
                <input
                  type="text"
                  value={editForm.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="استان"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">کد پستی</label>
              <input
                type="text"
                value={editForm.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="1234567890"
              />
            </div>
          </div>
        </div>

                                   {/* Working Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ساعات کاری
            </h3>
            <div className="space-y-5">
              {/* Days Range */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  بازه روزهای کاری
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">از روز</label>
                    <select
                      value={editForm.working_days_start}
                      onChange={(e) => handleInputChange('working_days_start', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm font-medium"
                    >
                      <option value="شنبه">شنبه</option>
                      <option value="یکشنبه">یکشنبه</option>
                      <option value="دوشنبه">دوشنبه</option>
                      <option value="سه‌شنبه">سه‌شنبه</option>
                      <option value="چهارشنبه">چهارشنبه</option>
                    </select>
                  </div>
                  <div className="pt-5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">تا روز</label>
                    <select
                      value={editForm.working_days_end}
                      onChange={(e) => handleInputChange('working_days_end', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm font-medium"
                    >
                      <option value="شنبه">شنبه</option>
                      <option value="یکشنبه">یکشنبه</option>
                      <option value="دوشنبه">دوشنبه</option>
                      <option value="سه‌شنبه">سه‌شنبه</option>
                      <option value="چهارشنبه">چهارشنبه</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  ساعات کاری
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      شروع
                    </label>
                    <input
                      type="time"
                      value={editForm.working_hours_start}
                      onChange={(e) => handleInputChange('working_hours_start', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      پایان
                    </label>
                    <input
                      type="time"
                      value={editForm.working_hours_end}
                      onChange={(e) => handleInputChange('working_hours_end', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Friday Settings */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="friday_working"
                    checked={editForm.friday_working}
                    onChange={(e) => handleInputChange('friday_working', e.target.checked)}
                    className="w-6 h-6 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="friday_working" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    ساعات کاری پنج‌شنبه متفاوت است
                  </label>
                </div>
                {editForm.friday_working && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mt-3 border border-yellow-200 dark:border-yellow-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">شروع پنج‌شنبه</label>
                        <input
                          type="time"
                          value={editForm.friday_start}
                          onChange={(e) => handleInputChange('friday_start', e.target.value)}
                          className="w-full rounded-lg border border-yellow-300 dark:border-yellow-700 px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">پایان پنج‌شنبه</label>
                        <input
                          type="time"
                          value={editForm.friday_end}
                          onChange={(e) => handleInputChange('friday_end', e.target.value)}
                          className="w-full rounded-lg border border-yellow-300 dark:border-yellow-700 px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

         {/* Services */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
             خدمات و تخصص‌ها
           </h3>
           <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">خدمات</label>
              <textarea
                value={editForm.services}
                onChange={(e) => handleInputChange('services', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="خدمات ارائه شده"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تخصص‌ها</label>
              <textarea
                value={editForm.specialties}
                onChange={(e) => handleInputChange('specialties', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="تخصص‌های فروشگاه"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            آمار
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
            <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{shop.views}</div>
              <div className="text-sm text-gray-500">بازدید</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{shop.rating > 0 ? shop.rating.toFixed(1) : 'جدید'}</div>
              <div className="text-sm text-gray-500">امتیاز</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{shopImages.length}</div>
              <div className="text-sm text-gray-500">تصویر</div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
