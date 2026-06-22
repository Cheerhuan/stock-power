'use client';
import React from 'react';

export default function MasterHeader({ stockId, price, change, grade }: { stockId: string, price: string, change: number, grade: string }) {
  const getGradeColor = (g: string) => {
    if (g === 'A+') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (g === 'B') return 'text-zinc-300 bg-zinc-300/10 border-zinc-300/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  };

  return (
    <header className="flex items-center justify-between py-6 border-b border-zinc-800 mb-8">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tighter text-white">{stockId}</h1>
        <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-widest ${getGradeColor(grade)}`}>
          GRADE: {grade}
        </div>
      </div>
      <div className="text-right">
        <div className="text-3xl font-mono font-bold text-white">${price}</div>
        <div className={`text-sm font-medium ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
        </div>
      </div>
    </header>
  );
}
