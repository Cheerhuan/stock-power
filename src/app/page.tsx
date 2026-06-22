'use client';
import React, { useState, useEffect, useCallback } from 'react';
import SearchHero from '@/components/SearchHero';
import CommandPalette from '@/components/CommandPalette';
import StockResults from '@/components/StockResults';
import { motion, AnimatePresence } from 'framer-motion';

export default function StockPowerPage() {
  const [stockData, setStockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [mode, setMode] = useState<'search' | 'results'>('search');
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [recentStocks, setRecentStocks] = useState<any[]>([]);

  // Load data
  useEffect(() => {
    fetch('/stock-power/stock-data.json')
      .then(r => r.json())
      .then(d => setStockData(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
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
      if (e.key === 'Escape') {
        setShowCmdPalette(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Get all stocks as flat array
  const allStocks = React.useMemo(() => {
    if (!stockData) return [];
    return Object.entries(stockData)
      .filter(([k]) => !k.startsWith('_'))
      .map(([_, v]) => v as any)
      .filter(v => v && v.id && v.price);
  }, [stockData]);

  // Search logic
  const searchStocks = useCallback((q: string) => {
    if (!q.trim() || !allStocks.length) return [];
    const lower = q.toLowerCase();
    return allStocks.filter(s => {
      const id = String(s.id || '').toLowerCase();
      const name = String(s.name || '').toLowerCase();
      return id.includes(lower) || name.includes(lower);
    }).slice(0, 20);
  }, [allStocks]);

  // Handle stock selection
  const handleSelectStock = useCallback((stock: any) => {
    setSelectedStock(stock);
    setMode('results');
    // Add to recent
    setRecentStocks(prev => {
      const filtered = prev.filter(s => s.id !== stock.id);
      const next = [stock, ...filtered].slice(0, 10);
      try { localStorage.setItem('sp_recent', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Handle search submit
  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    const results = searchStocks(q);
    if (results.length > 0) {
      handleSelectStock(results[0]);
    } else {
      setMode('results');
    }
  }, [searchStocks, handleSelectStock]);

  const handleBack = useCallback(() => {
    setMode('search');
    setQuery('');
    setSelectedStock(null);
  }, []);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F17' }}>
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #5B8CFF, #8B5CFF)' }}>
          <span className="text-xs font-black text-white">SP</span>
        </div>
        <div className="text-xs font-mono" style={{ color: '#5A5D6B' }}>Initializing...</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0B0F17' }}>
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
        stocks={allStocks}
        onSelectStock={handleSelectStock}
        activeNav={mode === 'results' ? 'results' : 'search'}
        onNavigate={(page) => {
          if (page === 'back') handleBack();
          setShowCmdPalette(false);
        }}
      />

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
              allStocks={allStocks}
              stockData={stockData}
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
              results={searchStocks(query)}
              selectedStock={selectedStock}
              onSelectStock={handleSelectStock}
              onBack={handleBack}
              allStocks={allStocks}
              recentStocks={recentStocks}
              stockData={stockData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
