'use client';

import React, { useMemo, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

/* ── Hot stock IDs ── */
const HOT_STOCK_IDS = ['2330', 'NVDA', 'AAPL', 'TSLA', 'MSFT', 'GOOGL'];
const HOT_ETF_IDS = ['0050', '0056', '00878', '00713', '006208', '00929'];

/* ── Props ── */
interface Props {
  query: string;
  results: any[];
  selectedStock: any;
  onSelectStock: (stock: any) => void;
  onQueryChange?: (q: string) => void;
  allStocks: any[];
  recentStocks: any[];
  stockData: any;
}

/* ── Helpers ── */

/** Highlight matching text */
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

/** Format a stock row (used in results, recent, and hot ETFs) */
function StockRow({
  stock,
  isSelected,
  query,
  onClick,
}: {
  stock: any;
  isSelected: boolean;
  query?: string;
  onClick: () => void;
}) {
  const pct = stock.changePct ?? stock.change_pct ?? stock.change;
  const change = stock.change ?? stock.change_pct ?? 0;
  const price = stock.price ?? stock.close ?? 0;
  const isPositive = (pct ?? 0) >= 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 rounded-lg relative
        ${isSelected
          ? 'bg-indigo-500/12 border-l-2 border-indigo-400'
          : 'hover:bg-white/[0.04] border-l-2 border-transparent'
        }
      `}
    >
      {/* Ticker badge */}
      <div
        className={`
          w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0
          ${isPositive
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-rose-500/10 text-rose-400'
          }
        `}
      >
        {String(stock.id || stock.symbol || '').slice(0, 3)}
      </div>

      {/* Name & ID */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-zinc-200 truncate leading-snug">
          {query ? (
            <HighlightMatch text={String(stock.name || '')} query={query} />
          ) : (
            stock.name || stock.id
          )}
        </div>
        <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">
          {query ? (
            <HighlightMatch text={String(stock.id || stock.symbol || '')} query={query} />
          ) : (
            stock.id || stock.symbol
          )}
        </div>
      </div>

      {/* Price & Change */}
      <div className="text-right shrink-0">
        <div className="text-[13px] font-mono font-medium text-white leading-snug">
          {price
            ? Number(price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '—'}
        </div>
        {change !== undefined && change !== null && (
          <div
            className={`text-[10px] font-mono font-bold mt-0.5 ${
              change > 0
                ? 'text-emerald-400'
                : change < 0
                ? 'text-rose-400'
                : 'text-zinc-500'
            }`}
          >
            {change > 0 ? '+' : ''}
            {(pct ?? change).toFixed(2)}%
          </div>
        )}
      </div>
    </button>
  );
}

/* ── Component ── */
export default function StockList({
  query,
  results,
  selectedStock,
  onSelectStock,
  onQueryChange,
  allStocks,
  recentStocks,
  stockData,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  /* ── Filter stocks by query ── */
  const filteredStocks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    // Use results if provided, otherwise filter allStocks
    const source = results.length > 0 ? results : allStocks;
    return source.filter(
      (s: any) =>
        String(s.id || s.symbol || '').toLowerCase().includes(q) ||
        String(s.name || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [allStocks, results, query]);

  /* ── Hot stocks from allStocks ── */
  const hotStocks = useMemo(() => {
    return HOT_STOCK_IDS.map((id) =>
      allStocks.find((s: any) => String(s.id || s.symbol) === id)
    ).filter(Boolean) as any[];
  }, [allStocks]);

  /* ── Hot ETFs ── */
  const hotETFs = useMemo(() => {
    return HOT_ETF_IDS.map((id) =>
      allStocks.find((s: any) => String(s.id || s.symbol) === id)
    ).filter(Boolean) as any[];
  }, [allStocks]);

  /* ── Show results? ── */
  const showResults = query.trim().length > 0;

  /* ── Handle input change ── */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onQueryChange?.(e.target.value);
    },
    [onQueryChange]
  );

  /* ── Handle clear ── */
  const handleClear = useCallback(() => {
    onQueryChange?.('');
    inputRef.current?.focus();
  }, [onQueryChange]);

  /* ── Keyboard nav ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
        inputRef.current?.blur();
      }
    },
    [handleClear]
  );

  const isSelected = useCallback(
    (stock: any) => {
      const sid = selectedStock?.id || selectedStock?.symbol;
      const tid = stock?.id || stock?.symbol;
      return sid === tid;
    },
    [selectedStock]
  );

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* ── Search Input ── */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div
          className={`
            relative flex items-center gap-2
            rounded-xl px-3.5 py-2.5
            transition-all duration-200
            border
            ${isFocused || query
              ? 'border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.08)]'
              : 'border-white/[0.06]'
            }
          `}
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <Search
            size={14}
            className={`shrink-0 transition-colors ${
              isFocused || query ? 'text-indigo-400' : 'text-zinc-500'
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="搜尋股票代號或名稱..."
            className="flex-1 bg-transparent outline-none text-xs text-zinc-200 placeholder-zinc-600 leading-relaxed"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={handleClear}
              className="text-zinc-600 hover:text-zinc-400 transition-colors p-0.5"
              aria-label="Clear search"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          {showResults ? (
            /* ══ Results List ══ */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="space-y-0.5">
                {filteredStocks.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center px-4">
                    <Search size={20} className="text-zinc-700 mb-2" />
                    <span className="text-xs text-zinc-600">找不到相符的股票</span>
                    <span className="text-[10px] text-zinc-700 mt-1">嘗試不同的關鍵字</span>
                  </div>
                ) : (
                  filteredStocks.map((stock: any, idx: number) => {
                    const sel = isSelected(stock);
                    return (
                      <motion.div
                        key={`result-${stock.id || stock.symbol || idx}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.02 }}
                      >
                        <StockRow
                          stock={stock}
                          isSelected={sel}
                          query={query}
                          onClick={() => onSelectStock(stock)}
                        />
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Results count */}
              {filteredStocks.length > 0 && (
                <div className="text-[9px] text-zinc-700 text-center pt-3 pb-1">
                  {filteredStocks.length} 個結果
                </div>
              )}
            </motion.div>
          ) : (
            /* ══ Default view: Recent + Hot ══ */
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 pt-1"
            >
              {/* ── Recent Searches ── */}
              {recentStocks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-2">
                    <div className="w-1 h-1 rounded-full bg-zinc-500" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                      最近搜尋
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {recentStocks.slice(0, 8).map((stock: any, idx: number) => (
                      <StockRow
                        key={`recent-${stock.id || stock.symbol || idx}`}
                        stock={stock}
                        isSelected={isSelected(stock)}
                        onClick={() => onSelectStock(stock)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Hot Stocks ── */}
              {hotStocks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-2">
                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                      熱門股票
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 px-1">
                    {hotStocks.map((stock: any) => {
                      const pct = stock.changePct ?? stock.change_pct ?? stock.change;
                      const change = stock.change ?? stock.change_pct ?? 0;
                      const isPos = (pct ?? 0) >= 0;
                      return (
                        <motion.button
                          key={`hot-${stock.id}`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onSelectStock(stock)}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-xl border transition-all
                            ${isSelected(stock)
                              ? 'bg-indigo-500/12 border-indigo-400/30'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                            }
                          `}
                        >
                          <span className="text-xs font-semibold text-zinc-200">{stock.id}</span>
                          <span className="text-[10px] text-zinc-500 truncate flex-1">{stock.name}</span>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              isPos ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPos ? '+' : ''}
                            {(pct ?? 0).toFixed(1)}%
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Hot ETFs ── */}
              {hotETFs.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-2">
                    <div className="w-1 h-1 rounded-full bg-sky-500" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                      熱門 ETF
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {hotETFs.map((stock: any, idx: number) => (
                      <StockRow
                        key={`etf-${stock.id || stock.symbol || idx}`}
                        stock={stock}
                        isSelected={isSelected(stock)}
                        onClick={() => onSelectStock(stock)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
