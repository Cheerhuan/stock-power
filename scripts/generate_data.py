import requests
import pandas as pd
import json
import os
from datetime import datetime

# Configuration
TARGET_STOCKS = ['2330', '2317', '2454', '2303', '2382']
OUTPUT_FILE = '../public/stock-data.json'

def fetch_basic_info(stock_id):
    """
    Fetch basic stock info. 
    In a real production environment, this would hit a professional API.
    For M2 Prototype, we use a simulated structure that matches the required JSON schema.
    """
    # Simulating data structure from a typical TW stock API
    # Real implementation would use requests.get(f"https://api.twstock.com/v1/{stock_id}")
    mock_data = {
        '2330': {'name': 'TSMC', 'price': 1040, 'change': 1.2, 'pe': 22.5, 'pb': 6.1, 'eps_growth': 15.4},
        '2317': {'name': 'Foxconn', 'price': 185, 'change': -0.5, 'pe': 12.1, 'pb': 1.1, 'eps_growth': 4.2},
        '2454': {'name': 'MediaTek', 'price': 1720, 'change': 2.1, 'pe': 18.2, 'pb': 4.5, 'eps_growth': 22.1},
        '2303': {'name': 'Umc', 'price': 112, 'change': -1.1, 'pe': 10.5, 'pb': 0.9, 'eps_growth': -2.1},
        '2382': {'name': 'Hon Hai', 'price': 190, 'change': 0.3, 'pe': 11.8, 'pb': 1.2, 'eps_growth': 3.1},
    }
    return mock_data.get(stock_id, {})

def fetch_chip_data(stock_id):
    """
    Simulate Chip-level (Institutional) data.
    """
    # This would normally scrape from a chip-data provider or the TW Stock Exchange
    # We simulate the "Accumulation vs Distribution" logic
    mock_chips = {
        '2330': {'inst_net_buy': 500000000, 'insider_trend': 'Increasing', 'margin_ratio': 2.1},
        '2317': {'inst_net_buy': -120000000, 'insider_trend': 'Stable', 'margin_ratio': 4.5},
        '2454': {'inst_net_buy': 800000000, 'insider_trend': 'Increasing', 'margin_ratio': 1.8},
        '2303': {'inst_net_buy': -400000000, 'insider_trend': 'Decreasing', 'margin_ratio': 6.2},
        '2382': {'inst_net_buy': 10000000, 'insider_trend': 'Stable', 'margin_ratio': 3.9},
    }
    return mock_chips.get(stock_id, {})

def analyze_signal(basic, chip):
    """
    The Adversarial Analysis Engine (The Core Logic)
    """
    score = 0
    evidence = []

    # 1. Fundamental Analysis
    if basic.get('eps_growth', 0) > 10:
        score += 1
        evidence.append("Strong EPS Growth")
    elif basic.get('eps_growth', 0) < 0:
        score -= 1
        evidence.append("Negative Growth")
    else:
        evidence.append("Stable Fundamentals")

    # 2. Chip Analysis (Heavier Weight)
    if chip.get('inst_net_buy', 0) > 100000000:
        score += 2
        evidence.append("Strong Institutional Accumulation")
    elif chip.get('inst_net_buy', 0) < -100000000:
        score -= 2
        evidence.append("Institutional Distribution")
    else:
        evidence.append("Neutral Money Flow")

    # Grade Mapping
    if score >= 3: return 'A+', "Strong Buy: High growth + Heavy Institutional support."
    if score >= 1: return 'B', "Hold: Positive signs but lacks strong momentum."
    if score >= -1: return 'C', "Watch: Conflicting signals or stagnant growth."
    return 'D', "Avoid: Weak fundamentals and institutional selling."

def main():
    full_data = {}
    
    print(f"Starting Data Pipeline for {len(TARGET_STOCKS)} stocks...")
    
    for sid in TARGET_STOCKS:
        print(f"Processing {sid}...", end=" ")
        basic = fetch_basic_info(sid)
        chip = fetch_chip_data(sid)
        grade, summary = analyze_signal(basic, chip)
        
        full_data[sid] = {
            'id': sid,
            'name': basic.get('name', 'Unknown'),
            'price': str(basic.get('price', 0)),
            'change': basic.get('change', 0),
            'grade': grade,
            'summary': summary,
            'details': {
                'fundamental': {
                    'pe': basic.get('pe'),
                    'pb': basic.get('pb'),
                    'growth': basic.get('eps_growth'),
                    'conclusion': 'POSITIVE' if basic.get('eps_growth', 0) > 0 else 'NEGATIVE'
                },
                'chip': {
                    'net_buy': chip.get('inst_net_buy'),
                    'trend': chip.get('insider_trend'),
                    'conclusion': 'POSITIVE' if chip.get('inst_net_buy', 0) > 0 else 'NEGATIVE'
                },
                'technical': {
                    'trend': 'Bullish' if basic.get('change', 0) > 0 else 'Bearish',
                    'conclusion': 'POSITIVE' if basic.get('change', 0) > 0 else 'NEGATIVE'
                }
            }
        }
        print("Done.")

    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(full_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nSuccessfully exported data to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
