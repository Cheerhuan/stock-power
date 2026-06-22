'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, Target, Percent,
  Activity, PieChart as PieChartIcon, Table,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';

/* ── Types ── */
interface Holding {
  id: string;
  shares: number;
  avg_cost: number;
  current: number;
}

interface Portfolio {
  total_assets: number;
  today_pl: number;
  cumulative_return: number;
  win_rate: number;
  max_drawdown: number;
  sharpe_ratio: number;
  holdings: Holding[];
}

interface Props {
  stockData: {
    _portfolio?: Portfolio;
  };
}

/* ── Helpers ── */
const fmtNT = (n: number) =>
  `NT$ ${Math.round(n).toLocaleString('en-US')}`;

const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPct = (n: number) =>
  `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

/* ── Color palette for pie chart ── */
const PIE_COLORS = [
  '#00E5A8', '#FFC857', '#FF6B6B', '#6C5CE7',
  '#00CEC9', '#FD79A8', '#A29BFE', '#FDCB6E',
  '#E17055', '#00B894', '#0984E3', '#F39C12',
];

/* ── Stat Card ── */
function StatCard({
  label,
  value,
  icon: Icon,
  delay,
  valueClass = '',
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  delay: number;
  valueClass?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="glass rounded-xl p-4 lg:p-5 glass-hover flex flex-col"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-[#00E5A8]" />
        <span className="text-[11px] sm:text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-lg font-bold font-mono tracking-tight ${valueClass || 'text-white'}`}>
        {value}
      </div>
    </motion.div>
  );
}

/* ── Holding Row ── */
function HoldingRow({
  holding,
  rank,
}: {
  holding: Holding;
  rank: number;
}) {
  const pl = (holding.current - holding.avg_cost) * holding.shares;
  const returnPct = ((holding.current - holding.avg_cost) / holding.avg_cost) * 100;
  const isUp = pl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04, duration: 0.3 }}
      className="flex items-center gap-2 sm:gap-3 py-2 px-2 sm:py-3 sm:px-3 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-b-0"
    >
      {/* Stock name + ticker */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] sm:text-[12px] font-medium text-white truncate">{holding.id}</div>
        <div className="text-[11px] sm:text-[9px] text-zinc-600 font-mono">{holding.id}</div>
      </div>

      {/* Shares */}
      <div className="w-[55px] sm:w-[80px] text-right">
        <div className="text-[13px] sm:text-[11px] font-mono text-zinc-300">{holding.shares.toLocaleString()}</div>
        <div className="text-[11px] sm:text-[8px] text-zinc-600">股數</div>
      </div>

      {/* Avg Cost */}
      <div className="w-[65px] sm:w-[90px] text-right">
        <div className="text-[13px] sm:text-[11px] font-mono text-zinc-300">{fmt(holding.avg_cost)}</div>
        <div className="text-[11px] sm:text-[8px] text-zinc-600">均價</div>
      </div>

      {/* Current Price */}
      <div className="w-[65px] sm:w-[90px] text-right">
        <div className={`text-[13px] sm:text-[11px] font-mono font-medium ${isUp ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
          {fmt(holding.current)}
        </div>
        <div className="text-[11px] sm:text-[8px] text-zinc-600">現價</div>
      </div>

      {/* P&L */}
      <div className="w-[75px] sm:w-[100px] text-right">
        <div className={`text-[13px] sm:text-[11px] font-mono font-bold ${isUp ? 'text-[#00FF88]' : 'text-[#FF4D67]'}`}>
          {isUp ? '+' : ''}{fmt(pl)}
        </div>
        <div className={`text-[11px] sm:text-[9px] font-mono ${isUp ? 'text-[#00FF88]/70' : 'text-[#FF4D67]/70'}`}>
          {fmtPct(returnPct)}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Pie Chart Tooltip ── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-dark rounded-lg px-3 py-2 text-[13px] sm:text-[11px] shadow-lg border border-white/10">
      <div className="text-white font-medium mb-1">{d.name}</div>
      <div className="text-zinc-400">
        佔比: <span className="text-[#00E5A8] font-mono">{d.percent.toFixed(1)}%</span>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function PortfolioDashboard({ stockData }: Props) {
  const portfolio = stockData?._portfolio;
  const holdings = portfolio?.holdings ?? [];
  const totalAssets = portfolio?.total_assets ?? 0;
  const todayPl = portfolio?.today_pl ?? 0;
  const cumulativeReturn = portfolio?.cumulative_return ?? 0;
  const winRate = portfolio?.win_rate ?? 0;
  const sharpeRatio = portfolio?.sharpe_ratio ?? 0;
  const maxDrawdown = portfolio?.max_drawdown ?? 0;

  /* ── Pie chart data: approximate allocation by current value ── */
  const pieData = holdings.map((h) => {
    const value = h.shares * h.current;
    return {
      name: h.id,
      value,
      percent: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
    };
  });

  const hasPortfolio = portfolio != null && holdings.length > 0;

  return (
    <section className="section-container section-spacing">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">個人投資儀表板</h2>
          <p className="text-[13px] sm:text-[11px] text-zinc-500 mt-0.5">Portfolio Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-[13px] sm:text-[10px] text-zinc-600">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
          Live
        </div>
      </motion.div>

      {!hasPortfolio ? (
        /* ── Empty State ── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl py-16 text-center"
        >
          <Wallet size={40} className="mx-auto mb-4 text-zinc-700" />
          <p className="text-sm text-zinc-600 mb-1">尚未載入投資組合資料</p>
          <p className="text-[13px] sm:text-[10px] text-zinc-700">請先連接您的帳戶或上傳持股資訊</p>
        </motion.div>
      ) : (
        <>
          {/* ── 1. Main Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard
              label="總資產"
              value={fmtNT(totalAssets)}
              icon={Wallet}
              delay={0.05}
              valueClass="text-[#00E5A8]"
            />
            <StatCard
              label="今日損益"
              value={fmtNT(todayPl)}
              icon={todayPl >= 0 ? TrendingUp : TrendingDown}
              delay={0.10}
              valueClass={todayPl >= 0 ? 'text-[#00FF88]' : 'text-[#FF4D67]'}
            />
            <StatCard
              label="累積報酬"
              value={fmtPct(cumulativeReturn)}
              icon={Target}
              delay={0.15}
              valueClass={cumulativeReturn >= 0 ? 'text-[#00FF88]' : 'text-[#FF4D67]'}
            />
            <StatCard
              label="勝率"
              value={`${winRate.toFixed(1)}%`}
              icon={Percent}
              delay={0.20}
              valueClass="text-[#FFC857]"
            />
            <StatCard
              label="Sharpe Ratio"
              value={sharpeRatio.toFixed(2)}
              icon={Activity}
              delay={0.25}
              valueClass={sharpeRatio >= 1 ? 'text-[#00FF88]' : 'text-[#FFC857]'}
            />
            <StatCard
              label="最大回撤"
              value={`${maxDrawdown.toFixed(2)}%`}
              icon={TrendingDown}
              delay={0.30}
              valueClass="text-[#FF4D67]"
            />
          </div>

          {/* ── 2. Holdings + Pie Chart Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Holdings Table */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.20 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Table size={14} className="text-[#00E5A8]" />
                  <span className="text-[13px] sm:text-[11px] font-medium text-zinc-400">持股明細</span>
                  <span className="text-[11px] sm:text-[9px] text-zinc-600 ml-auto">{holdings.length} 檔</span>
                </div>

                {/* Table header */}
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 pb-2 border-b border-white/[0.06] text-[11px] sm:text-[9px] text-zinc-600 font-medium uppercase tracking-wider">
                  <div className="flex-1">標的</div>
                  <div className="w-[55px] sm:w-[80px] text-right">股數</div>
                  <div className="w-[65px] sm:w-[90px] text-right">均價</div>
                  <div className="w-[65px] sm:w-[90px] text-right">現價</div>
                  <div className="w-[75px] sm:w-[100px] text-right">損益</div>
                </div>

                {/* Holdings rows */}
                <div className="divide-y divide-white/[0.04]">
                  {holdings.map((h, i) => (
                    <HoldingRow key={h.id} holding={h} rank={i + 1} />
                  ))}
                </div>

                {holdings.length === 0 && (
                  <div className="py-8 text-center text-[13px] sm:text-[11px] text-zinc-600">
                    尚無持股資料
                  </div>
                )}
              </motion.div>
            </div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.30 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon size={14} className="text-[#00E5A8]" />
                <span className="text-[13px] sm:text-[11px] font-medium text-zinc-400">資產配置</span>
              </div>

              {pieData.length > 0 ? (
                <div className="h-[220px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((_entry, idx) => (
                          <Cell
                            key={idx}
                            fill={PIE_COLORS[idx % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[180px] sm:h-[260px] text-[13px] sm:text-[11px] text-zinc-600">
                  無資產資料
                </div>
              )}

              {/* Legend */}
              <div className="mt-3 space-y-1.5">
                {pieData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center justify-between text-[13px] sm:text-[10px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="truncate text-zinc-400">{entry.name}</span>
                    </div>
                    <span className="font-mono text-zinc-500 ml-2">
                      {entry.percent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </section>
  );
}
