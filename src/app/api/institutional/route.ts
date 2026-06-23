import { NextRequest, NextResponse } from 'next/server';

/**
 * TWSE 三大法人買賣超明細（T86）
 *
 * T86 回傳所有股票當日三大法人買賣超：
 *   [0]  證券代號
 *   [1]  證券名稱
 *   [2]  外陸資買進股數
 *   [3]  外陸資賣出股數
 *   [4]  外陸資買賣超股數          ← 外資淨買超
 *   [5]  外資自營商買進股數
 *   [6]  外資自營商賣出股數
 *   [7]  外資自營商買賣超股數
 *   [8]  投信買進股數
 *   [9]  投信賣出股數
 *   [10] 投信買賣超股數            ← 投信淨買超
 *   [11] 自營商買賣超股數（自行+避險） ← 自營商淨買超
 *   [18] 三大法人買賣超股數
 */

function toInt(v: string | null | undefined): number {
  if (!v) return 0;
  return parseInt(v.replace(/,/g, ''), 10) || 0;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stockId = searchParams.get('stockId');

  if (!stockId) {
    return NextResponse.json({ error: 'Missing stockId parameter' }, { status: 400 });
  }

  // 今天日期（台北時間）
  const now = new Date();
  const twDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const yyyyMMdd = twDate.toISOString().slice(0, 10).replace(/-/g, '');

  // 嘗試最近 5 個交易日（因 T86 只有交易日有資料）
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(twDate.getTime() - offset * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const url = `https://www.twse.com.tw/fund/T86?response=json&date=${dateStr}&selectType=ALL`;

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();

      // TWSE 偶爾回傳非 JSON（流量管制）
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        continue;
      }

      if (json.stat !== 'OK' || !Array.isArray(json.data)) continue;

      // 搜尋目標股票
      const row = json.data.find((r: string[]) => r[0]?.trim() === stockId);
      if (!row) continue;

      const foreign = toInt(row[4]);
      const investment_trust = toInt(row[10]);
      const dealer_total = toInt(row[11]);

      return NextResponse.json({
        stockId,
        date: dateStr,
        foreign,
        investment_trust,
        dealer_total,
        total: foreign + investment_trust + dealer_total,
      });
    } catch {
      continue; // timeout / 錯誤 → 試前一天
    }
  }

  // 完全找不到資料
  return NextResponse.json({
    stockId,
    date: null,
    error: 'No institutional data found in recent trading days',
    foreign: 0,
    investment_trust: 0,
    dealer_total: 0,
  });
}

export const dynamic = 'force-dynamic';
