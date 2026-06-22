'use client';
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries, AreaSeries } from 'lightweight-charts';

interface MarketOverviewProps {
  stockData: Record<string, any>;
}

export default function MarketOverview({ stockData }: MarketOverviewProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const market = stockData?._market || {};
  const hist = stockData?._taiex_history || [];
  const sectors = stockData?._sectors || {};
  const concepts = stockData?._concepts || {};

  useEffect(() => {
    if (!chartRef.current || hist.length === 0) return;
    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#09090b' }, textColor: '#a1a1aa', fontSize: 11 },
      grid: { vertLines: { color: '#18181b' }, horzLines: { color: '#18181b' } },
      width: chartRef.current.clientWidth,
      height: 200,
      timeScale: { borderVisible: false, timeVisible: false },
      rightPriceScale: { borderVisible: false },
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#818cf8', topColor: '#818cf840', bottomColor: '#09090b00', lineWidth: 2,
    });
    const baseTs = Math.floor(new Date(2026, 4, 1).getTime() / 1000);
    series.setData(hist.map((v: number, i: number) => ({
      time: baseTs + i * 86400,
      value: v,
    })));
    chart.timeScale().fitContent();
    const resize = () => { if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth }); };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); chart.remove(); };
  }, [hist]);

  return (
    <div className="space-y-6">
      {/* TAIEX + KPI Cards */}
      <div className="flex items-center gap-6 flex-wrap">
        <div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">加權指數</div>
          <div className="text-3xl font-bold text-white font-mono tracking-tight">{(market.taiex || 28000).toLocaleString()}</div>
          <div className={`text-sm font-medium ${(market.taiex_chg || 0) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {market.taiex_chg > 0 ? '▲' : '▼'} {Math.abs(market.taiex_chg || 0).toFixed(2)}%
          </div>
        </div>
        <div className="h-12 w-px bg-zinc-800" />
        <div><div className="text-[10px] text-zinc-600 mb-1">成交金額</div><div className="text-sm font-semibold text-zinc-300">{(market.total_vol || 0).toFixed(0)} 億</div></div>
        <div className="h-12 w-px bg-zinc-800" />
        <div><div className="text-[10px] text-zinc-600 mb-1">上漲 / 下跌</div><div className="text-sm font-semibold"><span className="text-emerald-500">{market.up_count || 0}</span><span className="text-zinc-600 mx-1">/</span><span className="text-rose-500">{market.dn_count || 0}</span></div></div>
        <div className="h-12 w-px bg-zinc-800" />
        <div><div className="text-[10px] text-zinc-600 mb-1">融資餘額</div><div className="text-sm font-semibold text-zinc-300">{market.margin_balance || 0} 億</div></div>
      </div>

      {/* Chart */}
      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
        <div ref={chartRef} className="w-full" />
      </div>

      {/* 三大法人 */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-zinc-800">
        <div className="text-xs font-bold text-zinc-400 mb-4">三大法人買賣超 (億元)</div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '外資', value: (market.foreign_net || 0) / 10000000, color: 'text-indigo-400' },
            { label: '投信', value: (market.trust_net || 0) / 10000000, color: 'text-emerald-400' },
            { label: '自營商', value: (market.dealer_net || 0) / 10000000, color: 'text-amber-400' },
          ].map(item => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="text-xs text-zinc-500 mb-1">{item.label}</div>
              <div className={`text-lg font-bold font-mono ${item.value > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {item.value > 0 ? '+' : ''}{item.value.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 類股表現 */}
      <div>
        <div className="text-xs font-bold text-zinc-400 mb-3">類股漲跌幅</div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(sectors).sort((a: any, b: any) => Math.abs(b[1].change) - Math.abs(a[1].change)).slice(0, 12).map(([name, data]: [string, any]) => (
            <div key={name} className={`p-3 rounded-xl border text-center transition-all ${
              data.change > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
            }`}>
              <div className="text-xs text-zinc-400 mb-0.5">{name}</div>
              <div className={`text-sm font-bold font-mono ${data.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
