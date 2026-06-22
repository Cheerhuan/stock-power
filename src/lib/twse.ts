/**
 * TWSE 台灣證券交易所數據客戶端
 * 即時抓取所有上市/上櫃股票、ETF 收盤行情
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

/** 從 HTML 標籤中提取數值 */
function extractValue(raw: string): string {
  if (!raw) return '0'
  return raw.replace(/<[^>]*>/g, '').replace(/,/g, '').trim()
}

/** 解析漲跌方向 */
function parseDir(raw: string): 1 | -1 | 0 {
  if (!raw) return 0
  if (raw.includes('red')) return 1
  if (raw.includes('green')) return -1
  return 0
}

/** 解析 TWSE 一行資料 → 我們的格式 */
export function parseTWSE(row: string[]): TWSEStock | null {
  if (!row || row.length < 16) return null
  try {
    const id = row[0]?.trim() ?? ''
    if (!id || id.length < 4) return null
    const name = row[1]?.trim() ?? ''
    if (!name) return null
    const closeStr = extractValue(row[8] ?? '0')
    const close = parseFloat(closeStr)
    if (isNaN(close)) return null
    const changeStr = extractValue(row[10] ?? '0')
    const change = parseFloat(changeStr)
    const dir = parseDir(row[9] ?? '')
    const open = parseFloat(extractValue(row[5] ?? '0'))
    const high = parseFloat(extractValue(row[6] ?? '0'))
    const low = parseFloat(extractValue(row[7] ?? '0'))
    const volume = parseInt(extractValue(row[2] ?? '0'), 10) || 0
    const value = parseFloat(extractValue(row[4] ?? '0')) || 0
    const tradeCount = parseInt(extractValue(row[3] ?? '0'), 10) || 0
    const bid = parseFloat(extractValue(row[11] ?? '0'))
    const bidVolume = parseInt(extractValue(row[12] ?? '0'), 10) || 0
    const ask = parseFloat(extractValue(row[13] ?? '0'))
    const askVolume = parseInt(extractValue(row[14] ?? '0'), 10) || 0
    const pe = parseFloat(extractValue(row[15] ?? '0'))
    const changePct = open > 0 ? (change / open) * 100 : 0
    return {
      id, name, price: close, change, changeDir: dir,
      open, high, low, volume, value, tradeCount,
      bid, bidVolume, ask, askVolume, pe, changePct,
    }
  } catch {
    return null
  }
}

/** 取得最新交易日 YYYYMMDD */
function latestTradeDay(): string {
  const now = new Date()
  const taipei = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }))
  const day = taipei.getDay()
  // 週末往前推
  if (day === 0) taipei.setDate(taipei.getDate() - 2)
  else if (day === 6) taipei.setDate(taipei.getDate() - 1)
  const y = taipei.getFullYear()
  const m = String(taipei.getMonth() + 1).padStart(2, '0')
  const d = String(taipei.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

/** 嘗試前 N 個交易日 */
function tryDates(n = 5): string[] {
  const dates: string[] = []
  const now = new Date()
  const taipei = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }))
  for (let i = 0; i < n; i++) {
    const d = new Date(taipei)
    d.setDate(d.getDate() - i)
    const day = d.getDay()
    if (day === 0 || day === 6) continue // skip weekends
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    dates.push(`${y}${m}${dd}`)
  }
  return Array.from(new Set(dates))
}

/** 從 TWSE 抓取所有股票收盤行情 */
export async function fetchAllStocks(signal?: AbortSignal): Promise<TWSEResponse> {
  // 回傳快取 (30s TTL)
  if (cachedResponse && Date.now() - lastFetch < CACHE_TTL) {
    return cachedResponse
  }

  const candidates = tryDates(5)
  let lastError = ''

  for (const date of candidates) {
    const baseUrl = 'https://www.twse.com.tw/exchangeReport/MI_INDEX'
    const url = `${baseUrl}?response=json&date=${date}&type=ALL`
    try {
      const res = await fetch(url, { signal })
      if (!res.ok) {
        lastError = `HTTP ${res.status}`
        continue
      }
      const json = await res.json()
      if (json.stat !== 'OK') {
        lastError = json.stat || 'no data'
        continue
      }
      const stocks: TWSEStock[] = []
      for (const table of json.tables || []) {
        if (table.title?.includes('每日收盤行情')) {
          for (const row of table.data || []) {
            const parsed = parseTWSE(row)
            if (parsed) stocks.push(parsed)
          }
        }
      }
      if (stocks.length === 0) {
        lastError = 'empty data'
        continue
      }
      const result: TWSEResponse = {
        date, stocks, stat: 'OK',
        fetchedAt: Date.now(),
      }
      cachedResponse = result
      lastFetch = Date.now()
      return result
    } catch (e: any) {
      if (e.name === 'AbortError') throw e
      lastError = e.message || String(e)
      continue
    }
  }
  throw new Error(`TWSE API 失敗: ${lastError}`)
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
    // 精確匹配優先
    if (id === lower || name === lower) return true
    // 前綴匹配
    if (id.startsWith(lower) || name.startsWith(lower)) return true
    // 模糊匹配
    return id.includes(lower) || name.includes(lower)
  })
  // 排序：精確 > 前綴 > 模糊
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
    return sb - sa // higher score first
  })
  return filtered.slice(0, limit)
}

/** 清除快取 (強制重新抓取) */
export function clearCache() {
  cachedResponse = null
  lastFetch = 0
}
