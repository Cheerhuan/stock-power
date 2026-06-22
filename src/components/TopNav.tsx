'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'market', label: 'Market' },
  { id: 'ai_signals', label: 'AI Signals' },
  { id: 'strategies', label: 'Strategies' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'news', label: 'News' },
  { id: 'pricing', label: 'Pricing' },
];

export default function TopNav({
  activeNav,
  setActiveNav,
}: {
  activeNav: string;
  setActiveNav: (n: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.06] md:border-b-0">
      {/* Glass background */}
      <div className="absolute inset-0 bg-[rgba(8,11,17,0.85)] backdrop-blur-2xl border-b border-white/[0.04] md:border-b-0" />

      {/* Subtle glow edge */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="section-container relative z-10 h-full flex items-center justify-between">
        {/* ── Logo ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00E5A8] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#00E5A8]/25">
            <span className="text-[9px] font-black text-[#080B11] tracking-tight">SP</span>
          </div>
          <span className="text-sm font-semibold text-white/90 tracking-tight">
            Stock<span className="font-normal text-white/50"> Power</span>
          </span>
        </div>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = activeNav === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveNav(link.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.06]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <Search size={16} />
          </button>
          <button className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <Bell size={16} />
          </button>

          <div className="hidden sm:flex items-center gap-2 ml-1">
            <button className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.06]">
              登录
            </button>
            <button className="text-xs font-semibold text-[#080B11] bg-[#00E5A8] hover:bg-emerald-400 px-4 py-2 rounded-lg transition-all shadow-lg shadow-[#00E5A8]/25 active:scale-[0.97]">
              开始使用
            </button>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-0 border-t border-white/[0.06] bg-[rgba(8,11,17,0.95)] backdrop-blur-2xl shadow-2xl shadow-black/40 md:hidden"
          >
            <div className="py-4 px-4">
              {NAV_LINKS.map((link) => {
                const isActive = activeNav === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveNav(link.id);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-white/[0.08]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile action buttons */}
            <div className="border-t border-white/[0.06] px-4 py-4 flex items-center gap-3">
              <button className="flex items-center justify-center w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <Search size={16} />
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <Bell size={16} />
              </button>
              <div className="flex-1" />
              <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2.5 rounded-lg hover:bg-white/[0.06]">
                登录
              </button>
              <button className="text-sm font-semibold text-[#080B11] bg-[#00E5A8] hover:bg-emerald-400 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#00E5A8]/25 active:scale-[0.97]">
                开始使用
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
