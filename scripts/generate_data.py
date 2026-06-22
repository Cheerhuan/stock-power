import json, os, random
from datetime import datetime, timedelta

OUTPUT_FILE = '../public/stock-data.json'
SEED = 42
random.seed(SEED)

# 台股核心個股
STOCKS = [
    ('2330', '台積電', 1040, '半導體', ['AI概念股','權值股']),
    ('2317', '鴻海', 185, '電子代工', ['AI概念股','蘋概股','權值股']),
    ('2454', '聯發科', 1720, 'IC設計', ['AI概念股','權值股']),
    ('2303', '聯電', 112, '半導體', ['晶圓代工']),
    ('2382', '廣達', 290, '電腦週邊', ['AI概念股','伺服器']),
    ('2357', '華碩', 680, '電腦週邊', ['AI PC']),
    ('2376', '技嘉', 380, '電腦週邊', ['AI概念股','伺服器']),
    ('2383', '台光電', 950, '電子零組件', ['AI概念股','CCL']),
    ('3443', '創意', 1850, 'IC設計', ['ASIC','AI概念股']),
    ('3037', '欣興', 210, 'PCB', ['ABF載板']),
    ('3008', '大立光', 3200, '光學', ['蘋概股']),
    ('3231', '緯創', 155, '電腦週邊', ['AI概念股','伺服器']),
    ('6669', '緯穎', 2850, '電腦週邊', ['AI概念股','伺服器']),
    ('2451', '創見', 110, '記憶體', ['記憶體']),
    ('2345', '智邦', 680, '網通', ['AI概念股','400G交換器']),
    ('6446', '藥華藥', 420, '生技', ['新藥']),
    ('1216', '統一', 82, '食品', ['內需']),
    ('6505', '台塑化', 72, '塑膠', ['傳產']),
    ('2881', '富邦金', 95, '金融', ['金控']),
    ('2882', '國泰金', 72, '金融', ['金控']),
    ('2002', '中鋼', 25, '鋼鐵', ['傳產']),
    ('3045', '台灣大', 112, '電信', ['電信']),
    ('4904', '遠傳', 85, '電信', ['電信']),
    ('2207', '和泰車', 680, '汽車', ['內需']),
]

CONCEPT_MAP = {
    'AI概念股': ['2330','2317','2454','2382','2376','2383','3443','3231','6669','2345'],
    '權值股': ['2330','2317','2454','2881','2882'],
    '半導體': ['2330','2303'],
    '伺服器': ['2382','2376','3231','6669'],
    '蘋概股': ['2317','3008'],
    '金控': ['2881','2882'],
    '傳產': ['6505','2002'],
    '內需': ['1216','2207'],
    'IC設計': ['2454','3443'],
    '晶圓代工': ['2330','2303'],
}

SECTORS = ['半導體','IC設計','電腦週邊','電子代工','PCB','光學','電子零組件','網通','金融','食品','塑膠','鋼鐵','電信','汽車','生技','記憶體']

def gen_price_path(base, days=120):
    p = base * 0.85
    path = []
    for d in range(days):
        vol = random.uniform(-0.025, 0.025)
        p = p * (1 + vol)
        if d > 0 and d % 30 == 0:
            p = p * (1 + random.uniform(-0.08, 0.08))
        path.append(round(p, 2))
    return path

def gen_inst_data():
    tag = random.choice(['買超','買超','買超','買超','賣超','買超'])  # bias toward buy
    amount = random.randint(5, 200) * 10000000
    return amount if tag == '買超' else -amount

def build():
    data = {}
    taiex_base = 28000

    # 大盤模擬
    for d in range(120):
        taiex_base += random.uniform(-300, 350)
    taiex = round(taiex_base, 2)
    taiex_chg = round(random.uniform(-1.5, 2.0), 2)

    # 市場情緒
    total_vol = random.randint(3500, 5500)
    up_count = random.randint(300, 700)
    dn_count = random.randint(200, 500)

    market = {
        'taiex': taiex,
        'taiex_chg': taiex_chg,
        'total_vol': total_vol,
        'up_count': up_count,
        'dn_count': dn_count,
        'foreign_net': random.randint(-30, 80) * 10000000,
        'trust_net': random.randint(-5, 15) * 10000000,
        'dealer_net': random.randint(-8, 20) * 10000000,
        'margin_balance': round(random.uniform(3200, 3800), 1),
    }
    data['_market'] = market

    # 個股
    for sid, name, base_price, sector, concepts in STOCKS:
        prices = gen_price_path(base_price)
        cur = prices[-1]
        prev_close = prices[-2]
        change = round((cur - prev_close) / prev_close * 100, 2)
        direction = 'up' if change > 0 else 'down'

        vol_shares = random.randint(5000, 50000) * 1000
        inst_net = gen_inst_data()

        # 法人買賣超趨勢 (最近5日)
        inst_trend = [gen_inst_data() for _ in range(5)]

        # 基本面
        pe = round(base_price / random.uniform(4, 12), 1)
        eps = round(random.uniform(3, 35), 2)
        eps_growth = round(random.uniform(-5, 30), 1)
        pb = round(random.uniform(1.0, 8.0), 1)

        # 技術面
        ma5 = sum(prices[-5:])/5
        ma20 = sum(prices[-20:])/20
        rsi = round(random.uniform(30, 75), 1)
        is_above_ma = cur > ma20

        # 信號分析
        score = 0
        signals = []

        # 基本面分數
        if eps_growth > 10:
            score += 2
            signals.append('營收成長強勁')
        elif eps_growth > 0:
            signals.append('營收穩定')
        else:
            score -= 1
            signals.append('營收衰退')

        # 法人分數 (權重高)
        if inst_net > 50_000_000:
            score += 3
            signals.append('法人強力買超')
        elif inst_net > 10_000_000:
            score += 1
            signals.append('法人小幅買超')
        elif inst_net < -50_000_000:
            score -= 3
            signals.append('法人大幅賣超')
        elif inst_net < -10_000_000:
            score -= 1
            signals.append('法人小幅賣超')

        # 技術面
        if is_above_ma and rsi > 50:
            score += 1
            signals.append('站穩均線')
        elif not is_above_ma and rsi < 50:
            score -= 1
            signals.append('跌破均線')

        if score >= 4: grade, summary = 'A+', f'{name}：外資連續買超，營收成長強勁，技術面多頭排列。建議：逢低加碼。'
        elif score >= 2: grade, summary = 'A', f'{name}：法人偏多，基本面支撐，可考慮布局。建議：注意回檔風險。'
        elif score >= 0: grade, summary = 'B', f'{name}：中性偏多，仍需觀察成交量變化。建議：暫時持有。'
        elif score >= -2: grade, summary = 'C', f'{name}：法人動向分歧，建議觀望。建議：等待明確訊號。'
        else: grade, summary = 'D', f'{name}：法人持續賣超，技術面轉弱。建議：停損觀望。'

        record = {
            'id': sid, 'name': name, 'sector': sector, 'concepts': concepts,
            'price': cur, 'change': change,
            'high': max(prices[-20:]), 'low': min(prices[-20:]),
            'volume': vol_shares,
            'pe': pe, 'pb': pb, 'eps': eps, 'eps_growth': eps_growth,
            'market_cap': round(cur * random.uniform(0.8, 2.0), 1),
            'inst_net': inst_net,
            'inst_trend': inst_trend,
            'foreign_position': random.randint(50, 85),
            'margin_ratio': round(random.uniform(1.5, 8.0), 1),
            'ma5': round(ma5, 2),
            'ma20': round(ma20, 2),
            'rsi': rsi,
            'grade': grade,
            'summary': summary,
            'signals': signals,
            'score': score,
            'prices': [round(p, 2) for p in prices],
            'updated': datetime.now().strftime('%H:%M'),
        }
        data[sid] = record

    # 類股表現
    data['_sectors'] = {}
    for sec in SECTORS:
        stocks_in = [(k, v) for k, v in data.items() if isinstance(v, dict) and v.get('sector') == sec]
        if stocks_in:
            avg_chg = sum(s['change'] for _, s in stocks_in) / len(stocks_in)
            vol_sum = sum(s['volume'] for _, s in stocks_in)
            data['_sectors'][sec] = {
                'change': round(avg_chg, 2),
                'volume': vol_sum,
            }

    # 概念股表現
    data['_concepts'] = {}
    for cname, sids in CONCEPT_MAP.items():
        stocks_in = [data[s] for s in sids if s in data]
        if stocks_in:
            avg_chg = sum(s['change'] for s in stocks_in) / len(stocks_in)
            data['_concepts'][cname] = round(avg_chg, 2)

    # 大盤歷史數據 (for chart)
    taiex_history = []
    tp = 22000
    for d in range(120):
        tp += random.uniform(-250, 300)
        taiex_history.append(round(tp, 2))
    data['_taiex_history'] = taiex_history

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'✅ 數據已生成：{OUTPUT_FILE}')
    print(f'   個股：{len([k for k in data if isinstance(data[k], dict) and "price" in data[k]])} 檔')
    print(f'   類股：{len(data.get("_sectors", {}))} 個')
    print(f'   概念股：{len(data.get("_concepts", {}))} 個')

if __name__ == '__main__':
    build()
