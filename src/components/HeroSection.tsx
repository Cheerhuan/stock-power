'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';

const TICKERS = [
  { id: '2330', name: '台積電 TSMC', price: 1040, change: 2.3 },
  { id: 'NVDA', name: 'Nvidia', price: 145.8, change: 3.7 },
  { id: 'AAPL', name: 'Apple', price: 228.5, change: -0.8 },
  { id: 'TSLA', name: 'Tesla', price: 352.1, change: 5.2 },
];

export default function HeroSection() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeTicker, setActiveTicker] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(TICKERS[0].price);

  // Rotate featured ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTicker(prev => (prev + 1) % TICKERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayPrice(TICKERS[activeTicker].price);
  }, [activeTicker]);

  // Chart
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

    const data = [];
    let p = 950;
    for (let i = 0; i < 120; i++) {
      p += (Math.random() - 0.48) * 8;
      data.push({ time: Math.floor(new Date(2026, 0, 1 + i).getTime() / 1000) as any, value: Math.round(p * 100) / 100 });
    }
    areaSeries.setData(data);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, []);

  const current = TICKERS[activeTicker];
  const isUp = current.change > 0;

  return (
    <section className="relative pt-20 pb-8 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/20 text-[#00E5A8] text-[10px] font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
                AI-POWERED INTELLIGENCE
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Stock Power
                <span className="block gradient-text mt-1">AI</span>
              </h1>
              <p className="text-lg text-zinc-500 mt-4 max-w-md leading-relaxed">
                AI-Powered Investment Intelligence Platform. Analyze stocks, track markets, discover opportunities.
              </p>
            </motion.div>

            {/* Ticker showcase */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTicker} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="glass rounded-2xl p-5 max-w-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{current.id}</div>
                    <div className="text-[10px] text-zinc-500">{current.name}</div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isUp ? 'border-[#00FF88]/30 text-[#00FF88] bg-[#00FF88]/10' : 'border-[#FF4D67]/30 text-[#FF4D67] bg-[#FF4D67]/10'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(current.change)}%
                  </div>
                </div>
                <div className={`text-3xl font-bold font-mono ${isUp ? 'text-[#00FF88] glow-up' : 'text-[#FF4D67] glow-down'}`}>
                  ${displayPrice.toFixed(2)}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* CTAs */}
            <div className="flex items-center gap-4 pt-2">
              <button className="px-6 py-3 bg-[#00E5A8] text-[#080B11] text-sm font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-[#00E5A8]/20">
                Start Analysis
              </button>
              <button className="px-6 py-3 glass text-sm font-medium text-zinc-300 rounded-xl hover:text-white transition-all">
                Watch Demo
              </button>
            </div>

            {/* Ticker dots */}
            <div className="flex gap-1.5 pt-2">
              {TICKERS.map((_, i) => (
                <button key={i} onClick={() => setActiveTicker(i)}
                  className={`w-6 h-1 rounded-full transition-all ${i === activeTicker ? 'bg-[#00E5A8] w-8' : 'bg-zinc-800'}`} />
              ))}
            </div>
          </div>

          {/* Right - Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="glass rounded-2xl p-4 animate-pulse-glow">
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
      </div>
    </section>
  );
}
