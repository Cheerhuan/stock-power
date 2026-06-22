'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Users,
  BarChart3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useMemo } from 'react'

interface StockItem {
  name: string
  id: string
  price: number
  change: number
  score: number
  advice: string
  risk_score: number
  pe: number
  eps: number
  dividend_yield: number
  revenue_growth: number
  consensus: string[]
  consensus_count: number
}

interface Props {
  stockData: Record<string, any>
  showInitial?: number
}

const INVESTORS = [
  { key: 'buffett', label: 'Buffett', color: '#E0282E' },
  { key: 'lynch', label: 'Lynch', color: '#005A9C' },
  { key: 'munger', label: 'Munger', color: '#2E7D32' },
  { key: 'graham', label: 'Graham', color: '#6A1B9A' },
  { key: 'dalio', label: 'Dalio', color: '#F57C00' },
  { key: 'soros', label: 'Soros', color: '#00838F' },
]

function getScoreColor(score: number): string {
  if (score >= 80) return '#00FF88'
  if (score >= 60) return '#00E5A8'
  if (score >= 40) return '#FFC857'
  return '#FF4D67'
}

function getAdviceStyle(advice: string): { label: string; color: string; bg: string } {
  const lower = advice.toLowerCase()
  if (lower.includes('strong buy')) return { label: '強力買入', color: '#00FF88', bg: 'rgba(0,255,136,0.15)' }
  if (lower.includes('buy')) return { label: '買入', color: '#00E5A8', bg: 'rgba(0,229,168,0.15)' }
  if (lower.includes('hold')) return { label: '持有', color: '#FFC857', bg: 'rgba(255,200,87,0.15)' }
  if (lower.includes('sell')) return { label: '賣出', color: '#FF8A65', bg: 'rgba(255,138,101,0.15)' }
  if (lower.includes('strong sell')) return { label: '強力賣出', color: '#FF4D67', bg: 'rgba(255,77,103,0.15)' }
  return { label: '持有', color: '#FFC857', bg: 'rgba(255,200,87,0.15)' }
}

function formatPercent(val: number): string {
  return (val >= 0 ? '+' : '') + val.toFixed(2) + '%'
}

function GaugeRing({ score, className = '' }: { score: number; className?: string }) {
  const radius = 36
  const center = 40
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.max(0, Math.min(100, score))
  const offset = circumference - (clampedScore / 100) * circumference
  const color = getScoreColor(clampedScore)

  return (
    <svg viewBox="0 0 80 80" className={`shrink-0 ${className}`}>
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="5"
      />
      {/* Foreground ring */}
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform="rotate(-90 40 40)"
      />
      {/* Score text */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize="18"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {Math.round(clampedScore)}
      </text>
    </svg>
  )
}

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-[#00E5A8]">
        <TrendingUp size={14} />
        {formatPercent(change)}
      </span>
    )
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-[#FF4D67]">
        <TrendingDown size={14} />
        {formatPercent(change)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-[#FFC857]">
      <Minus size={14} />
      {formatPercent(change)}
    </span>
  )
}

function ConsensusRow({ consensus }: { consensus: string[] }) {
  const consKeys = (consensus || []).map((k) => k.toLowerCase())
  return (
    <div className="flex items-center gap-1">
      {INVESTORS.map((inv) => {
        const matched = consKeys.includes(inv.key)
        return (
          <div
            key={inv.key}
            className="relative group"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                backgroundColor: matched ? inv.color : 'rgba(255,255,255,0.06)',
                color: matched ? '#fff' : 'rgba(255,255,255,0.25)',
                border: matched ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {matched ? (
                <Check size={10} strokeWidth={3} />
              ) : (
                <X size={10} strokeWidth={2} />
              )}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ backgroundColor: 'rgba(0,0,0,0.85)', color: '#fff' }}
            >
              {inv.label}: {matched ? '✓' : '✗'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AISignalCenter({ stockData, showInitial = 24 }: Props) {
  const [showAll, setShowAll] = useState(false)

  const stocks = useMemo<StockItem[]>(() => {
    if (!stockData || typeof stockData !== 'object') return []
    return Object.entries(stockData)
      .filter(([key, val]) => {
        if (key.startsWith('_')) return false
        if (!val || typeof val !== 'object') return false
        return 'price' in val && 'score' in val
      })
      .map(([_, val]) => ({
        name: val.name || '',
        id: val.id || '',
        price: Number(val.price) || 0,
        change: Number(val.change) || 0,
        score: Number(val.score) || 0,
        advice: val.advice || 'hold',
        risk_score: Number(val.risk_score) || 0,
        pe: Number(val.pe) || 0,
        eps: Number(val.eps) || 0,
        dividend_yield: Number(val.dividend_yield) || 0,
        revenue_growth: Number(val.revenue_growth) || 0,
        consensus: Array.isArray(val.consensus) ? val.consensus : 
                     (typeof val.consensus === 'object' && val.consensus ? 
                       Object.entries(val.consensus).filter(([,v]) => v).map(([k]) => k) : []),
        consensus_count: Number(val.consensus_count) || 0,
      }))
  }, [stockData])

  const displayedStocks = showAll ? stocks : stocks.slice(0, showInitial)
  const hasMore = stocks.length > showInitial

  return (
    <div className="section-container section-spacing">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Zap size={22} className="text-[#FFC857]" />
            AI 選股中心
          </h2>
          <p className="text-[13px] sm:text-sm text-white/50 mt-0.5">
            深度學習模型即時分析 · 多策略共識評分
          </p>
        </div>
        {stocks.length > 0 && (
          <div className="flex items-center gap-1.5 text-[13px] text-white/40 bg-white/[0.04] px-3 py-1.5 rounded-full">
            <BarChart3 size={14} />
            <span>{stocks.length} 檔監控中</span>
          </div>
        )}
      </motion.div>

      {/* Stock Grid */}
      {stocks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-white/30"
        >
          <BarChart3 size={48} className="mb-3 opacity-40" />
          <p className="text-sm">暫無 AI 選股數據</p>
          <p className="text-xs mt-1">等待數據更新中...</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {displayedStocks.map((stock, index) => {
              const adviceInfo = getAdviceStyle(stock.advice)
              return (
                <motion.div
                  key={stock.id || index}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.06 * index,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-4 sm:p-5 hover:border-white/[0.12] hover:bg-white/[0.08] transition-all duration-300"
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(600px circle at 50% 100%, ${getScoreColor(stock.score)}08, transparent 60%)`,
                    }}
                  />

                  {/* Top row: name + ticker */}
                  <div className="relative flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                        {stock.name || `Stock ${index + 1}`}
                      </h3>
                      <span className="text-[11px] text-white/40 font-mono">
                        {stock.id || '---'}
                      </span>
                    </div>
                    {/* Gauge Ring - responsive sizing */}
                    <GaugeRing score={stock.score} className="w-14 h-14 sm:w-[76px] sm:h-[76px]" />
                  </div>

                  {/* Price + Change */}
                  <div className="relative flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-white">
                      ${stock.price.toFixed(2)}
                    </span>
                    <ChangeIndicator change={stock.change} />
                  </div>

                  {/* Advice Badge - more visible with border */}
                  <div className="relative mb-3">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[13px] font-semibold tracking-wide border"
                      style={{
                        color: adviceInfo.color,
                        backgroundColor: adviceInfo.bg,
                        borderColor: `${adviceInfo.color}30`,
                      }}
                    >
                      {adviceInfo.label}
                    </span>
                  </div>

                  {/* Metric rows - minimum 13px on mobile */}
                  <div className="relative space-y-1.5 text-[13px] sm:text-xs">
                    {/* PE / EPS */}
                    <div className="flex items-center justify-between bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                      <span className="text-white/50">PE</span>
                      <span className="text-white/80 font-mono font-medium">
                        {stock.pe.toFixed(1)}
                      </span>
                      <span className="text-white/20 mx-1">|</span>
                      <span className="text-white/50">EPS</span>
                      <span className="text-white/80 font-mono font-medium">
                        {stock.eps.toFixed(2)}
                      </span>
                    </div>
                    {/* Yield / Revenue Growth */}
                    <div className="flex items-center justify-between bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                      <span className="text-white/50">殖利率</span>
                      <span className="text-white/80 font-mono font-medium">
                        {stock.dividend_yield.toFixed(2)}%
                      </span>
                      <span className="text-white/20 mx-1">|</span>
                      <span className="text-white/50">營收成長</span>
                      <span className="text-white/80 font-mono font-medium">
                        {stock.revenue_growth >= 0 ? '+' : ''}
                        {stock.revenue_growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* AI Consensus Section */}
                  <div className="relative mt-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-white/40 flex items-center gap-1">
                        <Users size={12} />
                        AI 共識
                      </span>
                      <span className="text-[11px] font-semibold text-white/60">
                        {stock.consensus_count}/{INVESTORS.length} 策略
                      </span>
                    </div>
                    <ConsensusRow consensus={stock.consensus} />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Show More / Show Less */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-4"
            >
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200"
              >
                {showAll ? (
                  <>
                    <ChevronUp size={16} />
                    收起
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    顯示更多 ({stocks.length - showInitial} 檔)
                  </>
                )}
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
