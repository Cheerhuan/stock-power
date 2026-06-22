'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Users,
  Building2,
  Wallet,
  PiggyBank,
  ChevronDown,
} from 'lucide-react'

/* ── Types ── */

interface ChipMetrics {
  /** 主力集中度 (higher is better) */
  concentration?: number
  /** 券資比 (lower is better) */
  short_ratio?: number
  /** 融資融券比例 (lower is better) */
  margin_ratio?: number
  /** 千張大戶持有比例 (higher is better) */
  big_holders?: number
  /** 散戶比例 (INVERSE: lower is better) */
  retail_ratio?: number
  /** 外資持股占比 (higher is better) */
  foreign_position?: number
  [key: string]: unknown
}

interface StockItem {
  name: string
  id: string
  chip: ChipMetrics
}

interface Props {
  stockData: Record<string, any>
}

/* ── Metric Definitions ── */

interface MetricDef {
  key: keyof ChipMetrics
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  /** Whether a higher value is considered "good" */
  higherIsBetter: boolean
  /** Qualitative interpretation thresholds [bad, neutral, good] — returns subtext */
  interpret: (value: number) => { text: string; color: string }
}

const METRICS: MetricDef[] = [
  {
    key: 'concentration',
    label: '主力集中度',
    icon: TrendingUp,
    higherIsBetter: true,
    interpret: (v) =>
      v >= 50
        ? { text: '主力高度集中，籌碼強勢', color: '#00FF88' }
        : v >= 30
          ? { text: '主力集中度中等', color: '#FFC857' }
          : { text: '籌碼分散，主力關注度低', color: '#FF4D67' },
  },
  {
    key: 'short_ratio',
    label: '券資比',
    icon: BarChart3,
    higherIsBetter: false,
    interpret: (v) =>
      v <= 20
        ? { text: '券資比偏低，市場情緒穩定', color: '#00FF88' }
        : v <= 40
          ? { text: '券資比中性，多空拉鋸', color: '#FFC857' }
          : { text: '券資比偏高，潛在軋空風險', color: '#FF4D67' },
  },
  {
    key: 'margin_ratio',
    label: '融資融券',
    icon: Wallet,
    higherIsBetter: false,
    interpret: (v) =>
      v <= 30
        ? { text: '融資使用率低，籌碼安全', color: '#00FF88' }
        : v <= 60
          ? { text: '融資使用率中等', color: '#FFC857' }
          : { text: '融資水位高，斷頭風險增加', color: '#FF4D67' },
  },
  {
    key: 'big_holders',
    label: '千張大戶',
    icon: Building2,
    higherIsBetter: true,
    interpret: (v) =>
      v >= 60
        ? { text: '大戶持股集中，籌碼穩定', color: '#00FF88' }
        : v >= 35
          ? { text: '大戶持股比例中等', color: '#FFC857' }
          : { text: '大戶持股偏低，籌碼鬆散', color: '#FF4D67' },
  },
  {
    key: 'retail_ratio',
    label: '散戶比例',
    icon: Users,
    higherIsBetter: false, // INVERSE: lower is better
    interpret: (v) =>
      v <= 30
        ? { text: '散戶比例低，籌碼集中於法人', color: '#00FF88' }
        : v <= 55
          ? { text: '散戶比例適中', color: '#FFC857' }
          : { text: '散戶過多，籌碼結構不穩定', color: '#FF4D67' },
  },
  {
    key: 'foreign_position',
    label: '外資持股占比',
    icon: PiggyBank,
    higherIsBetter: true,
    interpret: (v) =>
      v >= 40
        ? { text: '外資高度持股，法人認同度高', color: '#00FF88' }
        : v >= 20
          ? { text: '外資持股比例中等', color: '#FFC857' }
          : { text: '外資持股偏低，國際資金關注度低', color: '#FF4D67' },
  },
]

/* ── Helpers ── */

function getProgressColor(value: number, higherIsBetter: boolean): string {
  const normalized = Math.max(0, Math.min(100, value))
  if (higherIsBetter) {
    if (normalized >= 50) return '#00FF88'
    if (normalized >= 25) return '#FFC857'
    return '#FF4D67'
  }
  // Lower is better — invert the logic
  if (normalized <= 30) return '#00FF88'
  if (normalized <= 60) return '#FFC857'
  return '#FF4D67'
}

function formatPct(val: number | undefined): string {
  if (val === undefined || val === null) return '--'
  return val.toFixed(1) + '%'
}

/* ── Sub-Components ── */

function MetricCard({ metric, value, index }: { metric: MetricDef; value: number | undefined; index: number }) {
  const Icon = metric.icon
  const hasValue = value !== undefined && value !== null
  const displayValue = hasValue ? Math.max(0, Math.min(100, value!)) : 0
  const barColor = hasValue ? getProgressColor(value!, metric.higherIsBetter) : 'rgba(255,255,255,0.08)'
  const interpretation = hasValue ? metric.interpret(value!) : { text: '暫無數據', color: 'rgba(255,255,255,0.25)' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
      className="glass-sm glass-sm-hover p-4 sm:p-5"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: hasValue ? `${barColor}18` : 'rgba(255,255,255,0.04)', color: hasValue ? barColor : 'rgba(255,255,255,0.2)' }}
          >
            <Icon size={14} className={hasValue ? '' : 'text-white/20'} />
          </div>
          <span className="text-[13px] font-medium text-white/70">{metric.label}</span>
        </div>
        <span
          className="text-sm font-bold font-mono tabular-nums"
          style={{ color: hasValue ? barColor : 'rgba(255,255,255,0.2)' }}
        >
          {formatPct(value)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 sm:h-3 rounded-full bg-white/[0.06] mb-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: 1, delay: 0.2 + 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundColor: barColor,
            boxShadow: hasValue ? `0 0 10px ${barColor}55` : 'none',
          }}
        />
      </div>

      {/* Interpretation subtext */}
      <p className="text-[13px] leading-relaxed" style={{ color: interpretation.color }}>
        {interpretation.text}
      </p>
    </motion.div>
  )
}

/* ── Dropdown ── */

function StockSelector({
  stocks,
  selectedId,
  onSelect,
}: {
  stocks: { id: string; name: string }[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const selected = stocks.find((s) => s.id === selectedId)
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="appearance-none w-full sm:w-64 px-4 py-2.5 pr-10 rounded-xl text-sm font-medium text-white bg-white/[0.06] border border-white/[0.08] 
                   focus:outline-none focus:border-[#00E5A8]/40 focus:bg-white/[0.08] transition-all cursor-pointer"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        {stocks.map((s) => (
          <option key={s.id} value={s.id} className="bg-[#0C0F16] text-white">
            {s.name} ({s.id})
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
      />
    </div>
  )
}

/* ── Main Component ── */

export default function ChipAnalysis({ stockData }: Props) {
  // Extract stocks that have chip metrics
  const stocks = useMemo<StockItem[]>(() => {
    if (!stockData || typeof stockData !== 'object') return []
    return Object.entries(stockData)
      .filter(([key, val]) => {
        if (key.startsWith('_')) return false
        if (!val || typeof val !== 'object') return false
        // Must have at least one chip field
        const chip = (val as Record<string, unknown>).chip as Record<string, unknown> | undefined
        if (chip && typeof chip === 'object') {
          return METRICS.some((m) => typeof chip[m.key] === 'number')
        }
        // Also support flat fields (chip fields directly on stock)
        return METRICS.some((m) => typeof val[m.key] === 'number')
      })
      .map(([_, val]) => {
        const v = val as Record<string, unknown>
        // Prefer nested `chip` object, fallback to flat fields
        const rawChip = (v.chip as Record<string, unknown>) ?? v
        const chip: ChipMetrics = {}
        for (const m of METRICS) {
          const raw = rawChip[m.key]
          if (typeof raw === 'number') chip[m.key] = raw
        }
        return {
          name: (v.name as string) || '',
          id: (v.id as string) || '',
          chip,
        }
      })
  }, [stockData])

  const [selectedId, setSelectedId] = useState<string>('')

  // Auto-select first stock when data loads
  const effectiveId = useMemo(() => {
    if (selectedId && stocks.some((s) => s.id === selectedId)) return selectedId
    if (stocks.length > 0) return stocks[0].id
    return ''
  }, [stocks, selectedId])

  const currentStock = stocks.find((s) => s.id === effectiveId)

  const chipDataCount = currentStock
    ? METRICS.filter((m) => currentStock.chip[m.key] !== undefined).length
    : 0

  return (
    <div className="section-container section-spacing space-y-5 sm:space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <PieChart size={22} className="text-[#00E5A8]" />
            籌碼分析中心
          </h2>
          <p className="text-[13px] sm:text-sm text-white/50 mt-0.5">
            個股籌碼面深度分析 · 主力、外資、大戶動向一覽
          </p>
        </div>

        {/* Stock Count Badge */}
        {stocks.length > 0 && (
          <div className="flex items-center gap-1.5 text-[13px] text-white/40 bg-white/[0.04] px-3 py-1.5 rounded-full whitespace-nowrap">
            <BarChart3 size={14} />
            <span>{stocks.length} 檔監控中</span>
          </div>
        )}
      </motion.div>

      {/* ── Empty State ── */}
      {stocks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-white/30"
        >
          <PieChart size={48} className="mb-3 opacity-40" />
          <p className="text-sm">暫無籌碼分析數據</p>
          <p className="text-[13px] mt-1">等待數據更新中...</p>
        </motion.div>
      ) : (
        <>
          {/* ── Stock Selector ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <span className="text-[13px] font-medium text-white/50">選擇個股</span>
            <StockSelector
              stocks={stocks.map((s) => ({ id: s.id, name: s.name }))}
              selectedId={effectiveId}
              onSelect={setSelectedId}
            />
            {currentStock && (
              <span className="text-[13px] text-white/30">
                {chipDataCount}/{METRICS.length} 項指標
              </span>
            )}
          </motion.div>

          {/* ── Selected Stock Identity Bar ── */}
          {currentStock && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="glass-sm px-5 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#00E5A8]/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-[#00E5A8]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{currentStock.name || currentStock.id}</h3>
                <span className="text-[13px] text-white/40 font-mono">{currentStock.id}</span>
              </div>
            </motion.div>
          )}

          {/* ── Metrics Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {METRICS.map((metric, idx) => (
              <MetricCard
                key={metric.key}
                metric={metric}
                value={(currentStock?.chip?.[metric.key] ?? undefined) as number | undefined}
                index={idx}
              />
            ))}
          </div>

          {/* ── Legend / Interpretation Guide ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 text-[13px] text-white/30"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
              良好
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFC857]" />
              中性
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF4D67]" />
              需注意
            </span>
          </motion.div>
        </>
      )}
    </div>
  )
}
