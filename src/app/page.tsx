import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center px-6 font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <main className="relative z-10 text-center max-w-3xl">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 font-outfit tracking-tight">
          MEDIA<span className="text-blue-500">360</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed">
          The ultimate unified dashboard for managing your social media 
          presence, reviews, and customer interactions with AI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20"
          >
            Get Started
          </Link>
          <Link 
            href="/privacy"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-full text-lg font-semibold transition-all"
          >
            Privacy Policy
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-10 text-gray-500 text-sm">
        © 2024 MEDIA360 AI Platform. All rights reserved.
      </footer>
    </div>
  );
}
