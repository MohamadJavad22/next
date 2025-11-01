"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth-client';

// کامپوننت برای چک کردن دسترسی ادمین
export default function AdminAuthChecker() {
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = () => {
      // بررسی authentication
      if (!isAuthenticated()) {
        alert('لطفاً ابتدا وارد شوید');
        router.push('/login');
        return;
      }

      // بررسی نقش کاربر
      const user = getUser();
      if (!user || user.role !== 'admin') {
        alert('شما به این بخش دسترسی ندارید');
        router.push('/profile'); // هدایت به پروفایل کاربر عادی
        return;
      }
    };

    // چک اولیه
    checkAdminAuth();

    // چک دوره‌ای (هر 1 دقیقه)
    const interval = setInterval(checkAdminAuth, 60000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}

