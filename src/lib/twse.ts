/**
 * TWSE 台灣證券交易所 — 前端客戶端
 *
 * 透過 API Route (/api/twse) 代理抓取，避免瀏覽器 CORS 封鎖。
 * 本地保留了備用解析邏輯（靜態 stock-data.json fallback）。
 */

export interface TWSEStock {
  id: string            // 證券代號 (ex: 2330)
  name: string          // 證券名稱 (ex: 台積電)
  price: number         // 收盤價
  change: number        // 漲跌價差
  changeDir: 1 | -1 | 0 // 漲跌方向
  open: number          // 開盤價
  high: number          // 最高價
  low: number           // 最低價
  volume: number        // 成交股數
  value: number         // 成交金額
  tradeCount: number    // 成交筆數
  bid: number           // 最後揭示買價
  bidVolume: number     // 最後揭示買量
  ask: number           // 最後揭示賣價
  askVolume: number     // 最後揭示賣量
  pe: number            // 本益比
  changePct: number     // 漲跌幅 %
}

export interface TWSEResponse {
  date: string          // YYYYMMDD
  stocks: TWSEStock[]
  stat: 'OK' | string
  fetchedAt: number     // timestamp
}

/** 記憶體快取 */
let cachedResponse: TWSEResponse | null = null
let lastFetch = 0
const CACHE_TTL = 30_000 // 30 秒

/**
 * 從 API Route 抓取所有股票即時收盤行情
 *
 * 瀏覽器 → /api/twse → (server) → twse.com.tw
 * 伺服器端抓取，無 CORS 問題。
 */
export async function fetchAllStocks(signal?: AbortSignal): Promise<TWSEResponse> {
  // 回傳快取 (30s TTL)
  if (cachedResponse && Date.now() - lastFetch < CACHE_TTL) {
    return cachedResponse
  }

  try {
    const res = await fetch('/api/twse', { signal })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `API ${res.status}`)
    }
    const result: TWSEResponse = await res.json()
    if (result.stat !== 'OK') {
      throw new Error(result.stat || 'API 回傳失敗')
    }
    if (!result.stocks || result.stocks.length === 0) {
      throw new Error('無資料')
    }

    cachedResponse = result
    lastFetch = Date.now()
    return result
  } catch (e: any) {
    if (e.name === 'AbortError') throw e
    // 清除過期快取，下次重試
    cachedResponse = null
    lastFetch = 0
    throw new Error(`即時資料抓取失敗: ${e.message}`)
  }
}

/** 搜尋台股 (id 或 name 模糊匹配) */
export function searchStocks(
  stocks: TWSEStock[],
  query: string,
  limit = 30
): TWSEStock[] {
  if (!query.trim()) return []
  const lower = query.toLowerCase().trim()
  const filtered = stocks.filter(s => {
    const id = s.id.toLowerCase()
    const name = s.name.toLowerCase()
    if (id === lower || name === lower) return true
    if (id.startsWith(lower) || name.startsWith(lower)) return true
    return id.includes(lower) || name.includes(lower)
  })
  filtered.sort((a, b) => {
    const aId = a.id.toLowerCase(), bId = b.id.toLowerCase()
    const aName = a.name.toLowerCase(), bName = b.name.toLowerCase()
    const score = (s: string): number => {
      if (s === lower) return 3
      if (s.startsWith(lower)) return 2
      if (s.includes(lower)) return 1
      return 0
    }
    const sa = Math.max(score(aId), score(aName))
    const sb = Math.max(score(bId), score(bName))
    return sb - sa
  })
  return filtered.slice(0, limit)
}

/** 清除快取 (強制重新抓取) */
export function clearCache() {
  cachedResponse = null
  lastFetch = 0
}
