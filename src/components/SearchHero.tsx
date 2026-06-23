'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

/* ── Hot stock IDs ── */
const HOT_STOCK_IDS = ['2330', 'NVDA', 'AAPL', 'TSLA', 'MSFT', 'GOOGL'];

/* ── Types ── */
interface Props {
  onSearch: (query: string) => void;
  onSelectStock: (stock: any) => void;
  recentStocks: any[];
  allStocks: any[];
  stockData: any;
  liveCount?: number;
}

/* ── Helpers ── */

/** Highlight matching text in a string */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-white font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

/* ── Component ── */
export default function SearchHero({
  onSearch,
  onSelectStock,
  recentStocks,
  allStocks,
  stockData,
  liveCount,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  /* Hydration safety + auto-focus */
  useEffect(() => {
    setMounted(true);
    // Slight delay to allow mount animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  /* ── Filter stocks by query ── */
  const filteredStocks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allStocks
      .filter(
        (s: any) =>
          String(s.id || '').toLowerCase().includes(q) ||
          String(s.name || '').toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [allStocks, query]);

  /* ── Hot stocks from allStocks ── */
  const hotStocks = useMemo(() => {
    return HOT_STOCK_IDS.map((id) =>
      allStocks.find((s: any) => String(s.id) === id)
    ).filter(Boolean) as any[];
  }, [allStocks]);

  /* ── Show results? ── */
  const showResults = query.trim().length > 0;
  const items = showResults ? filteredStocks : [];
  const totalItems = items.length;

  /* Reset active index when results change */
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  /* Reset refs length */
  itemRefs.current = itemRefs.current.slice(0, totalItems);

  /* ── Keyboard navigation ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(totalItems - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (totalItems > 0 && items[activeIndex]) {
          e.preventDefault();
          onSelectStock(items[activeIndex]);
        } else if (query.trim()) {
          e.preventDefault();
          onSearch(query.trim());
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setQuery('');
        inputRef.current?.blur();
      }
    },
    [activeIndex, totalItems, items, onSelectStock, onSearch, query]
  );

  /* Scroll active item into view */
  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  /* ── Render ── */
  if (!mounted) return null;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#0B0F17' }}
    >
      {/* ── Background gradient orbs ── */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(91, 140, 255, 0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 70% 60%, rgba(91, 140, 255, 0.05) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70%] h-[40%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(91, 140, 255, 0.03) 0%, transparent 60%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-12">
        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight">
            今天想研究哪支股票？
          </h1>
          <p className="text-base sm:text-lg mt-3" style={{ color: '#5A5D6B' }}>
            搜尋股票代號、公司名稱、ETF
          </p>
          {liveCount != null && liveCount > 0 && (
            <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
              即時資料 · {liveCount.toLocaleString()} 檔可搜尋
            </p>
          )}
        </motion.div>

        {/* ── Search Input ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div
            className={`
              relative flex items-center gap-3
              rounded-[24px] px-6 py-4
              transition-all duration-300
              border
              ${isFocused || query
                ? 'border-[#5B8CFF] shadow-[0_0_24px_rgba(91,140,255,0.15)]'
                : 'border-[rgba(255,255,255,0.08)]'
              }
            `}
            style={{ background: '#131A24' }}
          >
            {/* Search icon */}
            <Search
              size={20}
              className={`shrink-0 transition-colors duration-300 ${
                isFocused || query ? 'text-[#5B8CFF]' : 'text-zinc-500'
              }`}
            />

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="輸入股票代號或名稱..."
              className="flex-1 bg-transparent outline-none text-white text-base sm:text-lg placeholder-zinc-500 leading-relaxed"
              autoComplete="off"
              spellCheck={false}
            />

            {/* ⌘K badge */}
            <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg border shrink-0"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#5A5D6B',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              K
            </kbd>
          </div>

          {/* ── Results Dropdown ── */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                key="results-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.06)] shadow-2xl shadow-black/40 z-20"
                style={{ background: '#131A24' }}
              >
                {/* Results list */}
                <div
                  ref={listRef}
                  className="max-h-[360px] overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
                >
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-center px-4">
                      <Search size={24} className="text-zinc-700 mb-3" />
                      <span className="text-sm" style={{ color: '#5A5D6B' }}>
                        找不到相符的股票
                      </span>
                      <span className="text-[10px] text-zinc-700 mt-1">
                        嘗試不同的關鍵字
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-0.5 px-1.5">
                      {items.map((stock: any, idx: number) => {
                        const isActive = idx === activeIndex;
                        const pct = stock.changePct ?? stock.change_pct ?? stock.change;
                        const isPositive = (pct ?? 0) >= 0;
                        return (
                          <button
                            key={`result-${stock.id}`}
                            ref={(el) => {
                              itemRefs.current[idx] = el;
                            }}
                            onClick={() => onSelectStock(stock)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 text-left transition-all rounded-xl
                              ${isActive
                                ? 'bg-white/[0.08]'
                                : 'hover:bg-white/[0.04]'
                              }
                            `}
                          >
                            {/* Stock ID badge */}
                            <div
                              className={`
                                w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0
                                ${isPositive
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                                }
                              `}
                            >
                              {String(stock.id).slice(0, 3)}
                            </div>

                            {/* Name & ID */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-zinc-200 truncate">
                                <HighlightMatch text={String(stock.name || '')} query={query} />
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">
                                <HighlightMatch text={String(stock.id || '')} query={query} />
                              </div>
                            </div>

                            {/* Price & Change */}
                            <div className="text-right shrink-0">
                              <div className="text-sm font-mono font-medium text-white">
                                {stock.price?.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }) ?? '—'}
                              </div>
                              {stock.change !== undefined && (
                                <div
                                  className={`text-[11px] font-mono font-bold mt-0.5 ${
                                    (pct ?? 0) > 0
                                      ? 'text-emerald-400'
                                      : (pct ?? 0) < 0
                                      ? 'text-rose-400'
                                      : 'text-zinc-500'
                                  }`}
                                >
                                  {(pct ?? 0) > 0 ? '+' : ''}
                                  {(pct ?? 0).toFixed(2)}%
                                </div>
                              )}
                            </div>

                            {/* Active indicator */}
                            {isActive && (
                              <div className="w-1 h-8 rounded-full bg-[#5B8CFF] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer hints */}
                {items.length > 0 && (
                  <div
                    className="flex items-center gap-3 px-5 py-2.5 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <kbd className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#5A5D6B' }}
                      >↑↓</kbd>
                      <span className="text-[9px]" style={{ color: '#5A5D6B' }}>瀏覽</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#5A5D6B' }}
                      >↵</kbd>
                      <span className="text-[9px]" style={{ color: '#5A5D6B' }}>選擇</span>
                    </div>
                    <div className="flex-1" />
                    <span className="text-[9px]" style={{ color: '#5A5D6B' }}>
                      {items.length} 個結果
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Before typing: Hot Stocks + Recent ── */}
        <AnimatePresence mode="wait">
          {!showResults && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 space-y-8"
            >
              {/* ── Hot Stocks ── */}
              {hotStocks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFC857]" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#5A5D6B' }}>
                      熱門股票
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {hotStocks.map((stock: any) => {
                      const pct = stock.changePct ?? stock.change_pct ?? stock.change;
                      const isPositive = (pct ?? 0) >= 0;
                      return (
                        <motion.button
                          key={`hot-${stock.id}`}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => onSelectStock(stock)}
                          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderColor: 'rgba(255,255,255,0.06)',
                          }}
                        >
                          <span className="text-sm font-semibold text-white">{stock.id}</span>
                          <span className="text-[11px] text-zinc-400 truncate max-w-[80px]">
                            {stock.name}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {(pct ?? 0).toFixed(1)}%
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Recent Searches ── */}
              {recentStocks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#5A5D6B' }}>
                      最近搜尋
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {recentStocks.slice(0, 6).map((stock: any) => {
                      const pct = stock.changePct ?? stock.change_pct ?? stock.change;
                      const isPositive = (pct ?? 0) >= 0;
                      return (
                        <motion.button
                          key={`recent-${stock.id}`}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => onSelectStock(stock)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderColor: 'rgba(255,255,255,0.04)',
                          }}
                        >
                          <span className="text-xs font-medium text-zinc-300">{stock.id}</span>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {(pct ?? 0).toFixed(1)}%
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Keyboard hint ── */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#5A5D6B', borderColor: 'rgba(255,255,255,0.06)' }}
                  >⌘K</kbd>
                  <span className="text-[9px] text-zinc-700">快速搜尋</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#5A5D6B', borderColor: 'rgba(255,255,255,0.06)' }}
                  >Esc</kbd>
                  <span className="text-[9px] text-zinc-700">清除</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
