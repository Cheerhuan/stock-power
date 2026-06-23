'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  BrainCircuit,
  LineChart,
  PieChart,
  Newspaper,
  Command,
  Search,
  ArrowUpDown,
  ArrowLeft,
} from 'lucide-react';

/* ── Types ── */
interface StockItem {
  id: string;
  name: string;
  price?: number;
  change?: number;
  grade?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: any[];
  onSelectStock: (stock: any) => void;
  activeNav: string;
  onNavigate: (page: string) => void;
}

/* ── Page nav entries ── */
const PAGE_ENTRIES = [
  { id: 'dashboard',  label: '儀表板',  sub: 'Dashboard',  icon: LayoutDashboard },
  { id: 'market',     label: '市場',    sub: 'Market',     icon: TrendingUp },
  { id: 'ai_signals', label: 'AI 信號', sub: 'AI Signals', icon: BrainCircuit },
  { id: 'strategies', label: '策略',    sub: 'Strategies', icon: LineChart },
  { id: 'portfolio',  label: '投資組合', sub: 'Portfolio',  icon: PieChart },
  { id: 'news',       label: '新聞',    sub: 'News',       icon: Newspaper },
];

const QUICK_ACTIONS = [
  { id: 'back-to-search', label: '返回搜尋', shortcut: '⌘K', icon: ArrowLeft },
];

/* ── Category config ── */
interface CategoryGroup {
  key: string;
  label: string;
  items: any[];
  render: (item: any, idx: number, activeIdx: number) => React.ReactNode;
}

/* ── Component ── */
export default function CommandPalette({
  isOpen,
  onClose,
  stocks,
  onSelectStock,
  activeNav,
  onNavigate,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  /* Reset on open */
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Focus input on next tick after mount
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  /* Close on Escape (handled globally below) */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* ── Filter stocks ── */
  const filteredStocks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return (stocks || []).filter(
      (s: any) =>
        s?.id?.toLowerCase().includes(q) || s?.name?.toLowerCase().includes(q)
    );
  }, [stocks, query]);

  /* ── Build flat list of all results ── */
  const groups = useMemo<CategoryGroup[]>(() => {
    const result: CategoryGroup[] = [];

    // 1. Pages (always shown, filter by name if query)
    const pageQ = query.trim().toLowerCase();
    const filteredPages = pageQ
      ? PAGE_ENTRIES.filter(
          (p) =>
            p.label.toLowerCase().includes(pageQ) ||
            p.sub.toLowerCase().includes(pageQ) ||
            p.id.includes(pageQ)
        )
      : PAGE_ENTRIES;

    if (filteredPages.length > 0) {
      result.push({
        key: 'pages',
        label: 'Pages',
        items: filteredPages,
        render: (item, idx, activeIdx) => {
          const Icon = item.icon;
          const isActive = activeIdx === idx;
          return (
            <button
              key={`page-${item.id}`}
              ref={(el) => { itemRefs.current[idx] = el; }}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all rounded-lg ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#00E5A8]' : 'text-zinc-500'} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">{item.label}</span>
                <span className="text-[10px] text-zinc-600 block">{item.sub}</span>
              </div>
              {isActive && (
                <span className="text-[10px] text-zinc-600 bg-white/[0.06] px-1.5 py-0.5 rounded font-mono">↵</span>
              )}
            </button>
          );
        },
      });
    }

    // 2. Stocks (only when query)
    if (filteredStocks.length > 0) {
      result.push({
        key: 'stocks',
        label: 'Stocks',
        items: filteredStocks,
        render: (item, idx, activeIdx) => {
          const isActive = activeIdx === idx;
          return (
            <button
              key={`stock-${item.id}`}
              ref={(el) => { itemRefs.current[idx] = el; }}
              onClick={() => { onSelectStock(item); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all rounded-lg ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                item.change > 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : item.change < 0
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {item.id.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">{item.name}</span>
                <span className="text-[10px] text-zinc-600 block">{item.id}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-medium text-zinc-200">
                  {item.price?.toLocaleString() ?? '—'}
                </div>
                {item.change !== undefined && (
                  <div className={`text-[10px] font-mono font-bold ${
                    item.change > 0 ? 'text-emerald-500' : item.change < 0 ? 'text-rose-500' : 'text-zinc-500'
                  }`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </div>
                )}
              </div>
              {isActive && (
                <span className="text-[10px] text-zinc-600 bg-white/[0.06] px-1.5 py-0.5 rounded font-mono ml-1">↵</span>
              )}
            </button>
          );
        },
      });
    }

    // 3. Quick Actions (always shown)
    const filteredQA = query.trim().toLowerCase()
      ? QUICK_ACTIONS.filter(
          (a) =>
            a.label.toLowerCase().includes(query.trim().toLowerCase()) ||
            a.id.includes(query.trim().toLowerCase())
        )
      : QUICK_ACTIONS;

    if (filteredQA.length > 0) {
      result.push({
        key: 'quick-actions',
        label: 'Quick Actions',
        items: filteredQA,
        render: (item, idx, activeIdx) => {
          const Icon = item.icon;
          const isActive = activeIdx === idx;
          return (
            <button
              key={`qa-${item.id}`}
              ref={(el) => { itemRefs.current[idx] = el; }}
              onClick={() => {
                if (item.id === 'back-to-search') {
                  inputRef.current?.focus();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all rounded-lg ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={16} className="text-zinc-500" />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              <kbd className="text-[9px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">
                {item.shortcut}
              </kbd>
            </button>
          );
        },
      });
    }

    return result;
  }, [query, filteredStocks, onNavigate, onClose, onSelectStock]);

  /* ── Flatten for keyboard nav ── */
  const flatItems = useMemo(() => {
    const items: { groupIdx: number; itemIdx: number }[] = [];
    groups.forEach((g, gi) => {
      g.items.forEach((_, ii) => {
        items.push({ groupIdx: gi, itemIdx: ii });
      });
    });
    return items;
  }, [groups]);

  const totalItems = flatItems.length;

  /* ── Keyboard navigation ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(totalItems - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Tab') {
        // Cycle through groups
        e.preventDefault();
        const currentGroup = flatItems[activeIndex]?.groupIdx ?? 0;
        const nextGroup = (currentGroup + 1) % groups.length;
        // Find first item in next group
        const firstInGroup = flatItems.findIndex((f) => f.groupIdx === nextGroup);
        if (firstInGroup >= 0) {
          setActiveIndex(firstInGroup);
        }
      } else if (e.key === 'Enter' && totalItems > 0) {
        e.preventDefault();
        const target = flatItems[activeIndex];
        if (!target) return;
        const group = groups[target.groupIdx];
        const item = group.items[target.itemIdx];
        // Trigger click programmatically
        const btn = itemRefs.current[activeIndex];
        btn?.click();
      }
    },
    [activeIndex, totalItems, flatItems, groups]
  );

  /* ── Scroll active item into view ── */
  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  /* Reset refs array length */
  itemRefs.current = itemRefs.current.slice(0, totalItems);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            key="command-palette-modal"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-xl rounded-2xl shadow-2xl shadow-black/50 overflow-hidden border border-[var(--card-border)]"
            style={{
              background: 'rgba(14,17,25,0.95)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Search Input ── */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search size={18} className="text-zinc-500 shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="搜尋 Stocks, ETF, Pages..."
                className="flex-1 bg-transparent outline-none text-zinc-100 placeholder-zinc-500 text-sm leading-5"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 text-[9px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">
                <Command size={9} />K
              </kbd>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/[0.06] rounded-md text-zinc-500 transition-colors"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ── Results ── */}
            <div
              ref={listRef}
              className="max-h-[400px] overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              {totalItems === 0 && query.trim() ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Search size={28} className="text-zinc-700 mb-3" />
                  <span className="text-sm text-zinc-500">找不到相符的結果</span>
                  <span className="text-[10px] text-zinc-700 mt-1">嘗試不同的關鍵字</span>
                </div>
              ) : totalItems === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Command size={28} className="text-zinc-700 mb-3" />
                  <span className="text-sm text-zinc-500">輸入關鍵字開始搜尋</span>
                  <span className="text-[10px] text-zinc-700 mt-1">↑↓ 瀏覽 · ↵ 選擇 · Tab 切換群組 · Esc 關閉</span>
                </div>
              ) : (
                groups.map((group) => {
                  if (group.items.length === 0) return null;
                  // Build flat index offset for this group
                  const groupStartIdx = flatItems.findIndex(
                    (f) => f.groupIdx === groups.indexOf(group)
                  );
                  return (
                    <div key={group.key}>
                      <div className="flex items-center gap-2 px-3 py-1.5 mt-1 first:mt-0">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                          {group.label}
                        </span>
                        <div className="flex-1 h-px bg-white/[0.04]" />
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((item, ii) => {
                          const flatIdx = groupStartIdx + ii;
                          return group.render(item, flatIdx, activeIndex);
                        })}
                      </div>
                    </div>
                  );
                })
              )}

              {/* ── Footer hint ── */}
              {totalItems > 0 && (
                <div className="flex items-center gap-3 px-3 py-2 border-t border-white/[0.04] mt-2">
                  <div className="flex items-center gap-1.5">
                    <kbd className="text-[9px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">↑↓</kbd>
                    <span className="text-[9px] text-zinc-700">瀏覽</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="text-[9px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">↵</kbd>
                    <span className="text-[9px] text-zinc-700">選擇</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="text-[9px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">Tab</kbd>
                    <span className="text-[9px] text-zinc-700">群組</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="text-[9px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">Esc</kbd>
                    <span className="text-[9px] text-zinc-700">關閉</span>
                  </div>
                  <div className="flex-1" />
                  <ArrowUpDown size={10} className="text-zinc-700" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
