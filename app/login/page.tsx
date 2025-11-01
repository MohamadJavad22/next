"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'خطا در ورود');
        setIsLoading(false);
        return;
      }

      // ذخیره توکن و اطلاعات کاربر
      localStorage.setItem('auth-token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('login-time', Date.now().toString());
      
      // هدایت بر اساس نقش
      if (data.user.role === 'admin') {
        alert('ورود موفق! به پنل مدیریت خوش آمدید');
        router.push('/admin');
      } else {
        alert('ورود با موفقیت انجام شد!');
        router.push('/profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('خطا در ارتباط با سرور');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-8 md:px-8 py-6 md:py-8">
      <div className="w-full max-w-xs md:max-w-md">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">ورود</h1>
          <p className="text-xs md:text-base text-gray-500 dark:text-gray-400">به حساب کاربری خود وارد شوید</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-8">
          {/* شماره تماس */}
          <div>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-2 md:py-3 text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 outline-none transition-all"
              placeholder="شماره تماس (09...)"
              dir="ltr"
            />
          </div>

          {/* رمز عبور */}
          <div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-2 md:py-3 text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 outline-none transition-all"
              placeholder="رمز عبور"
            />
          </div>

          {/* دکمه ورود */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2.5 md:py-3 rounded-lg text-sm md:text-base font-bold hover:bg-blue-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-6 md:mt-8"
          >
            {isLoading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        {/* لینک ثبت‌نام */}
        <div className="mt-6 md:mt-8 text-center">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            حساب کاربری ندارید؟{' '}
            <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>

        {/* لینک ورود مدیر */}
        <div className="mt-4 text-center">
          <Link href="/admin/login" className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
            ورود مدیر →
          </Link>
        </div>

        {/* بازگشت به خانه */}
        <div className="mt-4 md:mt-6 text-center">
          <Link href="/" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
            ← بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}

