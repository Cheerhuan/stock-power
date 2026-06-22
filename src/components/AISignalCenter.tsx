'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface GaugeProps { score: number; }
function Gauge({ score }: GaugeProps) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference * (1 - score / 100);
  const color = score >= 70 ? '#00FF88' : score >= 45 ? '#FFC857' : '#FF4D67';
  return (
    <div className="gauge-ring w-[60px] h-[60px] mx-auto">
      <svg width="60" height="60" viewBox="0 0 80 80">
        <circle className="bg-ring" cx="40" cy="40" r="36" strokeWidth="4" />
        <circle className="value-ring" cx="40" cy="40" r="36" strokeWidth="4" stroke={color}
          strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold font-mono" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

const SIGNALS = [
  { id: '2330', name: 'TSMC', score: 87, prob: 92, risk: 'Low', ret: '+18.5%', direction: 'Strong Buy', sector: '半導體' },
  { id: '2454', name: 'MediaTek', score: 76, prob: 78, risk: 'Low', ret: '+12.3%', direction: 'Buy', sector: 'IC設計' },
  { id: '2317', name: 'Foxconn', score: 62, prob: 65, risk: 'Medium', ret: '+8.1%', direction: 'Hold', sector: '電子代工' },
  { id: '2382', name: 'Quanta', score: 81, prob: 85, risk: 'Low', ret: '+15.2%', direction: 'Buy', sector: '電腦週邊' },
  { id: '2303', name: 'UMC', score: 45, prob: 42, risk: 'Medium', ret: '-2.1%', direction: 'Hold', sector: '半導體' },
  { id: '3443', name: 'Global Uni', score: 91, prob: 95, risk: 'Low', ret: '+22.7%', direction: 'Strong Buy', sector: 'IC設計' },
];

const dirColors: Record<string, string> = {
  'Strong Buy': 'text-[#00FF88]',
  'Buy': 'text-[#00E5A8]',
  'Hold': 'text-[#FFC857]',
  'Sell': 'text-[#FF4D67]',
  'Strong Sell': 'text-[#FF4D67]',
};
const dirBg: Record<string, string> = {
  'Strong Buy': 'bg-[#00FF88]/10 border-[#00FF88]/20',
  'Buy': 'bg-[#00E5A8]/10 border-[#00E5A8]/20',
  'Hold': 'bg-[#FFC857]/10 border-[#FFC857]/20',
  'Sell': 'bg-[#FF4D67]/10 border-[#FF4D67]/20',
  'Strong Sell': 'bg-[#FF4D67]/15 border-[#FF4D67]/30',
};

export default function AISignalCenter() {
  return (
    <section className="py-8">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">AI Signal Center</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Machine learning powered stock recommendations</p>
          </div>
          <div className="text-[10px] text-zinc-600">Updated: 1 min ago</div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {SIGNALS.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass rounded-xl p-4 glass-hover">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-white">{s.id}</div>
                  <div className="text-[9px] text-zinc-600">{s.name} · {s.sector}</div>
                </div>
                <div className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${dirBg[s.direction]}`}>
                  {s.direction}
                </div>
              </div>

              <Gauge score={s.score} />

              <div className="space-y-1 mt-3 pt-3 border-t border-white/5">
                {[
                  { k: 'Buy Prob.', v: `${s.prob}%`, c: 'text-[#00FF88]' },
                  { k: 'Risk', v: s.risk, c: s.risk === 'Low' ? 'text-[#00FF88]' : 'text-[#FFC857]' },
                  { k: 'Est. Return', v: s.ret, c: s.ret.startsWith('+') ? 'text-[#00FF88]' : 'text-[#FF4D67]' },
                ].map(item => (
                  <div key={item.k} className="flex items-center justify-between text-[9px]">
                    <span className="text-zinc-600">{item.k}</span>
                    <span className={`font-medium ${item.c}`}>{item.v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
