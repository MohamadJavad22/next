"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth-client';

// کامپوننت برای چک کردن authentication
export default function AuthChecker() {
  const router = useRouter();

  useEffect(() => {
    // چک کردن هر 1 دقیقه
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/login');
      }
    };

    // چک اولیه
    checkAuth();

    // چک دوره‌ای
    const interval = setInterval(checkAuth, 60000); // هر 1 دقیقه

    return () => clearInterval(interval);
  }, [router]);

  return null;
}

