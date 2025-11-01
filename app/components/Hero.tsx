"use client";

import { useContent } from '../context/ContentContext';

export default function Hero() {
  const { contents } = useContent();
  const heroContent = contents.find(c => c.type === 'hero' && c.isVisible);

  if (!heroContent) return null;

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
            {heroContent.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 animate-fade-in-delay">
            {heroContent.description}
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            {heroContent.content}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              شروع کنید
            </button>
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold border-2 border-purple-600 hover:bg-purple-50 transition-all duration-300">
              بیشتر بدانید
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

