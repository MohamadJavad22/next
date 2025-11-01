'use client';

import { useState, useEffect } from 'react';
import { getUser, isAuthenticated } from '@/lib/auth-client';

interface Shop {
  id: number;
  shop_name: string;
  status: string;
}

export function useUserShop() {
  const [userShop, setUserShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserShop = async () => {
      if (!isAuthenticated()) {
        setUserShop(null);
        setLoading(false);
        return;
      }

      try {
        const user = getUser();
        if (!user) {
          setUserShop(null);
          setLoading(false);
          return;
        }

        // بررسی وجود فروشگاه برای کاربر
        const response = await fetch(`/api/shops?user_id=${user.id}`);
        const data = await response.json();

        if (response.ok && data.shops && data.shops.length > 0) {
          // اولین فروشگاه فعال کاربر
          const activeShop = data.shops.find((shop: Shop) => shop.status === 'active');
          setUserShop(activeShop || data.shops[0]);
        } else {
          setUserShop(null);
        }
      } catch (error) {
        console.error('❌ Error checking user shop:', error);
        setUserShop(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserShop();
  }, []);

  return { userShop, loading };
}

