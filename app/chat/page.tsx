"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
  typing?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // داده‌های نمونه برای چت‌ها
  const [chats] = useState<Chat[]>([
    {
      id: 1,
      name: 'علی محمدی',
      avatar: '🚗',
      lastMessage: 'سلام، ماشین هنوز موجوده؟',
      timestamp: '10:30',
      unreadCount: 3,
      online: true,
      typing: false,
    },
    {
      id: 2,
      name: 'مریم احمدی',
      avatar: '🏪',
      lastMessage: 'ممنون از پاسخگویی شما',
      timestamp: 'دیروز',
      unreadCount: 0,
      online: false,
    },
    {
      id: 3,
      name: 'رضا کریمی',
      avatar: '🔧',
      lastMessage: 'قیمت قطعی چقدره؟',
      timestamp: 'دیروز',
      unreadCount: 1,
      online: true,
    },
    {
      id: 4,
      name: 'فاطمه حسینی',
      avatar: '💼',
      lastMessage: 'عکس بیشتر دارید؟',
      timestamp: '2 روز پیش',
      unreadCount: 0,
      online: false,
    },
    {
      id: 5,
      name: 'حسین رضایی',
      avatar: '🏬',
      lastMessage: 'کجا می‌تونم ببینمش؟',
      timestamp: '3 روز پیش',
      unreadCount: 5,
      online: true,
      typing: true,
    },
    {
      id: 6,
      name: 'زهرا موسوی',
      avatar: '🎨',
      lastMessage: 'رنگ‌های دیگه هم دارید؟',
      timestamp: '4 روز پیش',
      unreadCount: 0,
      online: false,
    },
    {
      id: 7,
      name: 'محمد اکبری',
      avatar: '⚡',
      lastMessage: 'آماده معاوضه هستید؟',
      timestamp: '5 روز پیش',
      unreadCount: 2,
      online: true,
    },
  ]);

  // پیام‌های نمونه برای چت انتخاب شده
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'سلام، وضعیت ماشین خوبه؟',
      sender: 'other',
      timestamp: '10:25',
      read: true,
    },
    {
      id: 2,
      text: 'سلام! بله عالیه. همه چیزش سالمه و سرویس به روزه',
      sender: 'me',
      timestamp: '10:26',
      read: true,
    },
    {
      id: 3,
      text: 'کیلومتر واقعیه؟',
      sender: 'other',
      timestamp: '10:28',
      read: true,
    },
    {
      id: 4,
      text: 'بله کاملاً، سند و مدارک هم کامله',
      sender: 'me',
      timestamp: '10:29',
      read: true,
    },
    {
      id: 5,
      text: 'سلام، ماشین هنوز موجوده؟',
      sender: 'other',
      timestamp: '10:30',
      read: false,
    },
  ]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: messageInput,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
      
      {/* لیست چت‌ها */}
      {!selectedChat ? (
        <div className="h-full flex flex-col">
          {/* هدر */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10">
            <div className="px-3 py-2 flex items-center gap-2">
              {/* دکمه خروج - سمت چپ */}
              <button 
                onClick={() => router.push('/')}
                className="w-9 h-9 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* نوار جستجو */}
              <div className="relative flex-1">
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-3 pr-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                />
              </div>

              {/* دکمه تنظیمات - سمت راست */}
              <button className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-95 transition-all flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* لیست */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
            {filteredChats.map((chat, index) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                style={{ animationDelay: `${index * 30}ms` }}
                className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-[0.98] transition-all cursor-pointer animate-fade-in"
              >
                {/* آواتار */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-lg">
                    {chat.avatar}
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  )}
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">{chat.unreadCount}</span>
                    </div>
                  )}
                </div>

                {/* محتوا */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <h3 className={`text-sm font-bold truncate ${chat.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {chat.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 mr-2 flex-shrink-0">
                      {chat.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {chat.typing ? (
                      <div className="flex items-center gap-1 text-indigo-500">
                        <span className="text-[11px] font-medium">در حال نوشتن</span>
                        <div className="flex gap-0.5">
                          <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredChats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-6xl mb-3">💬</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">نتیجه‌ای یافت نشد</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">جستجوی دیگری امتحان کنید</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* صفحه چت */
        <div className="h-full flex flex-col">
          {/* هدر چت */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 px-3 py-2 flex items-center gap-2">
            <button
              onClick={() => setSelectedChat(null)}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-base">
                {selectedChat.avatar}
              </div>
              {selectedChat.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate leading-tight">
                {selectedChat.name}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {selectedChat.online ? 'آنلاین' : 'آفلاین'}
              </p>
            </div>

            <button className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-95 transition-transform flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>

          {/* پیام‌ها */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
            {/* بک‌گراند ثابت */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 -z-10"></div>
            
            {/* بک‌گراند مینیمال */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
              <svg className="w-full h-full opacity-[0.04] dark:opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="chat-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                    {/* پیچ شش گوش */}
                    <g transform="translate(20, 20)">
                      <polygon points="8,0 16,4.6 16,13.8 8,18.4 0,13.8 0,4.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="8" cy="9.2" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" />
                      <line x1="8" y1="6.2" x2="8" y2="12.2" stroke="currentColor" strokeWidth="0.6" />
                      <line x1="5" y1="9.2" x2="11" y2="9.2" stroke="currentColor" strokeWidth="0.6" />
                    </g>
                    
                    {/* آچار */}
                    <g transform="translate(75, 15) rotate(45 8 12)">
                      <rect x="6" y="0" width="4" height="20" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
                      <path d="M 4,18 L 4,22 L 12,22 L 12,18" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <circle cx="8" cy="20" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    </g>
                    
                    {/* چرخ/تایر */}
                    <g transform="translate(90, 75)">
                      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="10" y1="1" x2="10" y2="5" stroke="currentColor" strokeWidth="0.8" />
                      <line x1="10" y1="15" x2="10" y2="19" stroke="currentColor" strokeWidth="0.8" />
                      <line x1="1" y1="10" x2="5" y2="10" stroke="currentColor" strokeWidth="0.8" />
                      <line x1="15" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="0.8" />
                    </g>
                    
                    {/* ماشین مینیمال */}
                    <g transform="translate(15, 70)">
                      <path d="M 2,10 L 5,6 L 12,6 L 15,10 L 18,10 L 18,14 L 2,14 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                      <circle cx="6" cy="14" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
                      <circle cx="14" cy="14" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="7" y1="6" x2="7" y2="10" stroke="currentColor" strokeWidth="0.6" />
                    </g>
                    
                    {/* پیچ گوشتی */}
                    <g transform="translate(55, 50) rotate(-30 6 12)">
                      <rect x="4.5" y="0" width="3" height="16" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
                      <rect x="3" y="16" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="5" y1="18" x2="7" y2="22" stroke="currentColor" strokeWidth="0.6" />
                      <line x1="7" y1="18" x2="5" y2="22" stroke="currentColor" strokeWidth="0.6" />
                    </g>
                    
                    {/* مهره */}
                    <g transform="translate(45, 90)">
                      <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <polygon points="7,2 10,4.5 10,9.5 7,12 4,9.5 4,4.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    </g>
                    
                    {/* کلید فرانسه */}
                    <g transform="translate(85, 35)">
                      <path d="M 8,2 L 8,10 M 4,10 L 12,10 M 6,12 L 10,12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="8" cy="14" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" />
                    </g>
                    
                    {/* نقاط پراکنده */}
                    <circle cx="50" cy="5" r="1" fill="currentColor" opacity="0.5" />
                    <circle cx="100" cy="25" r="1.5" fill="currentColor" opacity="0.5" />
                    <circle cx="30" cy="50" r="1" fill="currentColor" opacity="0.5" />
                    <circle cx="110" cy="95" r="1.5" fill="currentColor" opacity="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#chat-pattern)" />
              </svg>
            </div>

            {/* تاریخ */}
            <div className="flex justify-center mb-4 relative z-10">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-xs text-gray-600 dark:text-gray-400">امروز</span>
              </div>
            </div>

            {messages.map((message, index) => (
              <div
                key={message.id}
                style={{ animationDelay: `${index * 30}ms` }}
                className={`flex ${message.sender === 'me' ? 'justify-start' : 'justify-end'} animate-fade-in relative z-10`}
              >
                <div className={`max-w-[85%] sm:max-w-[75%] ${message.sender !== 'me' ? 'flex flex-col items-end' : ''}`}>
                  <div
                    className={`px-4 py-2.5 shadow-md ${
                      message.sender === 'me'
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-3xl rounded-tr-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl rounded-tl-lg border border-gray-200/50 dark:border-gray-700/50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-2">
                    <span className="text-[10px] text-gray-400">
                      {message.timestamp}
                    </span>
                    {message.sender === 'me' && (
                      <svg
                        className={`w-3.5 h-3.5 ${message.read ? 'text-indigo-500' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* در حال تایپ */}
            {selectedChat.typing && (
              <div className="flex justify-end animate-fade-in relative z-10">
                <div className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl rounded-tl-lg px-4 py-3 shadow-md">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="relative z-10" />
          </div>

          {/* نوار ارسال */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 px-4 py-3">
            <div className="flex items-end gap-2">
              <button className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-95 transition-transform flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              <div className="flex-1 flex items-end bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-colors">
                <textarea
                  placeholder="پیام شما..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  className="flex-1 px-4 py-2.5 bg-transparent outline-none resize-none text-sm max-h-24"
                />
                <button className="p-2 active:scale-95 transition-transform">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={messageInput.trim() === ''}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  messageInput.trim() === ''
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg active:scale-95'
                }`}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

