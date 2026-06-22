'use client';
import React from 'react';

export default function MasterHeader({ stock }: { stock: any }) {
  if (!stock) return null;
  const { id, name, price, change, grade, high, low, volume, market_cap } = stock;

  const getGrade = (g: string) => {
    if (!g) return 'bg-zinc-800 text-zinc-500';
    if (g === 'A+') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (g === 'A') return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20';
    if (g === 'B') return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    if (g === 'C') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const isUp = change > 0;
  const arrow = isUp ? '▲' : '▼';
  const color = isUp ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 mb-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        {/* Left */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{id}</h1>
            <span className="text-sm text-zinc-400">{name}</span>
            <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wider ${getGrade(grade)}`}>
              {grade || 'NA'}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
            <span>高：<span className="text-zinc-300">{high?.toLocaleString()}</span></span>
            <span>低：<span className="text-zinc-300">{low?.toLocaleString()}</span></span>
            <span>量：<span className="text-zinc-300">{(volume / 1000000).toFixed(2)}M</span></span>
            <span>市值：<span className="text-zinc-300">{(market_cap || 0).toFixed(1)}B</span></span>
          </div>
        </div>
        {/* Right */}
        <div className="text-right">
          <div className="text-3xl font-bold font-mono text-white">{price?.toLocaleString()}</div>
          <div className={`text-sm font-medium mt-0.5 ${color}`}>
            {arrow} {Math.abs(change)}%
          </div>
        </div>
      </div>
    </div>
  );
}
