"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface MapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  forceFullHeight?: boolean;
}

export default function MapDrawer({ isOpen, onClose, children, title = "کنترل‌های نقشه", forceFullHeight = false }: MapDrawerProps) {
  const { resolvedTheme } = useTheme();
  const [drawerHeight, setDrawerHeight] = useState(120); // ارتفاع اولیه (نیمه باز)
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const minHeight = 80; // حداقل ارتفاع
  const maxHeight = window.innerHeight * 0.8; // حداکثر ارتفاع (80% صفحه)
  const snapThreshold = 50; // آستانه snap

  // تنظیم ارتفاع اولیه
  useEffect(() => {
    if (isOpen) {
      if (forceFullHeight) {
        setDrawerHeight(maxHeight);
      } else {
        setDrawerHeight(120);
      }
    }
  }, [isOpen, forceFullHeight, maxHeight]);

  // صفر کردن اسکرول بار وقتی پرده بسته است
  useEffect(() => {
    if (!isOpen && drawerRef.current) {
      const scrollContainer = drawerRef.current.querySelector('.h-full.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [isOpen]);

  // مدیریت drag شروع
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartHeight(drawerHeight);
  }, [drawerHeight]);

  // مدیریت drag حرکت
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - clientY; // معکوس برای کشیدن به بالا
    const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
    
    setDrawerHeight(newHeight);
  }, [isDragging, startY, startHeight, minHeight, maxHeight]);

  // مدیریت drag پایان
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Snap logic
    if (drawerHeight < minHeight + snapThreshold) {
      setDrawerHeight(minHeight);
    } else if (drawerHeight > maxHeight - snapThreshold) {
      setDrawerHeight(maxHeight);
    } else if (drawerHeight < 200) {
      setDrawerHeight(120); // نیمه باز
    } else {
      setDrawerHeight(maxHeight); // کاملاً باز
    }
  }, [isDragging, drawerHeight, minHeight, maxHeight, snapThreshold]);

  // Event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // بستن drawer با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        if (drawerHeight <= minHeight + 20) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, drawerHeight, minHeight, onClose]);

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-[99999] pointer-events-none">
      {/* Backdrop - Disabled */}
      {/* <div 
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          drawerHeight > minHeight + 50 ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onClick={onClose}
      /> */}
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`map-drawer absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-out pointer-events-auto flex flex-col ${
          isDragging ? 'transition-none' : ''
        }`}
        style={{
          height: `${drawerHeight}px`,
          maxHeight: `${maxHeight}px`,
        }}
      >
        {/* Drag Handle - Minimal */}
        <div
          ref={dragHandleRef}
          className="drawer-handle flex items-center justify-center py-2 px-4 cursor-grab active:cursor-grabbing select-none hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 rounded-t-3xl"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* Handle Bar */}
          <div className="w-12 h-1.5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full shadow-sm"></div>
        </div>


        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-3 sm:space-y-6">
              {children}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
