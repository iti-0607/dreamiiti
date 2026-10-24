import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F2F7F3] flex flex-col justify-between selection:bg-[#1B3024] selection:text-[#39E58C]">
      {/* Header */}
      <header className="w-full border-b border-[#27352C] bg-[#0B0F0D]/90 backdrop-blur-md px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-2xl tracking-tight text-[#F2F7F3] group-hover:text-[#39E58C] transition-colors">
              Dream<span className="text-[#39E58C]">IITi</span>
            </span>
          </Link>

          <Link
            to="/login"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-[#0B0F0D] bg-[#39E58C] hover:bg-[#26C978] transition-all shadow-sm"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-[#F2F7F3]">
            One Life<span className="text-[#39E58C]">.</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#98A69C] max-w-xl mx-auto">
            It's my turn now to become <span className="text-[#39E58C] font-bold">TOP 1</span>.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-base bg-[#39E58C] hover:bg-[#26C978] text-[#0B0F0D] transition-all shadow-[0_0_20px_rgba(57,229,140,0.3)] hover:shadow-[0_0_25px_rgba(57,229,140,0.5)] active:scale-[0.98]"
            >
              Show How Comeback looks like →
            </Link>
          </div>
        </div>
      </main>

      {/* Subtle bottom spacing */}
      <footer className="py-6 text-center text-xs text-[#98A69C]/40">
      </footer>
    </div>
  );
};
