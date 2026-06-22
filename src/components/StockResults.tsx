'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import StockList from './StockList';
import StockDetail from './StockDetail';

interface StockResultsProps {
  query: string;
  results: any[];
  selectedStock: any;
  onSelectStock: (stock: any) => void;
  onBack: () => void;
  allStocks: any[];
  recentStocks: any[];
  stockData: any;
  liveStocks?: any[];
}

export default function StockResults({
  query,
  results,
  selectedStock,
  onSelectStock,
  onBack,
  allStocks,
  recentStocks,
  stockData,
  liveStocks,
}: StockResultsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        overflow: 'hidden',
        background: '#0B0F17',
      }}
    >
      {/* LEFT: Stock List Sidebar */}
      <div
        style={{
          width: 320,
          minWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
          overflowY: 'auto',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            minHeight: 52,
          }}
        >
          <button
            onClick={onBack}
            aria-label="Back to search"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: 'rgba(255,255,255,0.06)',
              color: '#B0B3C6',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = '#B0B3C6';
            }}
          >
            <ArrowLeft size={18} />
          </button>

          {selectedStock && (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#E8E9ED',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}
              >
                {selectedStock.name || selectedStock.id}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#5A5D6B',
                  fontFamily: 'monospace',
                  lineHeight: 1.2,
                }}
              >
                {selectedStock.id}
              </div>
            </div>
          )}
        </div>

        {/* Stock List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <StockList
            query={query}
            results={results}
            selectedStock={selectedStock}
            onSelectStock={onSelectStock}
            allStocks={allStocks}
            recentStocks={recentStocks}
            stockData={stockData}
          />
        </div>
      </div>

      {/* RIGHT: Stock Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedStock ? (
          <motion.div
            key={selectedStock.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              flex: 1,
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <StockDetail
              stock={selectedStock}
              stockData={stockData}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5A5D6B',
              fontSize: 14,
              fontFamily: 'monospace',
            }}
          >
            Select a stock to view details
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
