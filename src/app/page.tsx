'use client';
import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import HeroSection from '@/components/HeroSection';
import MarketOverview from '@/components/MarketOverview';
import AISignalCenter from '@/components/AISignalCenter';
import FamousInvestors from '@/components/FamousInvestors';
import InstitutionTracker from '@/components/InstitutionTracker';
import ChipAnalysis from '@/components/ChipAnalysis';
import NewsIntelligence from '@/components/NewsIntelligence';
import PortfolioDashboard from '@/components/PortfolioDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';

type NavSection = string;

export default function StockPowerPage() {
  const [stockData, setStockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<NavSection>('dashboard');

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
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5A8] to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00E5A8]/20 animate-pulse">
          <span className="text-sm font-black text-[#080B11]">SP</span>
        </div>
        <div className="text-xs text-zinc-600 font-mono">Initializing AI Engine...</div>
      </div>
    </div>
  );

  if (!stockData) return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B11]">
      <div className="glass rounded-2xl p-8 text-center max-w-xs">
        <BarChart3 className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <div className="text-sm text-zinc-500">Unable to load market data</div>
        <button onClick={() => window.location.reload()} className="mt-4 text-xs text-[#00E5A8] hover:underline">
          Retry
        </button>
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

      {/* Main Content — each section handles its own container */}
      <main className="relative z-10 pb-safe">
        <HeroSection stockData={stockData} />

        <AnimatePresence mode="wait">
          {activeNav === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <MarketOverview stockData={stockData} />
              <AISignalCenter stockData={stockData} showInitial={8} />
              <InstitutionTracker stockData={stockData} />
              <NewsIntelligence stockData={stockData} />
            </motion.div>
          )}

          {activeNav === 'market' && (
            <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <MarketOverview stockData={stockData} />
              <InstitutionTracker stockData={stockData} />
            </motion.div>
          )}

          {activeNav === 'ai_signals' && (
            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <AISignalCenter stockData={stockData} showInitial={12} />
              <FamousInvestors stockData={stockData} />
            </motion.div>
          )}

          {activeNav === 'strategies' && (
            <motion.div key="strategies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <FamousInvestors stockData={stockData} />
              <ChipAnalysis stockData={stockData} />
            </motion.div>
          )}

          {activeNav === 'portfolio' && (
            <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <PortfolioDashboard stockData={stockData} />
            </motion.div>
          )}

          {activeNav === 'news' && (
            <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <NewsIntelligence stockData={stockData} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="py-6 md:py-8 border-t border-white/5 mt-6 md:mt-8">
          <div className="section-container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-zinc-700">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-zinc-700" />
                <span>Stock Power AI — AI 投資決策平台</span>
              </div>
              <span>© 2026 · Powered by AI · Data for reference only</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
