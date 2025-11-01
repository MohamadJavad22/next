"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useContent } from '../context/ContentContext';
import { isAuthenticated, getUser, logout } from '@/lib/auth-client';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onLocationSelect?: (location: { latitude: number; longitude: number; address: string }) => void;
}

export default function Header({ onLocationSelect }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { contents } = useContent();
  const router = useRouter();
  
  const headerContent = contents.find(c => c.type === 'header' && c.isVisible);

  useEffect(() => {
    // چک کردن وضعیت لاگین
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        setUser(getUser());
      }
    };

    checkAuth();
    
    // چک کردن هر بار که صفحه focus می‌شود
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/login');
  };

  // جستجوی منطقه
  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/forward-geocode?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // بستن نتایج با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // انتخاب منطقه
  const handleSelectLocation = (result: any) => {
    if (onLocationSelect && result.lat && result.lon) {
      onLocationSelect({
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name || result.name
      });
      setSearchQuery(result.display_name || result.name);
      setShowResults(false);
    }
  };

  return (
    <header className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40">
      <nav className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">W</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{headerContent?.title || 'وبسایت من'}</h1>
            </div>
          </div>

          {/* Search Box */}
          <div ref={searchRef} className="flex-1 max-w-sm mx-4 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="جستجوی شهر یا منطقه..."
                className="w-full px-4 py-2 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
              <svg 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {isSearching && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto z-50">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(result)}
                    className="w-full px-4 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {result.name || result.display_name}
                        </p>
                        {result.display_name && result.display_name !== result.name && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {result.display_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showResults && searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 text-center z-50">
                <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
                <p className="text-sm text-slate-600 dark:text-slate-400">نتیجه‌ای یافت نشد</p>
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle variant="desktop" />
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
                    {user?.name}
                  </span>
                  <Link 
                    href={user?.role === 'admin' ? '/admin' : '/profile'}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    {user?.role === 'admin' ? 'پنل مدیریت' : 'پروفایل'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors text-sm px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ورود
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-blue-500 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                  >
                    ثبت‌نام
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <ThemeToggle variant="mobile" />
            
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {isLoggedIn ? (
                <>
                  <div className="text-center py-2 text-slate-600 dark:text-slate-400 font-medium text-sm">
                    {user?.name}
                  </div>
                  <Link 
                    href={user?.role === 'admin' ? '/admin' : '/profile'}
                    className="block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center text-sm"
                  >
                    {user?.role === 'admin' ? 'پنل مدیریت' : 'پروفایل من'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors py-2 text-center border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors py-2 text-center border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                  >
                    ورود
                  </Link>
                  <Link 
                    href="/register" 
                    className="block bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center text-sm"
                  >
                    ثبت‌نام
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

