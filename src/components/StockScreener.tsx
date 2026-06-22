'use client';
import React, { useState, useMemo } from 'react';

interface StockScreenerProps {
  stockData: Record<string, any>;
  onSelectStock: (id: string) => void;
}

export default function StockScreener({ stockData, onSelectStock }: StockScreenerProps) {
  const stocks = useMemo(() => Object.values(stockData).filter((s: any) => s?.id && s?.price), [stockData]);
  const sectors = [...new Set(stocks.map((s: any) => s.sector).filter(Boolean))];

  const [filters, setFilters] = useState({ query: '', sector: 'all', grade: 'all', sortBy: 'change_desc' });
  const [view, setView] = useState<'list' | 'grid'>('list');

  const filtered = useMemo(() => {
    let result = [...stocks] as any[];
    if (filters.query) {
      const q = filters.query;
      result = result.filter((s: any) => s.id?.includes(q) || s.name?.includes(q));
    }
    if (filters.sector !== 'all') result = result.filter((s: any) => s.sector === filters.sector);
    if (filters.grade !== 'all') result = result.filter((s: any) => s.grade === filters.grade);

    const [key, order] = filters.sortBy.split('_');
    result.sort((a: any, b: any) => {
      const va = a[key] ?? 0, vb = b[key] ?? 0;
      return order === 'asc' ? va - vb : vb - va;
    });
    return result;
  }, [filters, stocks]);

  return (
    <div>
      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input value={filters.query} onChange={e => setFilters(p => ({...p, query: e.target.value}))}
          className="w-48 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
          placeholder="搜尋代號或名稱..." />
        <select value={filters.sector} onChange={e => setFilters(p => ({...p, sector: e.target.value}))}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 outline-none focus:border-zinc-600">
          <option value="all">全部類股</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.grade} onChange={e => setFilters(p => ({...p, grade: e.target.value}))}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 outline-none focus:border-zinc-600">
          <option value="all">全部信號</option>
          <option value="A+">A+ 強力買入</option>
          <option value="A">A 買入</option>
          <option value="B">B 持有</option>
          <option value="C">C 觀望</option>
          <option value="D">D 賣出</option>
        </select>
        <select value={filters.sortBy} onChange={e => setFilters(p => ({...p, sortBy: e.target.value}))}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 outline-none focus:border-zinc-600">
          <option value="change_desc">漲幅 ↓</option>
          <option value="change_asc">跌幅 ↑</option>
          <option value="price_desc">股價 ↓</option>
          <option value="volume_desc">成交量 ↓</option>
        </select>
        <div className="text-xs text-zinc-600 ml-auto">{filtered.length} 檔</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((s: any) => (
          <button key={s.id} onClick={() => onSelectStock(s.id)}
            className="text-left p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{s.id}</span>
                  <span className="text-xs text-zinc-500">{s.name}</span>
                </div>
                <span className="text-[10px] text-zinc-600">{s.sector}</span>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                s.grade === 'A+' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                s.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                s.grade === 'B' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                s.grade === 'C' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>{s.grade}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-white">{s.price?.toLocaleString()}</span>
              <span className={`text-sm font-mono ${s.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {s.change > 0 ? '+' : ''}{s.change}%
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-600">
              <span>本益比 {s.pe}</span>
              <span>EPS {s.eps}</span>
              <span>營收 {(s.eps_growth || 0).toFixed(1)}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
