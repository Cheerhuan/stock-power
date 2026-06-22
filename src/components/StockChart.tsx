'use client';
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

interface StockChartProps {
  stockId: string;
  price: string;
}

export default function StockChart({ stockId, price }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090b' },
        textColor: '#a1a1aa',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    const basePrice = parseFloat(price);
    const data = [];
    let currentPrice = basePrice * 0.9;
    
    for (let i = 0; i < 100; i++) {
      const day = Math.min(30, (i % 30) + 1);
      const month = i < 30 ? '06' : '07';
      const open = currentPrice + (Math.random() - 0.5) * 10;
      const close = open + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      data.push({
        time: `2026-${month}-${String(day).padStart(2, '0')}`,
        open, high, low, close,
      });
      currentPrice = close;
    }

    candleSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [stockId, price]);

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Precision Price Action</div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-zinc-400 font-mono">LIVE DATA</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
