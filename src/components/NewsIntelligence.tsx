'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Newspaper, ExternalLink } from 'lucide-react';

const NEWS = [
  { title: 'TSMC Announces 3nm Capacity Expansion', source: 'Reuters', sentiment: 'Positive', score: 85, time: '12m ago' },
  { title: 'Fed Signals Potential Rate Cut in Q3', source: 'Bloomberg', sentiment: 'Positive', score: 72, time: '28m ago' },
  { title: 'AI Chip Demand Drives Record Semiconductor Orders', source: 'WSJ', sentiment: 'Positive', score: 91, time: '1h ago' },
  { title: 'Taiwan Export Orders Beat Expectations in May', source: 'CNA', sentiment: 'Positive', score: 68, time: '2h ago' },
  { title: 'Global Market Rally Fades on Inflation Concerns', source: 'FT', sentiment: 'Negative', score: 35, time: '3h ago' },
];

export default function NewsIntelligence() {
  return (
    <section className="py-8">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">News Intelligence</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">AI-powered sentiment analysis from global sources</p>
          </div>
          <button className="text-[10px] text-[#00E5A8] font-medium hover:underline">View All</button>
        </div>

        <div className="grid gap-2">
          {NEWS.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-3 glass-hover flex items-center justify-between gap-4 cursor-pointer group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white truncate group-hover:text-[#00E5A8] transition-colors">{item.title}</span>
                  <ExternalLink size={10} className="text-zinc-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] text-zinc-600">{item.source}</span>
                  <span className="text-[9px] text-zinc-700">·</span>
                  <span className="text-[9px] text-zinc-600">{item.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className={`text-[10px] font-bold ${item.sentiment === 'Positive' ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
                  {item.sentiment}
                </div>
                <div className={`text-[10px] font-mono font-bold ${item.score >= 60 ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
                  {item.score}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
