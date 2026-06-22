'use client';
import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import HeroSection from '@/components/HeroSection';
import MarketOverview from '@/components/MarketOverview';
import AISignalCenter from '@/components/AISignalCenter';
import FamousInvestors from '@/components/FamousInvestors';
import NewsIntelligence from '@/components/NewsIntelligence';

export default function StockPowerPage() {
  const [stockData, setStockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    fetch('/stock-power/stock-data.json')
      .then(r => r.json())
      .then(d => setStockData(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B11]">
      <div className="text-center">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00E5A8] to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00E5A8]/20 animate-pulse">
          <span className="text-sm font-black text-[#080B11]">SP</span>
        </div>
        <div className="text-xs text-zinc-600 font-mono">Initializing AI Engine...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080B11]">
      {/* Background glows */}
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />

      {/* Top Navigation */}
      <TopNav activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <MarketOverview stockData={stockData} />
        <AISignalCenter />
        <FamousInvestors />
        <NewsIntelligence />
        
        {/* Footer */}
        <footer className="py-8 border-t border-white/5 mt-8">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between text-[10px] text-zinc-700">
              <span>Stock Power AI — Investment Intelligence Platform</span>
              <span>© 2026 · Powered by AI</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
