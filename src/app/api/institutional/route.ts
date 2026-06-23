/**
 * TWSE 三大法人買賣超 API Proxy
 *
 * 從 TWSE BFI82U 抓取特定股票的三大法人買賣超明細。
 * 回傳格式：{ foreign, investment_trust, dealer_self, dealer_hedge, dealer_total }
 * 單位：股
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function extractValue(raw: string): string {
  if (!raw) return '0'
  return raw.replace(/<[^>]*>/g, '').replace(/,/g, '').trim()
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stockId = searchParams.get('stockId')

  if (!stockId) {
    return Response.json({ error: 'Missing stockId parameter' }, { status: 400 })
  }

  const dates = tryDates(5)
  let lastError = ''

  for (const date of dates) {
    const url = `https://www.twse.com.tw/fund/BFI82U?response=json&dayDate=${date}`
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Stock-Power/1.0' },
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) {
        lastError = `HTTP ${res.status}`
        continue
      }

      const json = await res.json()
      if (json.stat !== 'OK') {
        lastError = json.stat || 'no data'
        continue
      }

      // 從 data 陣列中找到目標股票
      for (const row of json.data || []) {
        if (!row || row.length < 5) continue
        const sid = String(row[0] ?? '').trim()
        if (sid !== stockId) continue

        const foreign = parseInt(extractValue(row[2] ?? '0'), 10) || 0
        const investmentTrust = parseInt(extractValue(row[3] ?? '0'), 10) || 0
        const dealerSelf = parseInt(extractValue(row[5] ?? '0'), 10) || 0
        const dealerHedge = parseInt(extractValue(row[6] ?? '0'), 10) || 0

        return Response.json({
          stockId,
          date,
          foreign,
          investment_trust: investmentTrust,
          dealer_self: dealerSelf,
          dealer_hedge: dealerHedge,
          dealer_total: dealerSelf + dealerHedge,
          // 總買賣超為三者合計（不含重複計算 dealer）
          total: foreign + investmentTrust + dealerSelf + dealerHedge,
          fetchedAt: Date.now(),
        })
      }

      // 找到該日資料但沒有這檔股票（可能未交易）
      lastError = `stock ${stockId} not found in ${date} data`
      continue

    } catch (e: any) {
      lastError = e.message || String(e)
      continue
    }
  }

  return Response.json({
    error: `三大法人資料失敗: ${lastError}`,
    stockId,
    foreign: 0,
    investment_trust: 0,
    dealer_self: 0,
    dealer_hedge: 0,
    dealer_total: 0,
    total: 0,
    fetchedAt: Date.now(),
  })
}
