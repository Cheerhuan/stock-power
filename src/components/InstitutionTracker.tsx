'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'
import { Globe, Building2, Briefcase, TrendingUp, TrendingDown } from 'lucide-react'

/* ── Config ── */

const INSTITUTIONS = [
  { key: 'foreign', name: '外資', icon: Globe, color: '#22D3EE' },
  { key: 'trust',   name: '投信', icon: Building2, color: '#A78BFA' },
  { key: 'dealer',  name: '自營商', icon: Briefcase, color: '#FBBF24' },
] as const

const PERIODS = ['5', '20', '60'] as const
type Period = typeof PERIODS[number]

const PERIOD_LABELS: Record<Period, string> = {
  '5':  '近5日',
  '20': '近20日',
  '60': '近60日',
}

type InstitutionKey = typeof INSTITUTIONS[number]['key']

/* ── Helpers ── */

function extractTrend(data: any, period: Period): number[] {
  if (!data || !Array.isArray(data[period])) return []
  return data[period] as number[]
}

function netBadge(values: number[]): { label: string; value: string; isPositive: boolean } {
  const total = values.reduce((s, v) => s + v, 0)
  const abs = Math.abs(total)
  if (total > 0) return { label: '買超', value: `${abs.toFixed(1)}億`, isPositive: true }
  if (total < 0) return { label: '賣超', value: `${abs.toFixed(1)}億`, isPositive: false }
  return { label: '持平', value: '0.0億', isPositive: true }
}

/* ── Sub-components ── */

function PeriodTabs({
  selected,
  onChange,
}: {
  selected: Period
  onChange: (p: Period) => void
}) {
  return (
    <div className="flex gap-1 mb-4 bg-white/[0.04] rounded-lg p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
            selected === p
              ? 'bg-white/[0.1] text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  )
}

function InstitutionBarChart({ values }: { values: number[] }) {
  const chartData = useMemo(
    () =>
      values.map((v, i) => ({
        day: `${i + 1}`,
        value: v,
        fill: v >= 0 ? '#00E5A8' : '#FF4D67',
      })),
    [values],
  )

  return (
    <div className="h-32 mb-3">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fill: '#71717A', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={20}>
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
          暫無數據
        </div>
      )}
    </div>
  )
}

function Badge({ values }: { values: number[] }) {
  const { label, value, isPositive } = netBadge(values)
  return (
    <div
      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold ${
        isPositive
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-red-500/10 text-red-400'
      }`}
    >
      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function InstitutionCard({
  institution,
  trendData,
  selectedPeriod,
  onPeriodChange,
  delay,
}: {
  institution: typeof INSTITUTIONS[number]
  trendData: Record<Period, number[]>
  selectedPeriod: Period
  onPeriodChange: (p: Period) => void
  delay: number
}) {
  const values = trendData[selectedPeriod] ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-4 sm:p-5 hover:border-white/[0.12] transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${institution.color}20` }}
        >
          <institution.icon className="w-5 h-5" style={{ color: institution.color }} />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{institution.name}</h3>
          <p className="text-zinc-500 text-[10px] leading-tight">
            {institution.key === 'foreign'
              ? 'Foreign Institution'
              : institution.key === 'trust'
              ? 'Investment Trust'
              : 'Dealer / Broker'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <PeriodTabs selected={selectedPeriod} onChange={onPeriodChange} />

      {/* Chart */}
      <InstitutionBarChart values={values} />

      {/* Net badge */}
      <Badge values={values} />
    </motion.div>
  )
}

/* ── Main Component ── */

interface Props {
  stockData: any
}

export default function InstitutionTracker({ stockData }: Props) {
  const marketData = stockData?._market ?? {}

  // Independent period per institution
  const [periods, setPeriods] = useState<Record<InstitutionKey, Period>>({
    foreign: '5',
    trust: '5',
    dealer: '5',
  })

  const setPeriod = (key: InstitutionKey, p: Period) =>
    setPeriods((prev) => ({ ...prev, [key]: p }))

  // Build trend lookup
  const trendMap = useMemo(
    () => ({
      foreign: {
        '5':  extractTrend(marketData.foreign_trend, '5'),
        '20': extractTrend(marketData.foreign_trend, '20'),
        '60': extractTrend(marketData.foreign_trend, '60'),
      } as Record<Period, number[]>,
      trust: {
        '5':  extractTrend(marketData.trust_trend, '5'),
        '20': extractTrend(marketData.trust_trend, '20'),
        '60': extractTrend(marketData.trust_trend, '60'),
      } as Record<Period, number[]>,
      dealer: {
        '5':  extractTrend(marketData.dealer_trend, '5'),
        '20': extractTrend(marketData.dealer_trend, '20'),
        '60': extractTrend(marketData.dealer_trend, '60'),
      } as Record<Period, number[]>,
    }),
    [marketData],
  )

  // Composite summary
  const summary = useMemo(() => {
    let grand = 0
    for (const inst of INSTITUTIONS) {
      const vals = trendMap[inst.key][periods[inst.key]]
      if (vals) grand += vals.reduce((s, v) => s + v, 0)
    }
    return netBadge([grand])
  }, [periods, trendMap])

  return (
    <div className="space-y-6">
      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h2 className="text-xl font-bold text-white">法人動向中心</h2>
        <p className="text-zinc-500 text-sm mt-1">三大法人買賣超趨勢追蹤</p>
      </motion.div>

      {/* ── Three-column grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INSTITUTIONS.map((inst, i) => (
          <InstitutionCard
            key={inst.key}
            institution={inst}
            trendData={trendMap[inst.key]}
            selectedPeriod={periods[inst.key]}
            onPeriodChange={(p) => setPeriod(inst.key, p)}
            delay={0.1 + i * 0.1}
          />
        ))}
      </div>

      {/* ── Bottom Summary ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
        className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-4 sm:p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs">三大法人合計</p>
              <p className="text-white font-semibold text-lg">{summary.label}</p>
            </div>
          </div>
          <div
            className={`text-2xl font-bold ${
              summary.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {summary.isPositive ? '+' : ''}{summary.value}
          </div>
        </div>

        {/* Per-institution breakdown in summary */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
          {INSTITUTIONS.map((inst) => {
            const vals = trendMap[inst.key][periods[inst.key]]
            const net = vals ? vals.reduce((s, v) => s + v, 0) : 0
            return (
              <div key={inst.key} className="text-center">
                <p className="text-zinc-500 text-xs mb-1">{inst.name}</p>
                <p
                  className={`text-sm font-semibold ${
                    net >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {net >= 0 ? '+' : ''}{net.toFixed(1)}億
                </p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
