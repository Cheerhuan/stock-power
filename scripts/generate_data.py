#!/usr/bin/env python3
"""Stock Power v3.0 — 台股 AI 投資終端 數據生成器"""
import json, os, random
random.seed(42)

OUTPUT = 'public/stock-data.json'

# ─── 核心個股 ───
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

# ─── ETF ───
ETFS = [
    ('0050', '元大台灣50', 185),
    ('0056', '元大高股息', 38),
    ('00878', '國泰永續高股息', 22),
    ('00919', '群益台灣精選高息', 25),
    ('00929', '復華台灣科技優息', 19),
    ('00940', '元大台灣價值高息', 11),
]

# ─── 全球指數 ───
INDICES = [
    ('TAIEX', '加權指數', 29745),
    ('TPEX', '櫃買指數', 256),
    ('T50', '台灣50', 148),
    ('FBT50', '富邦台50', 86),
]

# ─── 名人投資策略 ───
INVESTORS = [
    ('buffett', 'Warren Buffett', '價值投資', 'Buy great companies at fair prices', 93),
    ('lynch', 'Peter Lynch', '成長投資', 'Invest in what you know', 87),
    ('munger', 'Charlie Munger', '集中投資', 'Patience, mental models, invert', 91),
    ('graham', 'Benjamin Graham', '安全邊際', 'Margin of safety, $1 for 50¢', 78),
    ('dalio', 'Ray Dalio', '全天候', 'Risk parity, diversify cycles', 85),
    ('soros', 'George Soros', '反射理論', 'Reflexivity, exploit trends', 72),
]

SECTORS = ['半導體','IC設計','電腦週邊','電子代工','PCB','光學','電子零組件','網通','金融','食品','塑膠','鋼鐵','電信','汽車','生技','記憶體']

def gen_price_path(base, days=120):
    p = base * 0.85
    path = []
    for d in range(days):
        vol = random.uniform(-0.025, 0.025)
        p *= (1 + vol)
        if d > 0 and d % 30 == 0:
            p *= (1 + random.uniform(-0.08, 0.08))
        path.append(round(p, 2))
    return path

def gen_inst_data(bias='buy'):
    return random.randint(5, 200) * 10000000 if bias == 'buy' else -random.randint(5, 150) * 10000000

def famous_investor_decision(investor, stock_record):
    """模擬名人策略是否符合某個股"""
    score = stock_record['score']
    pe = stock_record['pe']
    eps_growth = stock_record.get('eps_growth', 0)
    rsi = stock_record.get('rsi', 50)
    inst_net = stock_record.get('inst_net', 0)

    thresholds = {
        'buffett': {'min_score': 2, 'max_pe': 180},
        'lynch': {'min_score': 2, 'min_growth': 5},
        'munger': {'min_score': 3, 'max_pe': 200},
        'graham': {'min_score': 0, 'max_pe': 150},
        'dalio': {'min_score': 0, 'rsi_range': (30, 70)},
        'soros': {'rsi_range': (20, 60)},
    }
    t = thresholds[investor]
    if investor == 'buffett':
        return score >= t['min_score'] and pe <= t['max_pe'] and inst_net > 0
    elif investor == 'lynch':
        return score >= t['min_score'] and eps_growth >= t['min_growth']
    elif investor == 'munger':
        return score >= t['min_score'] and pe <= t['max_pe']
    elif investor == 'graham':
        return score >= t['min_score'] and pe <= t['max_pe'] and eps_growth > 0
    elif investor == 'dalio':
        return t['rsi_range'][0] <= rsi <= t['rsi_range'][1]
    elif investor == 'soros':
        return t['rsi_range'][0] <= rsi <= t['rsi_range'][1] and abs(inst_net) > 50000000
    return False

def build():
    data = {}

    # ─── 大盤數據 ───
    taiex_base = 28000
    for _ in range(120):
        taiex_base += random.uniform(-300, 350)
    taiex = round(taiex_base, 2)

    # 市場情緒
    fear_greed = random.randint(35, 75)
    ai_market_score = random.randint(55, 88)

    # 大盤歷史
    taiex_history = []
    tp = 22000
    for d in range(120):
        tp += random.uniform(-250, 300)
        taiex_history.append(round(tp, 2))

    market = {
        'taiex': taiex,
        'taiex_chg': round(random.uniform(-1.5, 2.5), 2),
        'total_vol': random.randint(3500, 5500),
        'total_amount': random.randint(3500, 6500),
        'up_count': random.randint(300, 700),
        'dn_count': random.randint(200, 500),
        'unchanged_count': random.randint(50, 150),
        'margin_balance': round(random.uniform(3200, 3800), 1),
        'margin_buy': round(random.uniform(600, 1200), 1),
        'margin_sell': round(random.uniform(550, 1100), 1),
        'short_balance': round(random.uniform(60, 90), 1),
        'short_buy': round(random.uniform(3, 8), 1),
        'short_sell': round(random.uniform(2, 6), 1),
        'fear_greed': fear_greed,
        'ai_market_score': ai_market_score,
        'taiex_history': taiex_history,
        'market_status': 'close',  # open / close / preopen
        'market_next_open': '09:00',
        'market_next_open_ts': 36000,  # seconds until open
    }

    # 法人數據
    for inst, label in [('foreign', '外資'), ('trust', '投信'), ('dealer', '自營商')]:
        trend = {}
        for period in [5, 20, 60]:
            trend[str(period)] = [gen_inst_data() for _ in range(period)]
        market[f'{inst}_trend'] = trend
        market[f'{inst}_net'] = sum(trend['5']) // 5

    data['_market'] = market

    # ─── 個股 ───
    for sid, name, base_price, sector, concepts in STOCKS:
        prices = gen_price_path(base_price)
        cur = prices[-1]
        prev_close = prices[-2]
        change = round((cur - prev_close) / prev_close * 100, 2)

        vol_shares = random.randint(5000, 50000) * 1000
        inst_net = gen_inst_data()

        inst_trend_5 = [gen_inst_data() for _ in range(5)]
        inst_trend_20 = [gen_inst_data() for _ in range(20)]
        inst_trend_60 = [gen_inst_data() for _ in range(60)]

        pe = round(base_price / random.uniform(4, 12), 1)
        eps = round(random.uniform(3, 35), 2)
        eps_growth = round(random.uniform(-5, 30), 1)
        pb = round(random.uniform(1.0, 8.0), 1)
        dividend_yield = round(random.uniform(1.5, 6.5), 2)
        revenue_growth = round(random.uniform(-3, 35), 1)

        ma5 = round(sum(prices[-5:])/5, 2)
        ma20 = round(sum(prices[-20:])/20, 2)
        rsi = round(random.uniform(30, 75), 1)

        score = 0
        signals = []
        risk_score = random.randint(20, 60)

        if eps_growth > 10:
            score += 2; signals.append('營收成長強勁')
        elif eps_growth > 0:
            score += 0; signals.append('營收穩定')
        else:
            score -= 1; signals.append('營收衰退')

        if inst_net > 50_000_000:
            score += 3; signals.append('法人強力買超')
        elif inst_net > 10_000_000:
            score += 1; signals.append('法人小幅買超')
        elif inst_net < -50_000_000:
            score -= 3; signals.append('法人大幅賣超')
        elif inst_net < -10_000_000:
            score -= 1; signals.append('法人小幅賣超')

        if cur > ma20 and rsi > 50:
            score += 1; signals.append('站穩均線')
        elif cur < ma20 and rsi < 50:
            score -= 1; signals.append('跌破均線')

        # AI 評級
        if score >= 4: grade = 'A+'; advice = 'Strong Buy'
        elif score >= 2: grade = 'A'; advice = 'Buy'
        elif score >= 0: grade = 'B'; advice = 'Hold'
        elif score >= -2: grade = 'C'; advice = 'Sell'
        else: grade = 'D'; advice = 'Strong Sell'

        # 外資占比
        foreign_pos = random.randint(40, 85)
        margin_ratio = round(random.uniform(1.5, 8.0), 1)

        # 籌碼面
        concentration = round(random.uniform(15, 45), 1)
        big_holders = round(random.uniform(60, 85), 1)
        retail_ratio = round(random.uniform(15, 40), 1)
        short_ratio = round(random.uniform(2, 15), 1)

        record = {
            'id': sid, 'name': name, 'sector': sector, 'concepts': concepts,
            'price': cur, 'change': change,
            'high': max(prices[-20:]), 'low': min(prices[-20:]),
            'volume': vol_shares,
            'pe': pe, 'pb': pb, 'eps': eps, 'eps_growth': eps_growth,
            'dividend_yield': dividend_yield, 'revenue_growth': revenue_growth,
            'market_cap': round(cur * random.uniform(0.8, 2.0), 1),
            'inst_net': inst_net,
            'inst_trend_5': inst_trend_5,
            'inst_trend_20': inst_trend_20,
            'inst_trend_60': inst_trend_60,
            'foreign_position': foreign_pos,
            'margin_ratio': margin_ratio,
            'concentration': concentration,
            'big_holders': big_holders,
            'retail_ratio': retail_ratio,
            'short_ratio': short_ratio,
            'ma5': ma5, 'ma20': ma20,
            'rsi': rsi,
            'score': score, 'grade': grade,
            'advice': advice,
            'risk_score': risk_score,
            'signals': signals,
            'prices': [round(p, 2) for p in prices],
        }

        # AI Consensus — 名人策略匹配
        consensus = {}
        matches = 0
        for inv_id, *_ in INVESTORS:
            match = famous_investor_decision(inv_id, record)
            consensus[inv_id] = match
            if match:
                matches += 1
        record['consensus'] = consensus
        record['consensus_count'] = matches

        data[sid] = record

    # ─── ETF ───
    data['_etfs'] = {}
    for etf_id, name, base in ETFS:
        prices = gen_price_path(base, 60)
        cur = prices[-1]
        prev = prices[-2]
        chg = round((cur - prev) / prev * 100, 2)
        data['_etfs'][etf_id] = {
            'id': etf_id, 'name': name,
            'price': cur, 'change': chg,
            'volume': random.randint(1000, 30000) * 1000,
            'dividend_yield': round(random.uniform(3.0, 8.5), 2),
            'prices': [round(p, 2) for p in prices],
        }

    # ─── 指數 ───
    data['_indices'] = {}
    for idx_id, name, base in INDICES:
        cur = base + random.uniform(-500, 500)
        prev = base
        data['_indices'][idx_id] = {
            'id': idx_id, 'name': name,
            'price': round(cur, 2),
            'change': round((cur - prev) / prev * 100, 2),
        }

    # ─── 全球指數 ───
    data['_global'] = {
        'NASDAQ': {'price': 19850, 'change': 0.82, 'volume': 5200},
        'SP500': {'price': 5890, 'change': -0.15, 'volume': 3800},
        'DJI': {'price': 42350, 'change': 0.34, 'volume': 3100},
        'BTC': {'price': 102450, 'change': 2.84, 'volume': 28500},
    }

    # ─── 類股 ───
    data['_sectors'] = {}
    for sec in SECTORS:
        stocks_in = [(k, v) for k, v in data.items() if isinstance(v, dict) and v.get('sector') == sec]
        if stocks_in:
            avg_chg = sum(s['change'] for _, s in stocks_in) / len(stocks_in)
            vol_sum = sum(s['volume'] for _, s in stocks_in)
            data['_sectors'][sec] = {'change': round(avg_chg, 2), 'volume': vol_sum}

    # ─── 概念股 ───
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
    }
    data['_concepts'] = {}
    for cname, sids in CONCEPT_MAP.items():
        stocks_in = [data[s] for s in sids if s in data]
        if stocks_in:
            avg_chg = sum(s['change'] for s in stocks_in) / len(stocks_in)
            data['_concepts'][cname] = round(avg_chg, 2)

    # ─── 熱門排行 (模擬) ───
    stock_list = [v for k, v in data.items() if isinstance(v, dict) and 'price' in v]
    data['_rankings'] = {
        'volume': sorted(stock_list, key=lambda s: s['volume'], reverse=True)[:10],
        'gainers': sorted(stock_list, key=lambda s: s['change'], reverse=True)[:10],
        'losers': sorted(stock_list, key=lambda s: s['change'])[:10],
        'inst_buy': sorted(stock_list, key=lambda s: s['inst_net'], reverse=True)[:10],
        'margin_up': sorted(stock_list, key=lambda s: s.get('margin_ratio', 0), reverse=True)[:10],
        'foreign_buy': sorted(stock_list, key=lambda s: s.get('foreign_position', 0), reverse=True)[:10],
    }

    # ─── 新聞 ───
    data['_news'] = [
        {'title': '台積電 3nm 產能滿載，Q3 營收有望創新高', 'source': '鉅亨網', 'sentiment': 'positive', 'score': 85, 'industry': '半導體', 'summary': '台積電 3nm 製程獲 AI 晶片大單，產能利用率達 110%，Q3 營收預估季增 15%。', 'time': '2026-06-22 14:30'},
        {'title': '聯發科天璣 9400 效能超越競爭對手', 'source': '工商時報', 'sentiment': 'positive', 'score': 72, 'industry': 'IC設計', 'summary': '聯發科新一代旗艦晶片天璣 9400 在 AI 算力與功耗表現均優於競品，已獲多家中國品牌採用。', 'time': '2026-06-22 13:45'},
        {'title': 'FED 官員暗示下半年可能降息', 'source': '經濟日報', 'sentiment': 'positive', 'score': 91, 'industry': '總經', 'summary': '聯準會官員表示通膨持續降溫，若數據支持，下半年可能啟動降息循環。', 'time': '2026-06-22 12:00'},
        {'title': 'AI 伺服器需求爆發，廣達 Q2 獲利年增 45%', 'source': 'MoneyDJ', 'sentiment': 'positive', 'score': 88, 'industry': '電腦週邊', 'summary': '廣達受惠 AI 伺服器出貨強勁，Q2 合併營收創歷史新高，年增 45%。', 'time': '2026-06-22 11:20'},
        {'title': '外資上週買超台股 320 億，重點加碼 AI 族群', 'source': 'Yahoo Finance', 'sentiment': 'positive', 'score': 78, 'industry': '總經', 'summary': '外資上週對台股轉為買超，單週買超 320 億元，主要加碼 AI 概念股與權值股。', 'time': '2026-06-22 10:30'},
        {'title': '美中科技戰升溫，半導體供應鏈面臨重整', 'source': '工商時報', 'sentiment': 'negative', 'score': 35, 'industry': '半導體', 'summary': '美國進一步限制對中國晶片出口，台灣半導體供應鏈可能面臨訂單調整壓力。', 'time': '2026-06-22 09:15'},
        {'title': '台灣 ETF 規模突破 5 兆元，散戶參與度創新高', 'source': '經濟日報', 'sentiment': 'positive', 'score': 65, 'industry': '金融', 'summary': '台灣 ETF 市場持續升溫，總規模突破 5 兆元，高股息 ETF 最受散戶青睞。', 'time': '2026-06-21 16:00'},
        {'title': '比特幣突破 10 萬美元大關，加密貨幣市場狂歡', 'source': '鉅亨網', 'sentiment': 'positive', 'score': 70, 'industry': '加密貨幣', 'summary': '比特幣價格突破 10 萬美元歷史新高，市場預期現貨 ETF 持續吸引機構資金流入。', 'time': '2026-06-21 14:00'},
    ]

    # ─── 投資組合（範例） ───
    data['_portfolio'] = {
        'total_assets': 15200000,
        'today_pl': 125000,
        'cumulative_return': 32.5,
        'win_rate': 68,
        'max_drawdown': -15.2,
        'sharpe_ratio': 1.85,
        'holdings': [
            {'id': '2330', 'shares': 2000, 'avg_cost': 850, 'current': 1040},
            {'id': '2454', 'shares': 300, 'avg_cost': 1500, 'current': 1720},
            {'id': '2317', 'shares': 5000, 'avg_cost': 160, 'current': 185},
            {'id': '2382', 'shares': 2000, 'avg_cost': 250, 'current': 290},
        ]
    }

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'✅ 數據已生成：{OUTPUT}')
    stock_count = len([k for k in data if isinstance(data[k], dict) and 'price' in k and 'inst_trend_5' in data[k]])
    print(f'   個股：{stock_count} 檔')
    print(f'   ETF：{len(data["_etfs"])} 檔')
    print(f'   指數：{len(data["_indices"])} 個')
    print(f'   類股：{len(data["_sectors"])} 個')
    print(f'   新聞：{len(data["_news"])} 則')

if __name__ == '__main__':
    build()
