'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, BrainCircuit, Scale, Globe, Zap, CheckCircle2, Award, ChevronRight } from 'lucide-react';

// ─── 名人投資大師定義 ───
const FAMOUS_INVESTORS = [
  { id: 'buffett', name: 'Warren Buffett', style: '價值投資', quote: 'Buy great companies at fair prices', score: 93, icon: Shield, color: '#00E5A8' },
  { id: 'lynch', name: 'Peter Lynch', style: '成長投資', quote: 'Invest in what you know', score: 87, icon: TrendingUp, color: '#22D3EE' },
  { id: 'munger', name: 'Charlie Munger', style: '集中投資', quote: 'Patience, mental models, invert', score: 91, icon: BrainCircuit, color: '#A78BFA' },
  { id: 'graham', name: 'Benjamin Graham', style: '安全邊際', quote: 'Margin of safety, $1 for 50¢', score: 78, icon: Scale, color: '#FBBF24' },
  { id: 'dalio', name: 'Ray Dalio', style: '全天候', quote: 'Risk parity, diversify cycles', score: 85, icon: Globe, color: '#FB7185' },
  { id: 'soros', name: 'George Soros', style: '反射理論', quote: 'Reflexivity, exploit trends', score: 72, icon: Zap, color: '#F472B6' },
];

/** 根據 consensus_count 算出 AI 綜合評等 */
function consensusGrade(count: number, totalInvestors: number): string {
  const ratio = count / totalInvestors;
  if (ratio >= 0.8) return 'A+';
  if (ratio >= 0.6) return 'A';
  if (ratio >= 0.35) return 'A-';
  if (ratio >= 0.15) return 'B+';
  return 'B';
}

interface Props {
  stockData: any;
}

export default function FamousInvestors({ stockData }: Props) {
  // ── 從 stockData 篩出個股記錄（排除 _market / _etfs 等後設鍵）──
  const stocks = useMemo(() => {
    if (!stockData) return [];
    return Object.entries(stockData)
      .filter(([key, val]: [string, any]) => !key.startsWith('_') && val?.consensus !== undefined)
      .map(([, val]: [string, any]) => val);
  }, [stockData]);

  // ── 每位大師符合的個股數量 ──
  const investorMatchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const inv of FAMOUS_INVESTORS) {
      counts[inv.id] = stocks.filter((s: any) => s.consensus?.[inv.id] === true).length;
    }
    return counts;
  }, [stocks]);

  // ── Top 3 最高共識個股 ──
  const topStocks = useMemo(() => {
    return [...stocks]
      .sort((a: any, b: any) => (b.consensus_count ?? 0) - (a.consensus_count ?? 0))
      .slice(0, 3);
  }, [stocks]);

  // ── 統計數字 ──
  const totalStocksWithConsensus = stocks.length;
  const totalUniqueInvestors = FAMOUS_INVESTORS.length;
  const totalMatches = FAMOUS_INVESTORS.reduce((acc, inv) => acc + (investorMatchCounts[inv.id] ?? 0), 0);

  // ── Staggered animation ──
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  if (!stockData) return null;

  return (
    <section>
      <div className="section-container section-spacing">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00E5A8] to-emerald-700/60 flex items-center justify-center shadow-lg shadow-[#00E5A8]/20">
              <Award size={14} className="text-[#080B11]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">AI 共識評分系統</h2>
          </div>
          <p className="text-[13px] md:text-[11px] text-zinc-500 ml-10">頂尖投資策略模擬分析</p>
        </motion.div>

        {/* ── 大師卡片網格 ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8"
        >
          {FAMOUS_INVESTORS.map((inv, i) => {
            const Icon = inv.icon;
            const matchCount = investorMatchCounts[inv.id] ?? 0;
            return (
              <motion.div
                key={inv.id}
                variants={itemVariants}
                className="glass rounded-xl p-4 md:p-5 glass-hover cursor-pointer group relative overflow-hidden"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-60"
                  style={{ background: `linear-gradient(90deg, ${inv.color}, transparent)` }} />

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: `${inv.color}18`, color: inv.color }}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] md:text-xs font-bold text-white group-hover:text-[#00E5A8] transition-colors truncate">
                      {inv.name}
                    </div>
                    <div className="text-[13px] md:text-[9px] text-zinc-600">{inv.style}</div>
                  </div>
                </div>

                <p className="text-[13px] md:text-[10px] text-zinc-500 leading-relaxed mb-3 min-h-[2.5em] italic">
                  &ldquo;{inv.quote}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] md:text-[11px] font-bold text-white">{matchCount}</span>
                    <span className="text-[13px] md:text-[9px] text-zinc-600">檔符合</span>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] md:text-[9px] text-zinc-700 group-hover:text-[#00E5A8] transition-colors">
                    <span>策略評分 {inv.score}</span>
                    <ChevronRight size={10} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Top 3 最高共識個股 ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-[#00E5A8]" />
            <h3 className="text-sm font-bold text-white">最高共識個股</h3>
            <span className="text-[13px] md:text-[10px] text-zinc-600">Top 3 Consensus Picks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topStocks.map((stock: any, idx: number) => {
              const grade = consensusGrade(stock.consensus_count ?? 0, totalUniqueInvestors);
              const gradeColor = grade === 'A+' ? '#00E5A8' : grade === 'A' ? '#22D3EE' : '#FBBF24';

              return (
                <motion.div
                  key={stock.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.08, duration: 0.4 }}
                  className="glass rounded-xl p-4 md:p-5 glass-hover group relative overflow-hidden"
                >
                  {/* Rank badge */}
                  <div className="absolute top-3 right-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: idx === 0
                          ? 'linear-gradient(135deg, #00E5A8, #047857)'
                          : idx === 1
                            ? 'linear-gradient(135deg, #22D3EE, #0369A1)'
                            : 'linear-gradient(135deg, #FBBF24, #B45309)',
                        color: '#080B11',
                      }}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Stock name + ticker */}
                  <div className="mb-3">
                    <div className="text-sm font-bold text-white group-hover:text-[#00E5A8] transition-colors">
                      {stock.name}
                    </div>
                    <div className="text-[13px] md:text-[10px] text-zinc-600 font-mono">
                      {stock.id} · {stock.sector}
                    </div>
                  </div>

                  {/* Matched investors checkmarks */}
                  <div className="flex flex-wrap gap-2 md:gap-1.5 mb-3">
                    {FAMOUS_INVESTORS.map(inv => {
                      const matched = stock.consensus?.[inv.id] === true;
                      return (
                        <span
                          key={inv.id}
                          className={`inline-flex items-center gap-1 px-2 md:px-1.5 py-1 md:py-0.5 rounded text-[13px] md:text-[8px] font-medium transition-all ${
                            matched
                              ? 'bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/20'
                              : 'bg-zinc-800/40 text-zinc-700 border border-white/5'
                          }`}
                        >
                          {matched ? (
                            <CheckCircle2 size={14} className="text-[#00E5A8]" />
                          ) : (
                            <span className="w-3.5 h-3.5 md:w-2 md:h-2 rounded-full bg-zinc-800" />
                          )}
                          {inv.name.split(' ').pop()}
                        </span>
                      );
                    })}
                  </div>

                  {/* Consensus score */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] md:text-[10px] text-zinc-600">AI 共識</span>
                      <span className="text-[13px] md:text-[11px] font-mono font-bold text-white">
                        {stock.consensus_count}/{totalUniqueInvestors}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] md:text-[9px] font-bold"
                      style={{
                        background: `${gradeColor}18`,
                        color: gradeColor,
                        border: `1px solid ${gradeColor}30`,
                      }}>
                      綜合評分 {grade}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Summary bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-6 glass rounded-xl px-4 md:px-5 py-3 md:py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00E5A8]/20 to-emerald-800/20 flex items-center justify-center border border-[#00E5A8]/10">
              <Award size={12} className="text-[#00E5A8]" />
            </div>
            <div>
              <span className="text-[13px] md:text-xs font-bold text-white">
                {totalStocksWithConsensus} 檔個股
              </span>
              <span className="text-[13px] md:text-[10px] text-zinc-600 ml-1">
                符合 {totalUniqueInvestors} 位投資大師策略
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="h-1.5 w-full sm:w-24 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00E5A8] to-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(100, (totalMatches / (totalStocksWithConsensus * totalUniqueInvestors || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[13px] md:text-[10px] font-mono text-zinc-600 whitespace-nowrap">
              {totalMatches} 次匹配
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
