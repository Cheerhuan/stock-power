'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Brain, BarChart3, Briefcase, Newspaper, Menu } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'market', label: 'Market', icon: TrendingUp },
  { id: 'ai-signals', label: 'AI Signals', icon: Brain },
  { id: 'strategies', label: 'Strategies', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'news', label: 'News', icon: Newspaper },
];

export default function TopNav({ activeNav, setActiveNav }: { activeNav: string, setActiveNav: (id: string) => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14">
      <div className="absolute inset-0 glass" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00E5A8]/20 to-transparent" />
      
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00E5A8] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#00E5A8]/20">
            <span className="text-[9px] font-black text-[#080B11]">SP</span>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Stock Power</span>
          <span className="hidden lg:inline-block text-[9px] font-medium text-[#00E5A8] px-2 py-0.5 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/20">AI</span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-white bg-white/10 border border-white/10' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}>
                <Icon size={13} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-[11px] font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5">Sign In</button>
          <button className="text-[11px] font-bold text-[#080B11] bg-[#00E5A8] hover:bg-emerald-400 px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-[#00E5A8]/20">
            Get Started
          </button>
          <button className="md:hidden p-1.5 text-zinc-500"><Menu size={16} /></button>
        </div>
      </div>
    </header>
  );
}
