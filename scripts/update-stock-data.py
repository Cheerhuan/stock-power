#!/usr/bin/env python3
"""
TWSE 每日收盤行情擷取 + stock-data.json 更新
GitHub Actions 定時執行
"""
import json, os, sys, urllib.request
from datetime import datetime, timedelta

BASE_URL = 'https://www.twse.com.tw/exchangeReport/MI_INDEX'
DATA_PATH = 'public/stock-data.json'

def latest_trade_day():
    now = datetime.utcnow() + timedelta(hours=8)  # Taipei
    for i in range(5):
        d = now - timedelta(days=i)
        if d.weekday() >= 5:  # 週末跳過
            continue
        return d.strftime('%Y%m%d')
    return now.strftime('%Y%m%d')

def fetch_twse(date):
    url = f'{BASE_URL}?response=json&date={date}&type=ALL'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode('utf-8'))

def parse_stock(row):
    if len(row) < 16:
        return None
    clean = lambda s: s.replace(',', '').replace('<p style= color:red>+</p>', '+').replace('<p style= color:green>-</p>', '-').strip()
    try:
        sid = row[0].strip()
        name = row[1].strip()
        close = float(clean(row[8]) or 0)
        if close == 0:
            return None
        change = float(clean(row[10]) or 0)
        for s in ['+', '-']:
            if s in row[9]:
                change_dir = 1 if s == '+' else -1
                break
        else:
            change_dir = 0
        open_p = float(clean(row[5]) or 0)
        high = float(clean(row[6]) or 0)
        low = float(clean(row[7]) or 0)
        volume = int(clean(row[2]) or 0)
        pe = float(clean(row[15]) or 0)
        return {
            'id': sid, 'name': name, 'price': close,
            'change': round(change * change_dir, 2),
            'changePct': round((change * change_dir) / open_p * 100, 2) if open_p > 0 else 0,
            'open': open_p, 'high': high, 'low': low,
            'volume': volume, 'pe': pe,
        }
    except (ValueError, IndexError):
        return None

def main():
    date = latest_trade_day()
    print(f'Fetching TWSE data for {date}...')
    data = fetch_twse(date)
    
    if data.get('stat') != 'OK':
        print(f'No data for {date}, trying previous day...')
        date = (datetime.strptime(date, '%Y%m%d') - timedelta(days=1)).strftime('%Y%m%d')
        data = fetch_twse(date)
    
    stocks = {}
    for table in data.get('tables', []):
        if '每日收盤行情' in (table.get('title', '')):
            for row in table.get('data', []):
                s = parse_stock(row)
                if s:
                    stocks[s['id']] = s
    
    print(f'Parsed {len(stocks)} stocks')
    
    # 讀取現有檔案，保留 AI/metadata 欄位
    existing = {}
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH) as f:
            existing = json.load(f)
    
    # 合併：保留 metadata, 更新價格
    for sid, live in stocks.items():
        meta = existing.get(sid, {})
        merged = {**meta, **live}
        # 保留 AI 相關欄位
        for key in ['score', 'advice', 'risk_score', 'consensus', 'consensus_count',
                     'concentration', 'short_ratio', 'big_holders', 'retail_ratio',
                     'foreign_position', 'margin_ratio', 'eps', 'dividend_yield',
                     'revenue_growth', 'inst_net']:
            if key in meta:
                merged[key] = meta[key]
        stocks[sid] = merged
    
    # 保留 market 數據
    if '_market' in existing:
        stocks['_market'] = existing['_market']
    if '_news' in existing:
        stocks['_news'] = existing['_news']
    if '_portfolio' in existing:
        stocks['_portfolio'] = existing['_portfolio']
    if '_indices' in existing:
        stocks['_indices'] = existing['_indices']
    if '_etfs' in existing:
        stocks['_etfs'] = existing['_etfs']
    if '_rankings' in existing:
        stocks['_rankings'] = existing['_rankings']
    if '_sectors' in existing:
        stocks['_sectors'] = existing['_sectors']
    
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(stocks, f, ensure_ascii=False, indent=2)
    
    print(f'Updated {DATA_PATH} with {len(stocks)} entries')
    return 0

if __name__ == '__main__':
    sys.exit(main())
