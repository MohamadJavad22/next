"use client";

import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* کارت اصلی */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 border border-gray-200 dark:border-gray-700 text-center">
          {/* آیکون */}
          <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          {/* عنوان */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            پنل مدیریت
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
            دسترسی به بخش مدیریت سیستم
          </p>

          {/* پیام هشدار */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3 space-x-reverse text-right">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                  این بخش فقط برای مدیران سیستم است
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  برای ورود باید حساب مدیر داشته باشید
                </p>
              </div>
            </div>
          </div>

          {/* دکمه ورود */}
          <Link
            href="/admin"
            className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 mb-6"
          >
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>ورود به پنل مدیریت</span>
            </div>
          </Link>

          {/* جداکننده */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                یا
              </span>
            </div>
          </div>

          {/* لینک ورود کاربران */}
          <Link
            href="/login"
            className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            کاربر عادی هستید؟ از اینجا وارد شوید
          </Link>
        </div>

        {/* اطلاعات تماس */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            برای دریافت دسترسی مدیریت با پشتیبانی تماس بگیرید
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-1 space-x-reverse text-sm text-gray-700 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>

        {/* نکات امنیتی */}
        <div className="mt-8 bg-blue-100 dark:bg-gray-800/50 border border-blue-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-right">
              <p className="text-xs text-gray-900 dark:text-gray-300 font-medium mb-1">نکته امنیتی</p>
              <p className="text-xs text-gray-700 dark:text-gray-400">
                هرگز اطلاعات ورود خود را با دیگران به اشتراک نگذارید
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
