'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, BarChart3, List,
  ArrowUp, ArrowDown,
} from 'lucide-react';

/* ── Types ── */
interface IndexData {
  price: number;
  change: number;
  name: string;
}

interface ETFData {
  id: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  dividend_yield?: number;
}

interface RankingEntry {
  id: string;
  name: string;
  price: number;
  change: number;
  volume?: number;
  inst_net?: number;
  margin_ratio?: number;
  [key: string]: unknown;
}

interface MarketData {
  _indices?: Record<string, IndexData>;
  _etfs?: Record<string, ETFData>;
  _rankings?: {
    volume?: RankingEntry[];
    gainers?: RankingEntry[];
    losers?: RankingEntry[];
    inst_buy?: RankingEntry[];
    margin_up?: RankingEntry[];
    foreign_buy?: RankingEntry[];
    [key: string]: RankingEntry[] | undefined;
  };
  _sectors?: Record<string, { change: number; volume?: number }>;
}

interface Props {
  stockData: MarketData;
}

/* ── Helpers ── */
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Tabs config ── */
const TABS = [
  { key: 'volume', label: '成交量排行', icon: BarChart3 },
  { key: 'gainers', label: '漲幅排行', icon: ArrowUp },
  { key: 'losers', label: '跌幅排行', icon: ArrowDown },
  { key: 'inst_buy', label: '主力買超', icon: TrendingUp },
  { key: 'margin_up', label: '融資增加', icon: List },
  { key: 'foreign_buy', label: '外資買超', icon: TrendingUp },
] as const;

const TAB_ACCESSORS: Record<string, (e: RankingEntry) => string> = {
  volume:     (e) => e.volume != null ? `${(e.volume / 10000).toFixed(0)}萬` : '-',
  gainers:    (e) => `${e.change >= 0 ? '+' : ''}${e.change.toFixed(2)}%`,
  losers:     (e) => `${e.change >= 0 ? '+' : ''}${e.change.toFixed(2)}%`,
  inst_buy:   (e) => e.inst_net != null ? `${(e.inst_net / 10000000).toFixed(1)}億` : '-',
  margin_up:  (e) => e.margin_ratio != null ? `${e.margin_ratio.toFixed(1)}%` : '-',
  foreign_buy:(e) => e.inst_net != null ? `${(e.inst_net / 10000000).toFixed(1)}億` : '-',
};

/* ── Card sub-component ── */
function IndexCard({ indexKey, data, delay }: { indexKey: string; data: IndexData; delay: number }) {
  const isUp = data.change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-4 lg:p-5 glass-hover"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] sm:text-[10px] font-medium text-zinc-500">{data.name || indexKey}</span>
        <span className={`flex items-center gap-1 text-[10px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
          isUp ? 'text-[#00FF88] bg-[#00FF88]/10' : 'text-[#FF4D67] bg-[#FF4D67]/10'
        }`}>
          {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {isUp ? '+' : ''}{data.change.toFixed(2)}%
        </span>
      </div>
      <div className={`text-xl font-bold font-mono ${isUp ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
        {fmt(data.price)}
      </div>
    </motion.div>
  );
}

/* ── ETF Card ── */
function ETFCard({ etf, delay }: { etf: ETFData; delay: number }) {
  const isUp = etf.change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-4 lg:p-5 glass-hover"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-white">{etf.id}</span>
        <span className={`text-[11px] sm:text-[10px] font-mono font-bold ${isUp ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
          {isUp ? '+' : ''}{etf.change.toFixed(2)}%
        </span>
      </div>
      <div className="text-[11px] sm:text-[10px] text-zinc-500 mb-2 truncate">{etf.name}</div>
      <div className="flex items-center justify-between">
        <span className={`text-base font-bold font-mono ${isUp ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
          {fmt(etf.price)}
        </span>
        <span className="text-[10px] sm:text-[9px] text-zinc-600">
          量: {(etf.volume / 10000).toFixed(0)}萬
        </span>
      </div>
      {etf.dividend_yield != null && (
        <div className="mt-1 text-[10px] sm:text-[9px] text-zinc-600">
          殖利率: <span className="text-[#FFC857]">{etf.dividend_yield.toFixed(2)}%</span>
        </div>
      )}
    </motion.div>
  );
}

/* ── Ranking row ── */
function RankingRow({ entry, rank, detailKey }: { entry: RankingEntry; rank: number; detailKey: string }) {
  const isUp = entry.change >= 0;
  const detail = TAB_ACCESSORS[detailKey]?.(entry) ?? '-';
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03 }}
      className="flex items-center gap-3 py-2.5 px-3 sm:py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
    >
      {/* Rank */}
      <span className={`w-6 text-center text-[11px] sm:text-[10px] font-bold font-mono ${
        rank <= 3 ? 'text-[#FFC857]' : 'text-zinc-600'
      }`}>
        {rank}
      </span>
      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="text-xs sm:text-[11px] font-medium text-white truncate">{entry.name || entry.id}</div>
        <div className="text-[10px] sm:text-[9px] text-zinc-600 font-mono">{entry.id}</div>
      </div>
      {/* Price */}
      <div className="text-right">
        <div className={`text-xs sm:text-[11px] font-mono font-medium ${isUp ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
          {fmt(entry.price)}
        </div>
        <div className={`text-[10px] sm:text-[9px] font-mono ${isUp ? 'text-[#00FF88]/70' : 'text-[#FF4D67]/70'}`}>
          {isUp ? '+' : ''}{entry.change.toFixed(2)}%
        </div>
      </div>
      {/* Detail metric */}
      <div className="text-[11px] sm:text-[10px] font-mono text-zinc-400 w-16 text-right">
        {detail}
      </div>
    </motion.div>
  );
}

/* ── Sector Chip ── */
function SectorChip({ name, data }: { name: string; data: { change: number; volume?: number } }) {
  const isUp = data.change >= 0;
  return (
    <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-[11px] sm:text-[10px] font-medium transition-colors cursor-default ${
      isUp
        ? 'border-[#00FF88]/20 bg-[#00FF88]/5 text-[#00FF88]'
        : 'border-[#FF4D67]/20 bg-[#FF4D67]/5 text-[#FF4D67]'
    }`}>
      <span className="whitespace-nowrap">{name}</span>
      <span className="font-mono font-bold">
        {isUp ? '+' : ''}{data.change.toFixed(1)}%
      </span>
    </div>
  );
}

/* ── Main Component ── */
export default function MarketOverview({ stockData }: Props) {
  const indices = stockData?._indices ?? {};
  const etfs = stockData?._etfs ?? {};
  const rankings = stockData?._rankings ?? {};
  const sectors = stockData?._sectors ?? {};

  const [activeTab, setActiveTab] = useState<string>('volume');
  const activeEntries: RankingEntry[] = (rankings[activeTab] ?? []).slice(0, 10);

  return (
    <section>
      <div className="section-container section-spacing">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">台股市場總覽</h2>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">Taiwan Market Overview</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-600 whitespace-nowrap">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-[#00E5A8] animate-ping opacity-40" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-[#00E5A8]" />
            </span>
            Real-time
          </div>
        </div>

        {/* ── 1. Main Indices ── */}
        {Object.keys(indices).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-[#00E5A8]" />
              <span className="text-xs sm:text-[11px] font-medium text-zinc-400">主要指數</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(indices).map(([key, data], i) => (
                <IndexCard key={key} indexKey={key} data={data} delay={i * 0.08} />
              ))}
            </div>
          </div>
        )}

        {/* ── 2. ETF Watchlist ── */}
        {Object.keys(etfs).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <List size={14} className="text-[#00E5A8]" />
              <span className="text-xs sm:text-[11px] font-medium text-zinc-400">ETF 觀察清單</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.values(etfs).slice(0, 6).map((etf, i) => (
                <ETFCard key={etf.id} etf={etf} delay={i * 0.06} />
              ))}
            </div>
          </div>
        )}

        {/* ── 3. Hot Rankings ── */}
        {Object.keys(rankings).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#00E5A8]" />
              <span className="text-xs sm:text-[11px] font-medium text-zinc-400">熱門排行</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-none -mx-1 px-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[10px] font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/20'
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                    }`}
                  >
                    <Icon size={12} className="flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Ranking list */}
            <div className="glass rounded-xl p-2">
              {activeEntries.length > 0 ? (
                activeEntries.map((entry, i) => (
                  <RankingRow key={entry.id ?? i} entry={entry} rank={i + 1} detailKey={activeTab} />
                ))
              ) : (
                <div className="py-8 text-center text-xs sm:text-[11px] text-zinc-600">暫無資料</div>
              )}
            </div>
          </div>
        )}

        {/* ── 4. Sector Performance ── */}
        {Object.keys(sectors).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-[#00E5A8]" />
              <span className="text-xs sm:text-[11px] font-medium text-zinc-400">類股表現</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {Object.entries(sectors).map(([name, data]) => (
                <SectorChip key={name} name={name} data={data} />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {Object.keys(indices).length === 0 &&
         Object.keys(etfs).length === 0 &&
         Object.keys(rankings).length === 0 &&
         Object.keys(sectors).length === 0 && (
          <div className="glass rounded-xl py-12 text-center">
            <BarChart3 size={32} className="mx-auto mb-3 text-zinc-700" />
            <p className="text-sm text-zinc-600">市場資料載入中…</p>
          </div>
        )}
      </div>
    </section>
  );
}
