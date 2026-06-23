'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
} from 'lightweight-charts';

/* ── Types ── */
interface OHLCV {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface MAItem {
  period: number
  label: string
  color: string
  enabled: boolean
}

interface StockChartProps {
  stockId: string
  stockName: string
  height?: number
}

/* ── MA 計算 ── */
function calcMA(data: { time: string; close: number }[], period: number) {
  const result: { time: string; value: number }[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close
    result.push({ time: data[i].time, value: Math.round((sum / period) * 100) / 100 })
  }
  return result
}

/* ── 時間框架聚合 ── */
function aggregateWeekly(daily: OHLCV[]): OHLCV[] {
  const weeks: { [key: string]: OHLCV } = {}
  for (const d of daily) {
    const date = new Date(d.time)
    // 算週一日期
    const day = date.getDay()
    const mon = new Date(date)
    mon.setDate(date.getDate() - ((day + 6) % 7))
    const wk = mon.toISOString().split('T')[0]
    if (!weeks[wk]) weeks[wk] = { ...d }
    else {
      weeks[wk].high = Math.max(weeks[wk].high, d.high)
      weeks[wk].low = Math.min(weeks[wk].low, d.low)
      weeks[wk].close = d.close
      weeks[wk].volume += d.volume
    }
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
}

function aggregateMonthly(daily: OHLCV[]): OHLCV[] {
  const months: { [key: string]: OHLCV } = {}
  for (const d of daily) {
    const key = d.time.slice(0, 7) // '2026-06'
    if (!months[key]) months[key] = { ...d }
    else {
      months[key].high = Math.max(months[key].high, d.high)
      months[key].low = Math.min(months[key].low, d.low)
      months[key].close = d.close
      months[key].volume += d.volume
    }
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
}

/* ── Component ── */
export default function StockChart({ stockId, stockName, height = 360 }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)
  const maSeriesRefs = useRef<{ [key: number]: ReturnType<ReturnType<typeof createChart>['addSeries']> }>({})

  const [rawData, setRawData] = useState<OHLCV[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 時間框架
  const [timeframe, setTimeframe] = useState<'D' | 'W' | 'M'>('D')

  // MA 設定
  const [mas, setMas] = useState<MAItem[]>([
    { period: 5, label: 'MA5', color: '#FFD700', enabled: true },
    { period: 10, label: 'MA10', color: '#FF8C00', enabled: false },
    { period: 20, label: 'MA20', color: '#A855F7', enabled: false },
    { period: 60, label: 'MA60', color: '#38BDF8', enabled: false },
  ])

  const toggleMA = useCallback((period: number) => {
    setMas(prev => prev.map(m => m.period === period ? { ...m, enabled: !m.enabled } : m))
  }, [])

  /* ── Fetch data ── */
  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/history?stockId=${stockId}&months=12`)
        const json = await res.json()
        if (!cancelled && json.data) setRawData(json.data)
      } catch {}
      if (!cancelled) setLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [stockId])

  /* ── Render chart ── */
  useEffect(() => {
    const container = containerRef.current
    if (!container || rawData.length === 0) return

    // 根據時間框架聚合
    let chartData: OHLCV[]
    if (timeframe === 'W') chartData = aggregateWeekly(rawData)
    else if (timeframe === 'M') chartData = aggregateMonthly(rawData)
    else chartData = rawData

    // 只顯示最近 N 筆（日:365, 週:104, 月:48）
    const maxCandles = timeframe === 'D' ? 365 : timeframe === 'W' ? 104 : 48
    chartData = chartData.slice(-maxCandles)

    // ── Create chart ──
    const chart = createChart(container, {
      width: container.clientWidth,
      height,
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
      crosshair: {
        vertLine: {
          color: '#5B8CFF',
          style: 2,
          width: 1,
          labelBackgroundColor: '#5B8CFF',
        },
        horzLine: {
          color: '#5B8CFF',
          style: 2,
          width: 1,
          labelBackgroundColor: '#5B8CFF',
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.05, bottom: 0.15 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        horzTouchDrag: true,
        vertTouchDrag: false,
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: { time: true, price: false },
        mouseWheel: true,
        pinch: true,
      },
    })
    chartRef.current = chart

    // ── Candlestick ──
    const cs = chart.addSeries(CandlestickSeries, {
      upColor: '#00D26A',
      downColor: '#FF4D6D',
      borderUpColor: '#00D26A',
      borderDownColor: '#FF4D6D',
      wickUpColor: '#00D26A',
      wickDownColor: '#FF4D6D',
      priceLineVisible: false,
      lastValueVisible: true,
    })
    cs.setData(chartData as any)
    seriesRef.current = cs

    // ── MA lines ──
    const closeData = chartData.map(d => ({ time: d.time, close: d.close }))
    maSeriesRefs.current = {}
    for (const ma of mas) {
      if (!ma.enabled) continue
      const lineData = calcMA(closeData, ma.period)
      if (lineData.length === 0) continue
      const ls = chart.addSeries(LineSeries, {
        color: ma.color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
      ls.setData(lineData)
      maSeriesRefs.current[ma.period] = ls
    }

    chart.timeScale().fitContent()

    // ── Resize ──
    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      maSeriesRefs.current = {}
    }
  }, [rawData, timeframe, height])

  // Re-render MA lines when toggled without recreating entire chart
  useEffect(() => {
    const chart = chartRef.current
    const closeData = (seriesRef.current as any)?.data?.()
    if (!chart || !closeData) return

    // Remove existing MA series
    Object.values(maSeriesRefs.current).forEach(s => chart.removeSeries(s))
    maSeriesRefs.current = {}

    // Add enabled MAs
    for (const ma of mas) {
      if (!ma.enabled) continue
      const lineData = calcMA(closeData, ma.period)
      if (lineData.length === 0) continue
      const ls = chart.addSeries(LineSeries, {
        color: ma.color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
      ls.setData(lineData)
      maSeriesRefs.current[ma.period] = ls
    }
  }, [mas])

  /* ── Timeframe label ── */
  const tfLabel = timeframe === 'D' ? '日線' : timeframe === 'W' ? '週線' : '月線'

  if (loading) return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>載入 K 線...</div>
    </div>
  )

  if (error || rawData.length === 0) return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-xs font-mono" style={{ color: '#5A5D6B' }}>暫無歷史資料</div>
    </div>
  )

  const periods = { D: '日線' as const, W: '週線' as const, M: '月線' as const }
  const periodsArr = Object.entries(periods) as [string, string][]

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        {/* Timeframe toggle */}
        <div className="flex items-center gap-1.5">
          {periodsArr.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTimeframe(key as 'D' | 'W' | 'M')}
              className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                timeframe === key
                  ? 'bg-[var(--primary-dim)] text-[var(--primary)] shadow-[0_0_12px_var(--primary-glow)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* MA toggles */}
        <div className="flex items-center gap-1.5">
          {mas.map(ma => (
            <button
              key={ma.period}
              onClick={() => toggleMA(ma.period)}
              className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-medium transition-all duration-200 border ${
                ma.enabled
                  ? 'border-opacity-50 shadow-[0_0_8px]'
                  : 'border-transparent text-[var(--text-dim)]'
              }`}
              style={{
                color: ma.enabled ? ma.color : undefined,
                borderColor: ma.enabled ? ma.color : undefined,
                backgroundColor: ma.enabled ? `${ma.color}12` : 'transparent',
              }}
            >
              {ma.label}
            </button>
          ))}
        </div>

        {/* Reset zoom */}
        <button
          onClick={() => {
            const chart = chartRef.current
            if (chart) chart.timeScale().fitContent()
          }}
          className="text-[10px] px-2.5 py-1 rounded-full font-medium transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent hover:border-[var(--card-border)]"
          title="還原縮放"
        >
          ↩
        </button>
      </div>

      {/* ── Chart ── */}
      <div ref={containerRef} className="w-full" />

      {/* ── Info bar ── */}
      {rawData.length > 0 && (
        <div className="flex items-center gap-3 px-4 pt-1.5 pb-1">
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {tfLabel} · {chartDataLength()} 筆
          </span>
          <span className="text-[10px] font-mono" style={{ color: '#5A5D6B' }}>
            {rawData[0]?.time} ~ {rawData[rawData.length - 1]?.time}
          </span>
        </div>
      )}
    </div>
  )

  // Helper for displaying count - not a hook, safe inside render
  function chartDataLength(): number {
    const d = timeframe === 'W' ? aggregateWeekly(rawData) :
             timeframe === 'M' ? aggregateMonthly(rawData) : rawData
    return d.length
  }
}
