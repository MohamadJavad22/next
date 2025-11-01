"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface MapSearchProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
}

export default function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
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
      console.error('Map search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

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
  }, [searchQuery, handleSearch]);

  // Handle location selection
  const handleLocationSelect = useCallback((result: any) => {
    const location = {
      latitude: result.lat,
      longitude: result.lon,
      address: result.name || result.display_name
    };
    onLocationSelect(location);
    setShowResults(false);
    setSearchQuery('');
  }, [onLocationSelect]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="flex-1 relative max-w-xs">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder="جستجو..."
          className="w-full px-3 py-2 pr-8 text-sm rounded-full border-0 bg-gray-600 hover:bg-gray-500 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-lg"
        />
        <svg 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-300"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {isSearching && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto z-[10000]">
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => handleLocationSelect(result)}
              className="w-full px-2 py-1.5 text-right hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-start gap-1.5">
                <svg className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <div className="flex-1 text-right">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {result.name || result.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 text-center z-[1100]">
          <p className="text-xs text-gray-600 dark:text-gray-400">نتیجه‌ای یافت نشد</p>
        </div>
      )}
    </div>
  );
}
