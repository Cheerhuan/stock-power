'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Bookmark,
} from 'lucide-react';

/* ── Types ── */
interface NewsItem {
  title: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  industry: string;
  summary: string;
  time: string;
}

interface Props {
  stockData: any;
}

/* ── Sentiment helpers ── */
const SENTIMENT_LABELS: Record<string, { label: string; badgeClass: string; textClass: string; icon: React.ElementType }> = {
  positive: { label: '利多', badgeClass: 'bg-[#00FF88]/12 text-[#00FF88] border-[#00FF88]/20', textClass: 'text-[#00FF88]', icon: TrendingUp },
  negative: { label: '利空', badgeClass: 'bg-[#FF4D67]/12 text-[#FF4D67] border-[#FF4D67]/20', textClass: 'text-[#FF4D67]', icon: TrendingDown },
  neutral:  { label: '中性', badgeClass: 'bg-zinc-500/12 text-zinc-400 border-zinc-500/20', textClass: 'text-zinc-400', icon: Minus },
};

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-[#00FF88]';
  if (score >= 50) return 'text-[#FFC857]';
  return 'text-[#FF4D67]';
}

/* ── Single News Card ── */
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const sentiment = SENTIMENT_LABELS[item.sentiment] ?? SENTIMENT_LABELS.neutral;
  const SentimentIcon = sentiment.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-xl p-4 md:p-5 glass-sm-hover cursor-pointer group"
    >
      <div className="flex gap-3">
        {/* ── Left: Sentiment Badge ── */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
          <div
            className={`flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-lg border text-[11px] md:text-[9px] font-bold ${sentiment.badgeClass}`}
          >
            <SentimentIcon size={18} className="md:size-[14px]" />
          </div>
          <span className={`text-[10px] md:text-[8px] font-semibold ${sentiment.textClass}`}>
            {sentiment.label}
          </span>
        </div>

        {/* ── Right: Content ── */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title */}
          <h3 className="text-[13px] font-bold text-white leading-snug group-hover:text-[#00E5A8] transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* AI Summary */}
          <p className="text-[13px] md:text-[11px] text-zinc-500 leading-relaxed line-clamp-3">
            {item.summary}
          </p>

          {/* ── Bottom Row ── */}
          <div className="flex items-center flex-wrap gap-x-2 md:gap-x-3 gap-y-1.5 pt-1">
            {/* Source */}
            <div className="flex items-center gap-1 text-[12px] md:text-[10px] text-zinc-600">
              <Newspaper size={12} className="text-zinc-700" />
              <span>{item.source}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-[12px] md:text-[10px] text-zinc-600">
              <Clock size={12} className="text-zinc-700" />
              <span>{item.time}</span>
            </div>

            {/* Industry Tag */}
            {item.industry && (
              <span className="text-[11px] md:text-[9px] px-1.5 py-0.5 rounded-full bg-[#00E5A8]/8 text-[#00E5A8] border border-[#00E5A8]/12">
                {item.industry}
              </span>
            )}

            {/* Sentiment Score Badge */}
            <span
              className={`ml-auto text-[12px] md:text-[10px] font-bold font-mono ${getScoreColor(item.score)}`}
            >
              {item.score}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Skeleton Loading ── */
function NewsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-xl p-4 md:p-5">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 skeleton rounded" />
              <div className="h-3 w-full skeleton rounded" />
              <div className="h-3 w-5/6 skeleton rounded" />
              <div className="flex gap-3 pt-1">
                <div className="h-3 w-16 skeleton rounded" />
                <div className="h-3 w-12 skeleton rounded" />
                <div className="h-3 w-14 skeleton rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty State ── */
function NewsEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-xl py-16 text-center"
    >
      <Bookmark size={36} className="mx-auto mb-3 text-zinc-700" />
      <p className="text-sm text-zinc-600">目前無相關新聞</p>
      <p className="text-[11px] text-zinc-700 mt-1">資料更新後將自動顯示</p>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function NewsIntelligence({ stockData }: Props) {
  const news: NewsItem[] = useMemo(() => stockData?._news ?? [], [stockData]);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredNews = useMemo(() => {
    if (activeFilter === 'all') return news;
    if (activeFilter === 'positive') return news.filter((n) => n.sentiment === 'positive');
    if (activeFilter === 'negative') return news.filter((n) => n.sentiment === 'negative');
    return news;
  }, [news, activeFilter]);

  const positiveCount = useMemo(() => news.filter((n) => n.sentiment === 'positive').length, [news]);
  const negativeCount = useMemo(() => news.filter((n) => n.sentiment === 'negative').length, [news]);

  const FILTER_TABS = [
    { key: 'all', label: '全部', count: news.length },
    { key: 'positive', label: '利多', count: positiveCount },
    { key: 'negative', label: '利空', count: negativeCount },
  ] as const;

  return (
    <section className="py-8">
      <div className="section-container section-spacing">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">即時新聞中心</h2>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                AI 智能分析 · 即時新聞資訊
              </p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
            Live
          </div>
        </motion.div>

        {/* ── Sentiment Summary Bar ── */}
        {news.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4 text-[11px] md:text-[10px]"
          >
            <span className="text-zinc-500 font-medium">新聞情緒</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[#00FF88]">
                <TrendingUp size={11} />
                {positiveCount} 利多
              </span>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1 text-[#FF4D67]">
                <TrendingDown size={11} />
                {negativeCount} 利空
              </span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500">
                共 {news.length} 則
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Filter Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex gap-1 mb-4 overflow-x-auto scrollbar-none"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-10 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/20'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-[9px] font-mono ${
                      isActive ? 'text-[#00E5A8]/60' : 'text-zinc-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ── News Cards ── */}
        <div className="space-y-2 md:space-y-3">
          {news.length === 0 ? (
            <NewsSkeleton />
          ) : filteredNews.length === 0 ? (
            <NewsEmpty />
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNews.map((item, i) => (
                <NewsCard key={`${item.title}-${i}`} item={item} index={i} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
