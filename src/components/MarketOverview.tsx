'use client';
import React from 'react';
import { motion } from 'framer-motion';

const MARKETS = [
  { name: 'Taiwan Index', symbol: 'TAIEX', price: '29,745.68', change: 1.17, volume: '4,604億', sentiment: 'Bullish' },
  { name: 'NASDAQ', symbol: 'IXIC', price: '19,842.30', change: 0.82, volume: '5.2B', sentiment: 'Bullish' },
  { name: 'S&P 500', symbol: 'SPX', price: '6,123.45', change: -0.15, volume: '3.8B', sentiment: 'Neutral' },
  { name: 'Bitcoin', symbol: 'BTC', price: '108,432', change: 2.84, volume: '42.1B', sentiment: 'Bullish' },
];

const sentimentColors: Record<string, string> = {
  'Bullish': 'text-[#00FF88]',
  'Neutral': 'text-[#FFC857]',
  'Bearish': 'text-[#FF4D67]',
};

export default function MarketOverview({ stockData }: { stockData: any }) {
  const market = stockData?._market || {};

  return (
    <section className="py-8">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Market Overview</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Real-time global market indices</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
            Auto-updating every 10s
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {MARKETS.map((m, i) => {
            const isUp = m.change > 0;
            return (
              <motion.div key={m.symbol} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-4 glass-hover">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-medium text-zinc-500">{m.name}</div>
                    <div className="text-[10px] text-zinc-700 font-mono">{m.symbol}</div>
                  </div>
                  <div className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${sentimentColors[m.sentiment]} bg-current/5`}>
                    {m.sentiment}
                  </div>
                </div>
                <div className={`text-xl font-bold font-mono ${isUp ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
                  {m.price}
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className={`font-mono font-medium ${isUp ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(m.change)}%
                  </span>
                  <span className="text-zinc-600">Vol: {m.volume}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 三大法人 */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Foreign Inst.', value: ((market.foreign_net || 0) / 10000000).toFixed(1), color: '#00E5A8' },
            { label: 'Investment Trust', value: ((market.trust_net || 0) / 10000000).toFixed(1), color: '#00FF88' },
            { label: 'Dealers', value: ((market.dealer_net || 0) / 10000000).toFixed(1), color: '#FFC857' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              className="glass rounded-xl p-3 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">{item.label}</span>
              <span className={`text-xs font-bold font-mono ${parseFloat(item.value) > 0 ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
                {parseFloat(item.value) > 0 ? '+' : ''}{item.value}B
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
