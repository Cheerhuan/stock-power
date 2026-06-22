'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
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

/* ─── random demo data ────────────────────────────────────── */
function randomDataPoints(n = 120) {
  let v = 150 + Math.random() * 50;
  const points: { time: string; value: number }[] = [];
  const now = new Date();
  for (let i = n; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    v += (Math.random() - 0.48) * 4;
    v = Math.max(v, 80);
    points.push({ time: Math.floor(d.getTime() / 1000) as any, value: Math.round(v * 100) / 100 });
  }
  return points;
}

const DEMO_PRICES = randomDataPoints(120);
const LATEST_PRICE = DEMO_PRICES[DEMO_PRICES.length - 1]?.value ?? 0;
const PREV_CLOSE = DEMO_PRICES[DEMO_PRICES.length - 2]?.value ?? LATEST_PRICE;
const DEMO_CHANGE = ((LATEST_PRICE - PREV_CLOSE) / PREV_CLOSE) * 100;

const DEMO_PE = 22.4;
const DEMO_EPS = 8.15;
const DEMO_YIELD = 2.8;
const DEMO_REV_GROWTH = 15.3;
const DEMO_FOREIGN = 42.7;
const DEMO_MARGIN = 31.2;

const DEMO_SCORE = 78; // 0-100
const DEMO_RISK = 32; // 0-100

const INSTITUTIONS = [
  { label: '外資', netBuy: 1245, color: '#00D26A' },
  { label: '投信', netBuy: 312, color: '#00D26A' },
  { label: '自營商', netBuy: -187, color: '#FF4D6D' },
];

const NEWS_ITEMS = [
  { title: '台積電法說會展望優於預期，外資調高目標價', source: '經濟日報', sentiment: 'positive', summary: '台積電昨日法說會公布第三季財報優於預期，多家外資券商調高目標價至800元以上。' },
  { title: 'AI 需求持續強勁，供應鏈拉貨動能增溫', source: '工商時報', sentiment: 'positive', summary: '受惠於AI伺服器需求暢旺，相關供應鏈業績持續增溫，預期下半年營運表現可期。' },
  { title: '市場觀望聯準會利率決策，台股量縮整理', source: '鉅亨網', sentiment: 'neutral', summary: '聯準會即將公布最新利率決策，市場觀望氣氛濃厚，台股今日量縮震盪整理。' },
];

const INVESTORS = [
  { name: '巴菲特', key: 'buffett', color: '#5B8CFF', match: true },
  { name: '林區', key: 'lynch', color: '#00D26A', match: false },
  { name: '芒格', key: 'munger', color: '#FFD700', match: true },
  { name: '達利歐', key: 'dalio', color: '#FF6B6B', match: false },
  { name: '西蒙斯', key: 'simons', color: '#A855F7', match: true },
  { name: '葛拉漢', key: 'graham', color: '#38BDF8', match: false },
];

/* ─── mini circular gauge ─────────────────────────────────── */
function CircularGauge({
  score,
  size = 120,
  strokeWidth = 8,
}: {
  score: number; // 0–100
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const mapped = (score / 100) * 10; // 0-10 scale
  const progress = score / 100;
  const offset = circumference * (1 - progress);

  let advice: string;
  let adviceColor: string;
  if (score >= 80) { advice = '強力買入'; adviceColor = '#00D26A'; }
  else if (score >= 60) { advice = '買入'; adviceColor = '#5B8CFF'; }
  else if (score >= 40) { advice = '持有'; adviceColor = '#FFD700'; }
  else if (score >= 20) { advice = '賣出'; adviceColor = '#FF8C00'; }
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [expandedNews, setExpandedNews] = useState<number | null>(null);

  /* ─── chart ────────────────────────────────────────────── */
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#71717a',
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 320,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        tickMarkFormatter: (t: number) => {
          const d = new Date(t * 1000);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.05, bottom: 0.1 },
      },
      crosshair: {
        vertLine: { color: '#5B8CFF', style: 2, width: 1, labelBackgroundColor: '#5B8CFF' },
        horzLine: { color: '#5B8CFF', style: 2, width: 1, labelBackgroundColor: '#5B8CFF' },
      },
      handleScroll: false,
      handleScale: false,
    });

    // Convert demo data to chart format
    const data = DEMO_PRICES.map((p) => ({ time: p.time as any, value: p.value }));

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#5B8CFF',
      topColor: 'rgba(91, 140, 255, 0.35)',
      bottomColor: 'rgba(91, 140, 255, 0.01)',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#5B8CFF',
      crosshairMarkerBackgroundColor: '#131A24',
      priceLineVisible: false,
      lastValueVisible: true,
    });
    areaSeries.setData(data);

    chart.timeScale().fitContent();

    const resize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.remove();
    };
  }, []);

  /* ─── derive display values ───────────────────────────── */
  const name = stock?.name ?? '台積電';
  const ticker = stock?.ticker ?? '2330.TW';
  const price = stock?.price ?? LATEST_PRICE;
  const change = stock?.change ?? DEMO_CHANGE;
  const isUp = change >= 0;

  const pe = stock?.pe ?? DEMO_PE;
  const eps = stock?.eps ?? DEMO_EPS;
  const yield_ = stock?.dividend_yield ?? DEMO_YIELD;
  const revGrowth = stock?.revenue_growth ?? DEMO_REV_GROWTH;
  const foreignOwn = stock?.foreign_ownership ?? DEMO_FOREIGN;
  const marginRatio = stock?.margin_ratio ?? DEMO_MARGIN;

  const score = stock?.score != null ? (stock.score / 6) * 100 : DEMO_SCORE;
  const risk = stock?.risk_score ?? DEMO_RISK;

  const stats = [
    { label: '本益比', value: fmt(pe, 1), trend: pe < 20 ? 1 : pe > 30 ? -1 : 0 },
    { label: 'EPS', value: `$${fmt(eps)}`, trend: eps > 5 ? 1 : -1 },
    { label: '殖利率', value: pct(yield_), trend: yield_ > 3 ? 1 : yield_ > 1 ? 0 : -1 },
    { label: '營收成長', value: pct(revGrowth), trend: revGrowth > 10 ? 1 : revGrowth > 0 ? 0 : -1 },
    { label: '外資占比', value: fmt(foreignOwn, 1) + '%', trend: foreignOwn > 40 ? 1 : -1 },
    { label: '融資比', value: fmt(marginRatio, 1) + '%', trend: marginRatio < 30 ? 1 : -1 },
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
      className="h-full overflow-y-auto scrollbar-none px-5 py-4 space-y-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* ── 1. Stock Identity Bar ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#131A24] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{name}</h2>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded font-mono">
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
        <div className="flex gap-2 mt-3">
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

      {/* ── 2. Chart ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#131A24] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden"
      >
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-medium">走勢圖</span>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="px-2 py-0.5 rounded bg-zinc-800">1M</span>
            <span className="px-2 py-0.5 rounded bg-[#5B8CFF]/20 text-[#5B8CFF]">3M</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800">6M</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800">1Y</span>
          </div>
        </div>
        <div ref={chartContainerRef} className="w-full -ml-0.5" />
      </motion.div>

      {/* ── 3. AI Score ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#131A24] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-[#5B8CFF]" />
          <span className="text-sm font-semibold text-white">AI 評分</span>
        </div>
        <div className="flex items-center justify-around">
          <div className="relative flex flex-col items-center">
            <CircularGauge score={score} size={110} strokeWidth={7} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-400">風險評分</span>
            <div className="w-28 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: risk < 30 ? '#00D26A' : risk < 60 ? '#FFD700' : '#FF4D6D',
                }}
              />
            </div>
            <span
              className="text-lg font-bold font-mono mt-1"
              style={{
                color: risk < 30 ? '#00D26A' : risk < 60 ? '#FFD700' : '#FF4D6D',
              }}
            >
              {risk}/100
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
        className="bg-[#131A24] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-[#5B8CFF]" />
          <span className="text-sm font-semibold text-white">關鍵指標</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-black/30 rounded-lg p-2.5 border border-[rgba(255,255,255,0.04)]"
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
        className="bg-[#131A24] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={16} className="text-[#5B8CFF]" />
          <span className="text-sm font-semibold text-white">三大法人</span>
        </div>
        <div className="space-y-2.5">
          {INSTITUTIONS.map((inst) => {
            const absVal = Math.abs(inst.netBuy);
            const maxAbs = Math.max(...INSTITUTIONS.map((i) => Math.abs(i.netBuy)));
            const barWidth = (absVal / maxAbs) * 100;
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
          })}
        </div>
      </motion.div>

      {/* ── 6. News Intelligence ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#131A24] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Newspaper size={16} className="text-[#5B8CFF]" />
          <span className="text-sm font-semibold text-white">新聞動態</span>
        </div>
        <div className="space-y-2">
          {NEWS_ITEMS.map((news, i) => {
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
        className="bg-[#131A24] rounded-xl p-4 border border-[rgba(255,255,255,0.08)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-[#5B8CFF]" />
          <span className="text-sm font-semibold text-white">AI 共識 — 誰會買這檔？</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {INVESTORS.map((inv) => (
            <motion.div
              key={inv.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + INVESTORS.indexOf(inv) * 0.06 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                inv.match
                  ? 'border-[rgba(255,255,255,0.12)] bg-white/5'
                  : 'border-[rgba(255,255,255,0.04)] bg-black/20 opacity-40'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: inv.color }}
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
