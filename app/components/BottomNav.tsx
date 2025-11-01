"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserShop } from '@/app/hooks/useUserShop';

export default function BottomNav() {
  const pathname = usePathname();
  const { userShop, loading } = useUserShop();

  // تعریف آیتم‌های پایه نوار پایین
  const baseNavItems = [
    {
      id: 'home',
      label: 'خانه',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/'
    },
    {
      id: 'chat',
      label: 'چت',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      href: '/chat'
    }
  ];

  // اگر کاربر فروشگاه دارد، آیکون فروشگاه را نشان بده
  const shopNavItem = userShop ? {
    id: 'my-shop',
    label: userShop.shop_name,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    href: `/shop/${userShop.id}`
  } : {
    id: 'create-shop',
    label: 'ایجاد فروشگاه',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    href: '/shop'
  };

  // اگر کاربر فروشگاه ندارد، آیکون پروفایل معمولی را نشان بده
  const profileNavItem = userShop ? null : {
    id: 'profile',
    label: 'پروفایل',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    href: '/profile'
  };

  // ترکیب آیتم‌های نوار پایین
  const navItems = [
    ...baseNavItems,
    shopNavItem,
    ...(profileNavItem ? [profileNavItem] : [])
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-50">
      <div className="h-16 flex items-center justify-center px-4 max-w-md mx-auto">
        {/* Navigation Items */}
        <div className="flex items-center justify-around w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href.includes('/shop/') && pathname?.includes('/shop/'));
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
                
                <div className={`w-5 h-5 flex items-center justify-center transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}>
                  {item.icon}
                </div>
                
                <span className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
