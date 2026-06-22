'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CommandPalette from '@/components/CommandPalette';
import MasterHeader from '@/components/MasterHeader';
import StockChart from '@/components/StockChart';

export default function StockPowerPage() {
  const [stockData, setStockData] = useState<Record<string, any> | null>(null);
  const [activeStock, setActiveStock] = useState('2330');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/stock-power/stock-data.json');
        const data = await res.json();
        setStockData(data);
      } catch (e) {
        console.error("Failed to load stock data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-500 text-sm font-mono">
        Loading Industrial Data...
      </div>
    );
  }

  const current = stockData?.[activeStock] || stockData?.[Object.keys(stockData || {})[0]];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      <Sidebar activeStock={activeStock} onSelectStock={setActiveStock} />
      
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full animate-fade-in">
        <MasterHeader 
          stockId={activeStock} 
          price={current?.price} 
          change={current?.change} 
          grade={current?.grade} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {['fundamental', 'chip', 'technical'].map((dim) => {
            const data = current?.details?.[dim];
            return (
              <div key={dim} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">{dim} Analysis</div>
                <div className="text-sm text-zinc-300 mb-4 min-h-[3rem]">
                  {dim === 'fundamental' && `P/E: ${data?.pe} | P/B: ${data?.pb} | Growth: ${data?.growth}%`}
                  {dim === 'chip' && `Net Buy: ${data?.net_buy?.toLocaleString()} | Trend: ${data?.trend}`}
                  {dim === 'technical' && `Price Action: ${data?.trend} | Volume: Stable`}
                </div>
                <div className={`flex items-center justify-between text-xs font-bold py-2 px-3 rounded-lg border ${
                  data?.conclusion === 'POSITIVE' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                }`}>
                  <span className="opacity-60">CONCLUSION</span>
                  <span>{data?.conclusion}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-8">
          <StockChart stockId={activeStock} price={current?.price} />
        </div>

        <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-500">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">AI Synthesis</div>
            <p className="text-lg text-zinc-200 leading-relaxed italic">
              "{current?.summary}"
            </p>
          </div>
        </div>
      </main>

      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onSelect={setActiveStock} 
      />
    </div>
  );
}
