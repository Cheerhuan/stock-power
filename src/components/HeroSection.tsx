'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';

/* ── Ticker Data ── */
const TICKERS = [
  { id: '2330', name: '台積電 TSMC', price: 1040, change: 2.3 },
  { id: 'NVDA', name: 'Nvidia', price: 145.8, change: 3.7 },
  { id: 'AAPL', name: 'Apple', price: 228.5, change: -0.8 },
  { id: 'TSLA', name: 'Tesla', price: 352.1, change: 5.2 },
];

/* ── Helpers ── */

/** Get current Taipei time components */
function getTaipeiNow() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const timeStr = formatter.format(now);

  // Also get total seconds since midnight in Taipei
  const taipeiParts = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const h = parseInt(taipeiParts.find(p => p.type === 'hour')?.value || '0', 10);
  const m = parseInt(taipeiParts.find(p => p.type === 'minute')?.value || '0', 10);
  const s = parseInt(taipeiParts.find(p => p.type === 'second')?.value || '0', 10);
  const totalSec = h * 3600 + m * 60 + s;

  return { timeStr, h, m, s, totalSec, now };
}

/** Describe TW market status + countdown target */
function getTWMarketStatus(totalSec: number) {
  const OPEN = 9 * 3600;       // 09:00
  const CLOSE = 13.5 * 3600;   // 13:30

  if (totalSec < OPEN) {
    const diff = OPEN - totalSec;
    return {
      label: '台股即將開盤',
      color: 'text-[#FFC857]',
      countdown: formatCountdown(diff),
      nextLabel: '距離開盤',
    };
  }
  if (totalSec < CLOSE) {
    const diff = CLOSE - totalSec;
    return {
      label: '台股交易中',
      color: 'text-[#00FF88]',
      countdown: formatCountdown(diff),
      nextLabel: '距離收盤',
    };
  }
  // After close — countdown to next 09:00
  const nextOpen = (24 * 3600 - totalSec) + OPEN;
  return {
    label: '台股已收盤',
    color: 'text-[#FF4D67]',
    countdown: formatCountdown(nextOpen),
    nextLabel: '距離開盤',
  };
}

/** Describe US (NASDAQ) market status */
function getUSMarketStatus() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const etSec = et.getHours() * 3600 + et.getMinutes() * 60 + et.getSeconds();
  const isWeekend = et.getDay() === 0 || et.getDay() === 6;
  // NASDAQ regular hours: 09:30 – 16:00 ET
  const US_OPEN = 9.5 * 3600;   // 09:30
  const US_CLOSE = 16 * 3600;   // 16:00

  if (isWeekend) return { label: '美股休市中', color: 'text-zinc-500' };
  if (etSec >= US_OPEN && etSec < US_CLOSE) return { label: '美股交易中', color: 'text-[#00FF88]' };
  return { label: '美股已收盤', color: 'text-zinc-500' };
}

function formatCountdown(sec: number) {
  const hh = Math.floor(sec / 3600);
  const mm = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/* ── Fear & Greed Gauge ── */
function FearGreedGauge({ value }: { value: number }) {
  const r = 80;               // radius
  const cx = 100, cy = 100;  // center
  const strokeW = 16;
  const startAngle = 180;    // degrees (left)
  const endAngle = 0;        // degrees (right)
  const arcLen = 180;        // total arc degrees

  // Polar to cartesian
  function polar(cx: number, cy: number, r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  // Background arc path
  const bgStart = polar(cx, cy, r, startAngle);
  const bgEnd = polar(cx, cy, r, endAngle);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 0 ${bgEnd.x} ${bgEnd.y}`;

  // Value arc — map 0..100 to arc
  const valDeg = startAngle - (value / 100) * arcLen; // 100 → 0°, 0 → 180°
  const valStart = polar(cx, cy, r, startAngle);
  const valEnd = polar(cx, cy, r, valDeg);
  const largeArc = (value / 100) > 0.5 ? 1 : 0;
  const valPath = `M ${valStart.x} ${valStart.y} A ${r} ${r} 0 ${largeArc} 0 ${valEnd.x} ${valEnd.y}`;

  const fillColor = value < 40 ? '#FF4D67' : value < 60 ? '#FFC857' : '#00FF88';

  // Label
  const label = value < 25 ? '極度恐懼' : value < 40 ? '恐懼' : value < 60 ? '中性' : value < 75 ? '貪婪' : '極度貪婪';

  return (
    <svg width="200" height="120" viewBox="0 0 200 130" className="overflow-visible">
      <defs>
        <linearGradient id="fearGreedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4D67" />
          <stop offset="50%" stopColor="#FFC857" />
          <stop offset="100%" stopColor="#00FF88" />
        </linearGradient>
      </defs>

      {/* Background arc */}
      <path d={bgPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} strokeLinecap="round" />

      {/* Value arc */}
      <motion.path
        d={valPath}
        fill="none"
        stroke="url(#fearGreedGrad)"
        strokeWidth={strokeW}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: value / 100 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const deg = startAngle - (tick / 100) * arcLen;
        const outer = polar(cx, cy, r + 2, deg);
        const inner = polar(cx, cy, r - 14, deg);
        return (
          <React.Fragment key={tick}>
            <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x={polar(cx, cy, r - 24, deg).x} y={polar(cx, cy, r - 24, deg).y}
              textAnchor="middle" dominantBaseline="middle"
              className="text-[8px]" fill="rgba(255,255,255,0.25)" fontFamily="monospace">
              {tick}
            </text>
          </React.Fragment>
        );
      })}

      {/* Center value */}
      <motion.text
        x={cx} y={cy}
        textAnchor="middle" dominantBaseline="middle"
        className="text-[28px] font-bold" fill={fillColor} fontFamily="monospace"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {value}
      </motion.text>
      <text x={cx} y={cy + 24}
        textAnchor="middle" dominantBaseline="middle"
        className="text-[9px] font-medium" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">
        {label}
      </text>
    </svg>
  );
}

/* ── Component ── */
interface Props {
  stockData?: any;
}

export default function HeroSection({ stockData }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeTicker, setActiveTicker] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(TICKERS[0].price);
  const [taipeiTime, setTaipeiTime] = useState(getTaipeiNow);
  const [mounted, setMounted] = useState(false);

  // Hydration safety
  useEffect(() => { setMounted(true); }, []);

  // Taipei clock — tick every second
  useEffect(() => {
    const id = setInterval(() => setTaipeiTime(getTaipeiNow()), 1000);
    return () => clearInterval(id);
  }, []);

  // Rotate featured ticker every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTicker(prev => (prev + 1) % TICKERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayPrice(TICKERS[activeTicker].price);
  }, [activeTicker]);

  // lightweight-charts sparkline (right side)
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#080B11' }, textColor: '#4B5563', fontSize: 10 },
      grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
      width: chartRef.current.clientWidth,
      height: 320,
      timeScale: { borderVisible: false, visible: false },
      rightPriceScale: { borderVisible: false, visible: false },
      leftPriceScale: { visible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });

    const areaSeries = chart.addSeries(LineSeries, {
      color: '#00E5A8',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
    });

    const data: any[] = [];
    let p = 950;
    for (let i = 0; i < 120; i++) {
      p += (Math.random() - 0.48) * 8;
      data.push({ time: Math.floor(new Date(2026, 0, 1 + i).getTime() / 1000), value: Math.round(p * 100) / 100 });
    }
    areaSeries.setData(data);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, []);

  // Derived data
  const { totalSec, timeStr } = taipeiTime;
  const twMarket = getTWMarketStatus(totalSec);
  const usMarket = getUSMarketStatus();
  const current = TICKERS[activeTicker];
  const isUp = current.change > 0;

  // Stock data from props
  const market = stockData?._market || {};
  const fearGreed = market.fear_greed ?? 45;
  const aiScore = market.ai_market_score ?? 88;

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen pt-24 pb-12 overflow-hidden flex flex-col">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,229,168,0.04) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,229,168,0.025) 0%, transparent 70%)' }} />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 w-full flex-1 flex flex-col">
        {/* ── Status Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-4 mb-8"
        >
          {/* Taipei Clock */}
          <div className="glass-sm rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
              <span className="text-[10px] font-medium text-zinc-400">TPE</span>
            </div>
            <span className="text-sm font-mono font-bold text-white tracking-wider">{timeStr}</span>
          </div>

          {/* TW Market Status */}
          <div className="glass-sm rounded-xl px-4 py-2 flex items-center gap-2">
            <span className={`text-[10px] font-semibold ${twMarket.color}`}>{twMarket.label}</span>
            <span className="text-[10px] font-mono text-zinc-500">
              {twMarket.nextLabel} {twMarket.countdown}
            </span>
          </div>

          {/* US Market Status */}
          <div className="glass-sm rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <span className={`text-[10px] font-semibold ${usMarket.color}`}>{usMarket.label}</span>
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-center flex-1">
          {/* ── Left Column ── */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/20 text-[#00E5A8] text-[10px] font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
                AI-POWERED INTELLIGENCE
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Stock Power
                <span className="block gradient-text mt-1">AI</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base lg:text-lg text-zinc-500 mt-4 max-w-md leading-relaxed">
                AI-powered investment intelligence platform. Analyze stocks, track markets,
                and discover opportunities with real-time data.
              </p>
            </motion.div>

            {/* ── Live Ticker Showcase ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTicker}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl p-5 max-w-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{current.id}</div>
                    <div className="text-[10px] text-zinc-500">{current.name}</div>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isUp
                        ? 'border-[#00FF88]/30 text-[#00FF88] bg-[#00FF88]/10'
                        : 'border-[#FF4D67]/30 text-[#FF4D67] bg-[#FF4D67]/10'
                    }`}
                  >
                    {isUp ? '▲' : '▼'} {Math.abs(current.change)}%
                  </div>
                </div>
                <div
                  className={`text-3xl font-bold font-mono ${
                    isUp ? 'text-[#00FF88] glow-up' : 'text-[#FF4D67] glow-down'
                  }`}
                >
                  ${displayPrice.toFixed(2)}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Ticker Dots ── */}
            <div className="flex gap-1.5">
              {TICKERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTicker(i)}
                  className={`w-6 h-1 rounded-full transition-all ${
                    i === activeTicker ? 'bg-[#00E5A8] w-8' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            {/* ── CTA Buttons ── */}
            <div className="flex items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-[#00E5A8] text-[#080B11] text-sm font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-[#00E5A8]/20"
              >
                開始分析
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 glass text-sm font-medium text-zinc-300 rounded-xl hover:text-white transition-all"
              >
                觀看演示
              </motion.button>
            </div>
          </div>

          {/* ── Right Column — Chart ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass rounded-2xl p-4 animate-pulse-glow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium text-zinc-500">TAIWAN WEIGHTED INDEX</span>
                <span className="text-[11px] font-bold text-[#00FF88]">▲ 1.17%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
                <span className="text-[9px] text-zinc-600">LIVE</span>
              </div>
            </div>
            <div ref={chartRef} className="w-full" />
          </motion.div>
        </div>

        {/* ── Bottom Row — Fear & Greed + AI Score ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8"
        >
          {/* Fear & Greed */}
          <div className="glass rounded-2xl p-5 flex items-center gap-6">
            <FearGreedGauge value={fearGreed} />
            <div className="space-y-1">
              <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Fear &amp; Greed Index</div>
              <div className="text-lg font-bold text-white">
                {fearGreed < 25 ? '極度恐懼' : fearGreed < 40 ? '恐懼' : fearGreed < 60 ? '中性' : fearGreed < 75 ? '貪婪' : '極度貪婪'}
              </div>
              <div className="text-xs text-zinc-500">Taiwan Weighted Market Sentiment</div>
            </div>
          </div>

          {/* AI Market Score */}
          <div className="glass rounded-2xl p-5 flex items-center gap-6">
            <div className="relative w-[88px] h-[88px] flex items-center justify-center">
              <svg width="88" height="88" viewBox="0 0 88 88" className="absolute inset-0">
                <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <motion.circle
                  cx="44" cy="44" r="38"
                  fill="none"
                  stroke="url(#fearGreedGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 38 * (1 - aiScore / 100),
                  }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  transform="rotate(-90 44 44)"
                />
              </svg>
              <span className="relative text-xl font-bold font-mono text-white">{aiScore}</span>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">AI Market Score</div>
              <div className="text-lg font-bold text-white">
                {aiScore >= 80 ? 'Strong Bullish' : aiScore >= 60 ? 'Bullish' : aiScore >= 40 ? 'Neutral' : aiScore >= 20 ? 'Bearish' : 'Strong Bearish'}
              </div>
              <div className="text-xs text-zinc-500">Proprietary AI Model Prediction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
