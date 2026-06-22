'use client';
import React, { useState, useEffect, useRef } from 'react';
import MarketOverview from '@/components/MarketOverview';
import StockScreener from '@/components/StockScreener';
import MasterHeader from '@/components/MasterHeader';
import StockChart from '@/components/StockChart';
import CommandPalette from '@/components/CommandPalette';
import Sidebar from '@/components/Sidebar';

export default function StockPowerPage() {
  const [stockData, setStockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('market');
  const [activeStock, setActiveStock] = useState('2330');
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    fetch('/stock-power/stock-data.json')
      .then(r => r.json())
      .then(d => setStockData(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const h = () => setPaletteOpen(true);
    window.addEventListener('open-command-palette', h);
    return () => window.removeEventListener('open-command-palette', h);
  }, []);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-600 text-sm font-mono">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-indigo-500 animate-spin" />
        載入中...
      </div>
    </div>
  );

  const currentStock = stockData?.[activeStock] ?? Object.values(stockData || {}).find((s: any) => s?.id);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar stockData={stockData} activeView={activeView} setActiveView={setActiveView}
        activeStock={activeStock} onSelectStock={(id) => { setActiveStock(id); setActiveView('detail'); }} />
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full animate-fade-in overflow-y-auto">
        {activeView === 'market' && <MarketOverview stockData={stockData} />}
        {activeView === 'screener' && <StockScreener stockData={stockData} onSelectStock={(id) => { setActiveStock(id); setActiveView('detail'); }} />}
        {activeView === 'watchlist' && <WatchlistView stockData={stockData} onSelectStock={(id) => { setActiveStock(id); setActiveView('detail'); }} />}
        {activeView === 'detail' && <DetailView stock={currentStock} />}
      </main>
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)}
        onSelect={(id) => { setActiveStock(id); setActiveView('detail'); }} stockData={stockData} />
    </div>
  );
}

/* ─── Watchlist ─── */
const WL_IDS = ['2330','2317','2454','2382','2376','3443'];
function WatchlistView({ stockData, onSelectStock }: { stockData: any, onSelectStock: (id: string) => void }) {
  const list = WL_IDS.map(id => stockData?.[id]).filter(Boolean);
  return (
    <div>
      <div className="text-lg font-bold text-white mb-5">我的自選股</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((s: any) => (
          <button key={s.id} onClick={() => onSelectStock(s.id)}
            className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all text-left">
            <div className="flex items-start justify-between mb-2">
              <div><span className="font-bold text-sm text-white">{s.id}</span><span className="text-xs text-zinc-500 ml-2">{s.name}</span></div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                s.grade === 'A+' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>{s.grade}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-white">{s.price?.toLocaleString()}</span>
              <span className={`text-sm font-mono ${s.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{s.change > 0 ? '+' : ''}{s.change}%</span>
            </div>
            <div className="flex gap-2 mt-3">
              {s.signals?.slice(0, 2).map((sig: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">{sig}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Detail View ─── */
function DetailView({ stock }: { stock: any }) {
  if (!stock) return <div className="text-zinc-500 text-sm">請選擇一檔股票</div>;
  const isUp = stock.change > 0;
  const instTotal = (stock.inst_trend || []).reduce((a: number, b: number) => a + b, 0) / stock.inst_trend?.length;

  return (
    <div>
      <MasterHeader stock={stock} />

      {/* Analysis Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '基本面', color: 'border-l-indigo-500', items: [
            { k: '本益比', v: stock.pe }, { k: '股淨比', v: stock.pb },
            { k: 'EPS', v: stock.eps }, { k: '營收成長', v: `${stock.eps_growth || 0}%` },
          ]},
          { label: '籌碼面', color: 'border-l-emerald-500', items: [
            { k: '外資占比', v: `${stock.foreign_position || 0}%` },
            { k: '融資比', v: `${stock.margin_ratio || 0}%` },
            { k: '法人趨勢', v: instTotal > 0 ? '偏多 📈' : '偏空 📉' },
            { k: '近5日買賣超', v: `${(instTotal / 10000000).toFixed(1)} 億` },
          ]},
          { label: '技術面', color: 'border-l-amber-500', items: [
            { k: 'RSI', v: stock.rsi }, { k: 'MA5', v: stock.ma5?.toLocaleString() },
            { k: 'MA20', v: stock.ma20?.toLocaleString() },
            { k: '與均線', v: stock.price > stock.ma20 ? '站穩均線 ↑' : '跌破均線 ↓' },
          ]},
        ].map(card => (
          <div key={card.label} className={`p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 border-l-2 ${card.color}`}>
            <div className="text-xs font-bold text-zinc-500 mb-3">{card.label}</div>
            <div className="space-y-2">
              {card.items.map(item => (
                <div key={item.k} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">{item.k}</span>
                  <span className="text-zinc-200 font-medium">{item.v ?? '-'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">價格走勢</div>
          <div className="flex gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-[10px] text-zinc-500 font-mono">即時</span>
          </div>
        </div>
        <StockChart stock={stock} />
      </div>

      {/* AI Summary */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600/10 via-zinc-900/80 to-zinc-950/80 border border-indigo-500/20">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">AI 信號分析</div>
        <p className="text-base text-zinc-200 leading-relaxed italic">&ldquo;{stock.summary}&rdquo;</p>
        <div className="flex gap-2 mt-3">
          {stock.signals?.map((sig: string, i: number) => (
            <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700">{sig}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
