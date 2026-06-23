'use client';
import React, { useState, useEffect, useCallback } from 'react';
import SearchHero from '@/components/SearchHero';
import CommandPalette from '@/components/CommandPalette';
import StockResults from '@/components/StockResults';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllStocks, searchStocks, clearCache, type TWSEStock } from '@/lib/twse';

export default function StockPowerPage() {
  const [stockData, setStockData] = useState<any>(null);       // 靜態 metadata
  const [liveStocks, setLiveStocks] = useState<TWSEStock[]>([]); // 即時資料
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveError, setIsLiveError] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [mode, setMode] = useState<'search' | 'results'>('search');
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [recentStocks, setRecentStocks] = useState<any[]>([]);

  // Load static metadata & live prices
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // 1. Load static metadata (fallback)
      try {
        const r = await fetch('/stock-data.json');
        const d = await r.json();
        if (!cancelled) setStockData(d);
      } catch {}

      // 2. Fetch live data from TWSE
      try {
        const result = await fetchAllStocks();
        if (!cancelled) {
          setLiveStocks(result.stocks);
          setIsLiveError(false);
        }
      } catch {
        if (!cancelled) setIsLiveError(true);
      }

      if (!cancelled) setIsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        clearCache();
        const result = await fetchAllStocks();
        setLiveStocks(result.stocks);
        setIsLiveError(false);
      } catch {}
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Load recent from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sp_recent');
      if (saved) setRecentStocks(JSON.parse(saved));
    } catch {}
  }, []);

  // ⌘K / Ctrl+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCmdPalette(prev => !prev);
      }
      if (e.key === 'Escape') setShowCmdPalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Search from LIVE data (fallback to static)
  const doSearch = useCallback((q: string): TWSEStock[] => {
    if (!q.trim()) return [];
    if (liveStocks.length > 0) return searchStocks(liveStocks, q, 30);
    // fallback: search static data
    const lower = q.toLowerCase();
    return Object.entries(stockData || {})
      .filter(([k]) => !k.startsWith('_'))
      .map(([_, v]) => v as any)
      .filter((v: any) => {
        const id = String(v.id || '').toLowerCase();
        const name = String(v.name || '').toLowerCase();
        return id.includes(lower) || name.includes(lower);
      })
      .slice(0, 20);
  }, [liveStocks, stockData]);

  // Merge live stock with static metadata
  const mergeStock = useCallback((live: TWSEStock | any) => {
    if (!live || !stockData) return live;
    const id = live.id || live;
    const meta = stockData[id];
    if (!meta) return live;
    return { ...meta, ...live, price: live.price ?? meta.price };
  }, [stockData]);

  // Handle selection
  const handleSelectStock = useCallback((stock: any) => {
    const merged = mergeStock(stock);
    setSelectedStock(merged);
    setMode('results');
    setRecentStocks(prev => {
      const filtered = prev.filter(s => s.id !== stock.id);
      const next = [merged, ...filtered].slice(0, 10);
      try { localStorage.setItem('sp_recent', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [mergeStock]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    const results = doSearch(q);
    if (results.length > 0) handleSelectStock(results[0]);
    else setMode('results');
  }, [doSearch, handleSelectStock]);

  const handleBack = useCallback(() => {
    setMode('search');
    setQuery('');
    setSelectedStock(null);
  }, []);

  // Loading state
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #5B8CFF, #8B5CFF)' }}>
          <span className="text-xs font-black text-white">SP</span>
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>載入中...</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'transparent' }}>
      <CommandPalette
        isOpen={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
        stocks={liveStocks.length > 0 ? liveStocks : []}
        onSelectStock={handleSelectStock}
        activeNav={mode === 'results' ? 'results' : 'search'}
        onNavigate={(page) => {
          if (page === 'back') handleBack();
          setShowCmdPalette(false);
        }}
      />

      {isLiveError && (
        <div className="fixed top-4 right-4 z-50 text-[11px] px-3 py-1.5 rounded-lg glass-sm"
          style={{ borderColor: 'rgba(251,113,133,0.3)', color: 'var(--down)' }}>
          ⚠ 即時資料離線，使用靜態數據
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'search' ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <SearchHero
              onSearch={handleSearch}
              onSelectStock={handleSelectStock}
              recentStocks={recentStocks}
              allStocks={liveStocks.length > 0 ? liveStocks : []}
              stockData={stockData}
              liveCount={liveStocks.length}
            />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <StockResults
              query={query}
              results={doSearch(query)}
              selectedStock={selectedStock}
              onSelectStock={handleSelectStock}
              onBack={handleBack}
              allStocks={liveStocks.length > 0 ? liveStocks : []}
              recentStocks={recentStocks}
              stockData={stockData}
              liveStocks={liveStocks}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
