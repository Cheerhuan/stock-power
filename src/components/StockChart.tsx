'use client';
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';

export default function StockChart({ stock }: { stock: any }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const prices = stock?.prices || [];

  useEffect(() => {
    if (!chartRef.current || prices.length < 2) return;

    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#09090b' }, textColor: '#a1a1aa', fontSize: 11 },
      grid: { vertLines: { color: '#18181b' }, horzLines: { color: '#18181b' } },
      width: chartRef.current.clientWidth,
      height: 320,
      timeScale: { borderVisible: false, timeVisible: true },
      rightPriceScale: { borderVisible: false },
      crosshair: { vertLine: { color: '#52525b', style: 2 }, horzLine: { color: '#52525b', style: 2 } },
    });

    // Use daily timestamps (seconds since epoch) — no ambiguity
    const baseTs = Math.floor(new Date(2026, 4, 1).getTime() / 1000); // May 1, 2026

    const candleData = prices.slice(0, 60).map((p: number, i: number) => {
      const o = p * (1 + (Math.random() - 0.5) * 0.02);
      const c = p * (1 + (Math.random() - 0.5) * 0.02);
      return {
        time: baseTs + i * 86400, // +1 day per candle
        open: o,
        high: Math.max(o, c) * 1.005,
        low: Math.min(o, c) * 0.995,
        close: c,
      };
    });
    candleData[candleData.length - 1].close = prices[prices.length - 1];

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', downColor: '#f43f5e', borderVisible: false,
      wickUpColor: '#10b981', wickDownColor: '#f43f5e',
    });
    candleSeries.setData(candleData);

    // MA5
    const ma5 = chart.addSeries(LineSeries, { color: '#818cf8', lineWidth: 1, lineStyle: 1 });
    const ma5Data = candleData.map((d: any, i: number) => {
      const vals = candleData.slice(Math.max(0, i - 4), i + 1).map((x: any) => x.close);
      return { time: d.time, value: vals.reduce((a: number, b: number) => a + b, 0) / vals.length };
    });
    ma5.setData(ma5Data);

    chart.timeScale().fitContent();

    const resize = () => { if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth }); };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); chart.remove(); };
  }, [prices]);

  return <div ref={chartRef} className="w-full" />;
}
