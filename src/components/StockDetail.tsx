'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StockChart from './StockChart';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Newspaper,
  ChevronDown,
  ChevronUp,
  Brain,
  Users,
  BarChart3,
  Zap,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────── */
function fmt(n: number | null | undefined, dp = 2) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

function pct(n: number | null | undefined) {
  if (n == null) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function trendIcon(v: number | null | undefined) {
  if (v == null) return <Minus size={14} className="text-zinc-500" />;
  if (v > 0) return <TrendingUp size={14} className="text-[#00D26A]" />;
  return <TrendingDown size={14} className="text-[#FF4D6D]" />;
}

/* ─── mini circular gauge ─────────────────────────────────── */
function CircularGauge({
  score,
  advice: adviceProp,
  size = 120,
  strokeWidth = 8,
}: {
  score: number | null; // 0–100 or null
  advice?: string | null;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = score ?? 0;
  const mapped = (safeScore / 100) * 10; // 0-10 scale
  const progress = safeScore / 100;
  const offset = circumference * (1 - progress);

  let advice: string;
  let adviceColor: string;
  if (adviceProp) {
    advice = adviceProp;
    if (/強力買入|strong.*buy/i.test(adviceProp)) adviceColor = '#00D26A';
    else if (/買入|buy/i.test(adviceProp)) adviceColor = '#5B8CFF';
    else if (/持有|hold/i.test(adviceProp)) adviceColor = '#FFD700';
    else if (/賣出|sell/i.test(adviceProp)) adviceColor = '#FF8C00';
    else adviceColor = '#FF4D6D';
  } else if (safeScore >= 80) { advice = '強力買入'; adviceColor = '#00D26A'; }
  else if (safeScore >= 60) { advice = '買入'; adviceColor = '#5B8CFF'; }
  else if (safeScore >= 40) { advice = '持有'; adviceColor = '#FFD700'; }
  else if (safeScore >= 20) { advice = '賣出'; adviceColor = '#FF8C00'; }
  else { advice = '強力賣出'; adviceColor = '#FF4D6D'; }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={adviceColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold text-white font-mono">{mapped.toFixed(1)}</span>
        <span className="text-[10px] text-zinc-500">/ 10</span>
      </div>
      <span
        className="text-xs font-semibold px-3 py-0.5 rounded-full"
        style={{ backgroundColor: adviceColor + '20', color: adviceColor }}
      >
        {advice}
      </span>
    </div>
  );
}

/* ─── main component ──────────────────────────────────────── */
export default function StockDetail({
  stock,
  stockData,
}: {
  stock: any;
  stockData: any;
}) {
  const [expandedNews, setExpandedNews] = useState<number | null>(null);

  /* ─── derive display values ───────────────────────────── */
  const name = stock?.name ?? '台積電';
  const ticker = stock?.ticker ?? '2330.TW';
  const price = stock?.price ?? 0;
  const change = stock?.changePct ?? 0;
  const isUp = change >= 0;

  const pe = stock?.pe ?? null;
  const eps = stock?.eps ?? null;
  const yield_ = stock?.dividend_yield ?? null;
  const revGrowth = stock?.revenue_growth ?? null;
  const foreignOwn = stock?.foreign_position ?? null;
  const marginRatio = stock?.margin_ratio ?? null;

  const score = stock?.score != null ? (stock.score / 6) * 100 : null;
  const risk = stock?.risk_score ?? null;
  const advice = stock?.advice ?? null;

  /* ─── 三大法人即時資料（從 TWSE API 抓） ─────────── */
  const [instData, setInstData] = useState<{
    foreign: number;
    investment_trust: number;
    dealer_total: number;
  } | null>(null);
  const [instLoading, setInstLoading] = useState(false);

  useEffect(() => {
    const sid = stock?.id;
    if (!sid) return;
    setInstLoading(true);
    fetch(`/api/institutional?stockId=${sid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setInstData({
            foreign: data.foreign ?? 0,
            investment_trust: data.investment_trust ?? 0,
            dealer_total: data.dealer_total ?? 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setInstLoading(false));
  }, [stock?.id]);

  // 合併：優先使用即時 API 資料，否則 fallback 到 stock-data.json
  const liveInstNet = instData
    ? instData
    : null;

  // consensus: 支援物件 {key: bool} 和陣列 [{name, key, color, match}]
  const consensusList = stock?.consensus
    ? (Array.isArray(stock.consensus)
        ? stock.consensus
        : Object.entries(stock.consensus).map(([key, match]) => ({
            key,
            name: ({ buffett: '巴菲特', lynch: '林區', munger: '芒格', graham: '葛拉漢', dalio: '達利歐', simons: '西蒙斯', soros: '索羅斯' } as any)[key] ?? key,
            color: ({ buffett: '#5B8CFF', lynch: '#00D26A', munger: '#FFD700', graham: '#38BDF8', dalio: '#FF6B6B', simons: '#A855F7', soros: '#FF8C00' } as any)[key] ?? '#5B8CFF',
            match: !!match,
          })))
    : []

  const stats = [
    { label: '本益比', value: pe != null ? fmt(pe, 1) : '—', trend: pe != null ? (pe < 20 ? 1 : pe > 30 ? -1 : 0) : 0 },
    { label: 'EPS', value: eps != null ? `$${fmt(eps)}` : '—', trend: eps != null ? (eps > 5 ? 1 : -1) : 0 },
    { label: '殖利率', value: yield_ != null ? pct(yield_) : '—', trend: yield_ != null ? (yield_ > 3 ? 1 : yield_ > 1 ? 0 : -1) : 0 },
    { label: '營收成長', value: revGrowth != null ? pct(revGrowth) : '—', trend: revGrowth != null ? (revGrowth > 10 ? 1 : revGrowth > 0 ? 0 : -1) : 0 },
    { label: '外資占比', value: foreignOwn != null ? fmt(foreignOwn, 1) + '%' : '—', trend: foreignOwn != null ? (foreignOwn > 40 ? 1 : -1) : 0 },
    { label: '融資比', value: marginRatio != null ? fmt(marginRatio, 1) + '%' : '—', trend: marginRatio != null ? (marginRatio < 30 ? 1 : -1) : 0 },
  ];

  const sentimentColors: Record<string, string> = {
    positive: '#00D26A',
    negative: '#FF4D6D',
    neutral: '#FFD700',
  };

  const sentimentLabels: Record<string, string> = {
    positive: '正面',
    negative: '負面',
    neutral: '中性',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full overflow-y-auto scrollbar-none px-4 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* ── 1. Stock Identity Bar ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#0E1119] rounded-xl p-4 border border-[var(--card-border)]"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{name}</h2>
              <span className="text-xs text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded font-mono">
                {ticker}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-bold text-white font-mono tracking-tight">
                ${fmt(price)}
              </span>
              <span
                className={`text-lg font-semibold font-mono ${isUp ? 'text-[#00D26A]' : 'text-[#FF4D6D]'}`}
              >
                {pct(change)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isUp ? (
              <TrendingUp size={20} className="text-[#00D26A]" />
            ) : (
              <TrendingDown size={20} className="text-[#FF4D6D]" />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
          <span className="text-[11px] bg-[#5B8CFF]/10 text-[#5B8CFF] px-2 py-0.5 rounded font-medium">
            PE {fmt(pe, 1)}
          </span>
          <span className="text-[11px] bg-[#00D26A]/10 text-[#00D26A] px-2 py-0.5 rounded font-medium">
            EPS {fmt(eps)}
          </span>
          <span className="text-[11px] bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded font-medium">
            Yield {pct(yield_)}
          </span>
        </div>
      </motion.div>

      {/* ── 2. K 線圖 ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#131A24] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden"
      >
        <StockChart stockId={stock?.id ?? '2330'} stockName={name} height={360} />
      </motion.div>

      {/* ── 3. AI Score ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#0E1119] rounded-xl p-4 border border-[var(--card-border)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-[var(--aurora-indigo)]" />
          <span className="text-sm font-semibold text-white">AI 評分</span>
        </div>
        <div className="flex items-center justify-around">
          <div className="relative flex flex-col items-center">
            <CircularGauge score={score} advice={advice} size={110} strokeWidth={7} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-400">風險評分</span>
            <div className="w-28 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk ?? 0}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: risk != null ? (risk < 30 ? '#00D26A' : risk < 60 ? '#FFD700' : '#FF4D6D') : '#71717a',
                }}
              />
            </div>
            <span
              className="text-lg font-bold font-mono mt-1"
              style={{
                color: risk != null ? (risk < 30 ? '#00D26A' : risk < 60 ? '#FFD700' : '#FF4D6D') : '#71717a',
              }}
            >
              {risk != null ? `${risk}/100` : '—'}
            </span>
            <span className="text-[10px] text-zinc-500">低風險 → 高風險</span>
          </div>
        </div>
      </motion.div>

      {/* ── 4. Quick Stats Grid ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0E1119] rounded-xl p-4 border border-[var(--card-border)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-[var(--aurora-indigo)]" />
          <span className="text-sm font-semibold text-white">關鍵指標</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-black/20 rounded-lg p-2.5 border border-[rgba(255,255,255,0.03)]"
            >
              <div className="text-[10px] text-zinc-500 mb-0.5">{s.label}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white font-mono">{s.value}</span>
                {s.trend === 1 && <TrendingUp size={12} className="text-[#00D26A]" />}
                {s.trend === -1 && <TrendingDown size={12} className="text-[#FF4D6D]" />}
                {s.trend === 0 && <Minus size={12} className="text-zinc-500" />}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── 5. Institutional Flow ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-[#0E1119] rounded-xl p-4 border border-[var(--card-border)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={16} className="text-[var(--aurora-indigo)]" />
          <span className="text-sm font-semibold text-white">三大法人</span>
        </div>
        <div className="space-y-2.5">
          {instLoading ? (
            <div className="flex items-center justify-center py-3">
              <div className="w-4 h-4 border-2 border-[#5B8CFF] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-500 ml-2">載入中...</span>
            </div>
          ) : (
            (liveInstNet ? [
                { label: '外資', netBuy: liveInstNet.foreign ?? 0, color: '#00D26A' },
                { label: '投信', netBuy: liveInstNet.investment_trust ?? 0, color: '#00D26A' },
                { label: '自營商', netBuy: liveInstNet.dealer_total ?? 0, color: '#FF4D6D' },
              ] : []
            ).map((inst) => {
            const absVal = Math.abs(inst.netBuy);
            const maxVal = Math.max(...(
              liveInstNet
                ? [Math.abs(liveInstNet.foreign ?? 0), Math.abs(liveInstNet.investment_trust ?? 0), Math.abs(liveInstNet.dealer_total ?? 0)]
                : [1]
            ), 1);
            const barWidth = (absVal / maxVal) * 100;
            const isPositive = inst.netBuy >= 0;
            return (
              <div key={inst.label} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-10 shrink-0">{inst.label}</span>
                <div className="flex-1 h-4 bg-black/40 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    className={`h-full rounded-full ${isPositive ? 'ml-auto' : ''}`}
                    style={{
                      backgroundColor: isPositive ? '#00D26A' : '#FF4D6D',
                      marginLeft: isPositive ? 'auto' : undefined,
                      marginRight: isPositive ? undefined : 'auto',
                    }}
                  />
                </div>
                <div className="flex items-center gap-1 w-24 justify-end shrink-0">
                  {isPositive ? (
                    <TrendingUp size={12} className="text-[#00D26A]" />
                  ) : (
                    <TrendingDown size={12} className="text-[#FF4D6D]" />
                  )}
                  <span
                    className={`text-xs font-mono font-semibold ${isPositive ? 'text-[#00D26A]' : 'text-[#FF4D6D]'}`}
                  >
                    {isPositive ? '+' : ''}{inst.netBuy.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          }))}
        </div>
      </motion.div>

      {/* ── 6. News Intelligence ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0E1119] rounded-xl p-4 border border-[var(--card-border)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Newspaper size={16} className="text-[var(--aurora-indigo)]" />
          <span className="text-sm font-semibold text-white">新聞動態</span>
        </div>
        <div className="space-y-2">
          {(stockData?._news ?? []).map((news: any, i: number) => {
            const isExpanded = expandedNews === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="bg-black/20 rounded-lg p-2.5 border border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-black/30 transition-colors"
                onClick={() => setExpandedNews(isExpanded ? null : i)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white leading-relaxed line-clamp-2">
                      {news.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-zinc-500">{news.source}</span>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: sentimentColors[news.sentiment] + '20',
                          color: sentimentColors[news.sentiment],
                        }}
                      >
                        {sentimentLabels[news.sentiment]}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-zinc-500" />
                    ) : (
                      <ChevronDown size={14} className="text-zinc-500" />
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[11px] text-zinc-400 mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)] leading-relaxed overflow-hidden"
                    >
                      {news.summary}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── 7. AI Consensus ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-[#0E1119] rounded-xl p-4 border border-[var(--card-border)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-[var(--aurora-indigo)]" />
          <span className="text-sm font-semibold text-white">AI 共識 — 誰會買這檔？</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {consensusList.length === 0 ? (
            <span className="text-xs text-zinc-600">暫無 AI 共識資料</span>
          ) : consensusList.map((inv: any, idx: number) => (
            <motion.div
              key={inv.key ?? idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + idx * 0.06 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                inv.match
                  ? 'border-[rgba(255,255,255,0.12)] bg-white/5'
                  : 'border-[rgba(255,255,255,0.04)] bg-black/20 opacity-40'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: inv.color ?? '#5B8CFF' }}
              />
              <span className={inv.match ? 'text-zinc-300' : 'text-zinc-600'}>
                {inv.name}
              </span>
              {inv.match && (
                <Zap size={10} className="text-[#FFD700]" />
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF]" />
            <span>匹配</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>不匹配</span>
          </div>
        </div>
      </motion.div>

      {/* ── bottom spacer for scroll ─────────────────────── */}
      <div className="h-2" />
    </motion.div>
  );
}
