'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Target, Zap, Globe } from 'lucide-react';

const INVESTORS = [
  {
    name: 'Warren Buffett',
    title: 'Value Investing',
    icon: Shield,
    core: 'Buy quality companies at reasonable prices with durable competitive advantages.',
    stocks: 12,
    color: '#00E5A8',
  },
  {
    name: 'Peter Lynch',
    title: 'Growth at Reasonable Price',
    icon: TrendingUp,
    core: 'Invest in what you know. Look for companies with sustainable growth potential.',
    stocks: 8,
    color: '#00FF88',
  },
  {
    name: 'Charlie Munger',
    title: 'Mental Models',
    icon: Brain,
    core: 'Avoid stupidity rather than seek brilliance. Focus on high-conviction bets.',
    stocks: 5,
    color: '#6366F1',
  },
  {
    name: 'George Soros',
    title: 'Reflexivity',
    icon: Zap,
    core: 'Identify market mispricings driven by reflexive feedback loops.',
    stocks: 7,
    color: '#FFC857',
  },
  {
    name: 'Ray Dalio',
    title: 'Risk Parity',
    icon: Globe,
    core: 'Diversify across uncorrelated assets. Understand economic machine.',
    stocks: 15,
    color: '#FB7185',
  },
];

export default function FamousInvestors() {
  return (
    <section className="py-8">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <h2 className="text-lg font-bold text-white mb-1">Famous Investors Strategies</h2>
        <p className="text-[11px] text-zinc-500 mb-6">Apply legendary investment frameworks to current market</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {INVESTORS.map((inv, i) => {
            const Icon = inv.icon;
            return (
              <motion.div key={inv.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass rounded-xl p-4 glass-hover cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${inv.color}15`, color: inv.color }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#00E5A8] transition-colors">{inv.name}</div>
                    <div className="text-[9px] text-zinc-600">{inv.title}</div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed mb-3 min-h-[2.5em]">{inv.core}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[10px] font-medium text-zinc-600">{inv.stocks} qualified stocks</span>
                  <span className="text-[9px] text-zinc-700 group-hover:text-[#00E5A8] transition-colors">View →</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Brain(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 4s-4-2-4-4 2-4 4-4z" /><path d="M8 18c0-2.5 2-4 4-4s4 1.5 4 4" /><path d="M4 8c-1 1-2 3 0 5s3 2 4 1" /><path d="M20 8c1 1 2 3 0 5s-3 2-4 1" /><path d="M12 22v-4" /></svg>; }
