"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContentItem {
  id: string;
  type: 'header' | 'hero' | 'section' | 'feature';
  title: string;
  description?: string;
  content?: string;
  isVisible: boolean;
}

interface ContentContextType {
  contents: ContentItem[];
  addContent: (content: Omit<ContentItem, 'id'>) => void;
  updateContent: (id: string, content: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  toggleVisibility: (id: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<ContentItem[]>([
    {
      id: '1',
      type: 'header',
      title: 'وبسایت من',
      description: 'بهترین محصولات و خدمات',
      isVisible: true,
    },
    {
      id: '2',
      type: 'hero',
      title: 'به وبسایت ما خوش آمدید',
      description: 'ما بهترین خدمات را برای شما فراهم می‌کنیم',
      content: 'محتوای اصلی سایت شما در اینجا قرار می‌گیرد',
      isVisible: true,
    },
  ]);

  const addContent = (content: Omit<ContentItem, 'id'>) => {
    const newContent: ContentItem = {
      ...content,
      id: Date.now().toString(),
    };
    setContents([...contents, newContent]);
  };

  const updateContent = (id: string, updatedContent: Partial<ContentItem>) => {
    setContents(contents.map(item => 
      item.id === id ? { ...item, ...updatedContent } : item
    ));
  };

  const deleteContent = (id: string) => {
    setContents(contents.filter(item => item.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setContents(contents.map(item =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
  };

  return (
    <ContentContext.Provider value={{ contents, addContent, updateContent, deleteContent, toggleVisibility }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

