/**
 * TWSE API Proxy Route
 *
 * Browser → /api/twse → (server-to-server) → twse.com.tw
 *
 * 解決瀏覽器 CORS 封鎖問題。伺服器端抓取 TWSE 資料後直接返回已解析格式。
 * Vercel Edge/CDN 支援 response caching。
 */

export const dynamic = 'force-dynamic'; // 不 cache，每次請求都最新
export const runtime = 'nodejs';

interface TWSEStock {
  id: string
  name: string
  price: number
  change: number
  changeDir: 1 | -1 | 0
  open: number
  high: number
  low: number
  volume: number
  value: number
  tradeCount: number
  bid: number
  bidVolume: number
  ask: number
  askVolume: number
  pe: number
  changePct: number
}

/* ── helpers ──────────────────────────────────────────── */

function extractValue(raw: string): string {
  if (!raw) return '0'
  return raw.replace(/<[^>]*>/g, '').replace(/,/g, '').trim()
}

function parseDir(raw: string): 1 | -1 | 0 {
  if (!raw) return 0
  if (raw.includes('red')) return 1
  if (raw.includes('green')) return -1
  return 0
}

function parseTWSE(row: string[]): TWSEStock | null {
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

function tryDates(n = 5): string[] {
  const dates: string[] = []
  const now = new Date()
  const taipei = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }))
  for (let i = 0; i < n; i++) {
    const d = new Date(taipei)
    d.setDate(d.getDate() - i)
    const day = d.getDay()
    if (day === 0 || day === 6) continue
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    dates.push(`${y}${m}${dd}`)
  }
  return Array.from(new Set(dates))
}

/* ── GET handler ──────────────────────────────────────── */

export async function GET(request: Request) {
  const candidates = tryDates(5)
  let lastError = ''

  for (const date of candidates) {
    const url = `https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&date=${date}&type=ALL`
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Stock-Power/1.0' },
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) {
        lastError = `TWSE HTTP ${res.status}`
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

      return Response.json({
        date,
        stocks,
        stat: 'OK',
        fetchedAt: Date.now(),
      }, {
        headers: {
          // Vercel CDN: revalidate every 30s during trading hours
          'CDN-Cache-Control': 'max-age=30',
          'Cache-Control': 'public, max-age=0, s-maxage=30',
        },
      })

    } catch (e: any) {
      lastError = e.message || String(e)
      continue
    }
  }

  return Response.json(
    { error: `TWSE API 失敗: ${lastError}`, stocks: [], stat: 'FAIL', fetchedAt: Date.now() },
    { status: 502 }
  )
}
