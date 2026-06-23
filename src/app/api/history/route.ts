/**
 * TWSE 歷史 K 線資料 API Route
 *
 * /api/history?stockId=2330&months=6
 *
 * 從 TWSE STOCK_DAY 抓取個股歷史日成交資訊，回傳 OHLCV 陣列。
 * 支援多月份合併，自動處理民國年轉換。
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface OHLCV {
  time: string        // '2026-06-01'
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/* ── 民國年 → 西元年 ── */
function rocToAD(roc: string): string {
  // '115/06/01' → '2026-06-01'
  const parts = roc.split('/')
  const year = parseInt(parts[0]) + 1911
  return `${year}-${parts[1]}-${parts[2]}`
}

/* ── 取得過去 N 個月的月份列表 ── */
function getMonthList(monthsBack: number): string[] {
  const list: string[] = []
  const now = new Date()
  // 往前多抓一個月確保覆蓋
  for (let i = monthsBack + 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    list.push(`${y}${m}01`)
  }
  return list
}

/* ── GET /api/history?stockId=2330&months=6 ── */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stockId = searchParams.get('stockId') || '2330'
  const months = Math.min(parseInt(searchParams.get('months') || '6'), 24)

  const monthList = getMonthList(months)
  const allData: OHLCV[] = []
  let lastError = ''

  for (const ym of monthList) {
    const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${ym}&stockNo=${stockId}`
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Stock-Power/1.0' },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) continue
      const json = await res.json()
      if (json.stat !== 'OK') continue
      if (!json.data || json.data.length === 0) continue

      for (const row of json.data) {
        if (row.length < 10) continue
        const clean = (s: string) => parseFloat(s.replace(/,/g, '').trim())
        const open = clean(row[3])
        const high = clean(row[4])
        const low = clean(row[5])
        const close = clean(row[6])
        const volume = parseInt(row[1].replace(/,/g, ''), 10) || 0
        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) continue
        allData.push({
          time: rocToAD(row[0]),
          open, high, low, close, volume,
        })
      }
    } catch (e: any) {
      lastError = e.message || String(e)
      continue
    }
  }

  // 排序（舊 → 新）
  allData.sort((a, b) => a.time.localeCompare(b.time))

  // 去除重複日期（同個月可能多筆）
  const unique: OHLCV[] = []
  const seen = new Set<string>()
  for (const d of allData) {
    if (!seen.has(d.time)) {
      seen.add(d.time)
      unique.push(d)
    }
  }

  return Response.json({
    stockId,
    months,
    total: unique.length,
    data: unique,
    from: unique[0]?.time ?? null,
    to: unique[unique.length - 1]?.time ?? null,
  }, {
    headers: {
      'CDN-Cache-Control': 'max-age=300',
      'Cache-Control': 'public, max-age=0, s-maxage=300',
    },
  })
}
