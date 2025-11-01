"use client";

import { memo } from 'react';

interface Story {
  id: number;
  name: string;
  hasStory: boolean;
}

const StoriesSection = memo(function StoriesSection() {
  const stories: Story[] = [
    { id: 1, name: 'علی محمدی', hasStory: true },
    { id: 2, name: 'رضا کریمی', hasStory: true },
    { id: 3, name: 'مریم احمدی', hasStory: true },
    { id: 4, name: 'حسین رضایی', hasStory: true },
    { id: 5, name: 'فاطمه حسینی', hasStory: false },
    { id: 6, name: 'محمد اکبری', hasStory: false },
    { id: 7, name: 'زهرا موسوی', hasStory: false },
  ];

  return (
    <div className="mb-6 overflow-hidden">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Create Ad Story */}
        <div className="flex-shrink-0">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-800 p-0.5 transition-all duration-300 group-hover:scale-105 group-active:scale-95" style={{ clipPath: 'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)' }}>
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden" style={{ clipPath: 'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)' }}>
              </div>
            </div>
            <p className="text-xs text-center mt-1.5 font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
              ایجاد آگهی
            </p>
          </div>
        </div>

        {/* User Stories */}
        {stories.map((user) => (
          <div key={user.id} className="flex-shrink-0">
            <div className="relative group cursor-pointer">
              {user.hasStory ? (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-800 p-0.5 transition-all duration-300 group-hover:scale-105 group-active:scale-95" style={{ clipPath: 'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)' }}>
                  <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)' }}>
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95 border-2 border-gray-300 dark:border-gray-700" style={{ clipPath: 'polygon(50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%)' }}>
                </div>
              )}
              <p className="text-xs text-center mt-1.5 font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
                {user.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default StoriesSection;

