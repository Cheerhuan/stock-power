'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MOCK_STOCKS = [
  { id: '2330', name: 'TSMC' },
  { id: '2317', name: 'Foxconn' },
  { id: '2454', name: 'MediaTek' },
  { id: '2303', name: 'Umc' },
  { id: '2382', name: 'Hon Hai' },
];

export default function CommandPalette({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = MOCK_STOCKS.filter(s => s.id.includes(query) || s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center p-4 border-b border-zinc-800 gap-3">
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            autoFocus
            className="flex-1 bg-transparent outline-none text-zinc-100 placeholder-zinc-500"
            placeholder="Search stock ID or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500"><X size={16} /></button>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length > 0 ? filtered.map(stock => (
            <button 
              key={stock.id}
              onClick={() => { onSelect(stock.id); onClose(); }}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="font-medium">{stock.id}</span>
                <span className="text-xs opacity-50">{stock.name}</span>
              </div>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 bg-zinc-700 px-2 py-1 rounded">Select ↵</span>
            </button>
          )) : (
            <div className="p-8 text-center text-zinc-500 text-sm">No results found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
