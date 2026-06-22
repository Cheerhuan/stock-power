'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries, LineSeries } from 'lightweight-charts';

/* ── Types ── */
interface StockChartProps {
  height?: number;
  days?: number;
  color?: string;
}

/* ── Helpers ── */

/** Generate random walk price data starting from 950 */
function generateRandomWalk(days: number): { time: string; value: number }[] {
  const data: { time: string; value: number }[] = [];
  let price = 950;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Random walk: daily change between -2% and +2%
    const change = price * (Math.random() - 0.5) * 0.04;
    price += change;
    data.push({
      time: date.toISOString().split('T')[0],
      value: Math.round(price * 100) / 100,
    });
  }

  return data;
}

/* ── Component ── */
export default function StockChart({
  height = 320,
  days = 120,
  color = '#5B8CFF',
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    /* ── Generate data ── */
    const data = generateRandomWalk(days);

    /* ── Create chart ── */
    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: 0,
        vertLine: { visible: false, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
      rightPriceScale: {
        visible: false,
        borderVisible: false,
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },
      timeScale: {
        visible: false,
        borderVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    });

    /* ── Add area series with gradient fill ── */
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: color,
      bottomColor: 'transparent',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    areaSeries.setData(data);

    /* ── Responsive resize ── */
    const handleResize = () => {
      if (container) {
        chart.applyOptions({ width: container.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    /* ── Cleanup ── */
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height, days, color]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        height,
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#0B0F17',
      }}
    />
  );
}
