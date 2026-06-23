# Stock Power — 2026 時尚視覺重設計劃

## 設計概念：「Aurora Terminal」

融合 Bloomberg Terminal 的資料密度 × 2026 年的空間感、極光漸層與玻璃質感。

---

## 一、色彩系統

### 背景層
- **Primary BG**: `#06080C`（更深沉的黑，取代 #0B0F17）
- **Card BG**: `#0B0E14`（微亮卡片底）
- **Glass BG**: `rgba(255,255,255,0.025)` + `backdrop-blur-2xl`

### 極光主色（取代單色 #5B8CFF）
- **Aurora Indigo**: `#818CF8` → `#6366F1`
- **Aurora Cyan**: `#22D3EE` → `#06B6D4`
- **Aurora Emerald**: `#34D399` → `#10B981`
- **Aurora Violet**: `#A78BFA` → `#8B5CF6`

### 功能色
- **Positive**: `#10B981`（翡翠綠，取代 #00D26A）
- **Negative**: `#F43F5E`（玫瑰紅，取代 #FF4D6D）
- **Warning**: `#FBBF24`（琥珀金）
- **Neutral**: `#6B7280`

### 邊框系統
- **Default**: `rgba(255,255,255,0.06)`
- **Hover**: `rgba(255,255,255,0.10)`
- **Glow**: `rgba(99,102,241,0.15)`
- **Iridescent**: 漸層邊框（玻璃卡片用）

---

## 二、字體系統

- **Heading**: `"Plus Jakarta Sans"`（現有，保留）
- **Body/UI**: `"Inter"`（現有，保留）
- **Monospace/數字**: `"JetBrains Mono"` — 價格、漲跌幅、代號（新增）

---

## 三、核心視覺元素

### 1. Aurora 背景
- 全頁面極光漸層動畫
- 3-4 個大型有機光暈，緩慢移動
- `radial-gradient` + CSS animation
- 添加細微 grain/noise 紋理覆蓋

### 2. 玻璃擬態進化（Glass+）
- `backdrop-filter: blur(20px) saturate(180%)`
- 虹彩漸層邊框（iridescent border）
- 內部光線折射效果
- 懸停時光澤掃過（shimmer sweep）

### 3. Bento Grid 儀表板
- 重新佈局 Stock Detail 頁面為非對稱網格
- 不同大小的卡片組合（Apple 風格）
- AI 評分大卡 + 關鍵指標小卡 + K 線全寬

### 4. 微互動系統
- 數字滾動動畫（count-up on visible）
- 磁力懸停（magnetic hover on cards）
- 光澤掃過（shimmer sweep on glass cards）
- 彈簧動畫（spring animations via Framer Motion）
- 價格變動閃爍（保留並增強）

### 5. 空間深度
- z-index 分層：背景 < 卡片 < 浮動元素
- 陰影系統：`box-shadow` 創造浮起感
- 視差效果：緩慢的背景光暈移動

---

## 四、頁面佈局重新設計

### 首頁（Search Hero）
- **現狀**：中央垂直置中搜尋框 + 熱門股票按鈕
- **新設計**：
  - 全螢幕 aurora 背景
  - 大型動態標題（kinetic typography）
  - 搜尋框：更寬、更圓滑、玻璃材質
  - 即時股票輪播條（ticker tape）在底部
  - 熱門股票以 pill 形式流動排列
  - ⌘K 快捷鍵提示更明顯

### 搜尋結果頁（Desktop）
- **現狀**：左側列表 + 右側詳細
- **新設計**：
  - 左側側邊欄：玻璃材質，寬度微增至 340px
  - 搜尋框更加精緻
  - 右側使用 Bento Grid 佈局股票詳細

### 股票詳細頁（Bento Grid）
- **現狀**：垂直堆疊的卡片（線性佈局）
- **新設計**（Bento Grid）：
  ```
  ┌─────────────────────┬──────────┐
  │   股票資訊 + 價格    │ AI 評分   │
  │   (大卡)           │ (圓形儀表) │
  ├─────────────────────┴──────────┤
  │         K 線圖 (全寬)          │
  ├──────────┬──────────┬─────────┤
  │ 關鍵指標  │ 三大法人  │ AI 共識 │
  │ (小卡)   │ (條形圖)  │ (標籤)  │
  ├──────────┴──────────┴─────────┤
  │        新聞動態 (全寬)         │
  └────────────────────────────────┘
  ```

### K 線圖工具欄
- **現狀**：左對齊時間框架 + 右對齊 MA
- **新設計**：
  - 工具欄與圖表整合
  - 按鈕改為圓角 pill 設計
  - 啟用狀態用光暈（glow）代替背景色

### 指令面板 (Command Palette)
- **現狀**：基本深色模態框
- **新設計**：
  - 大幅玻璃材質
  - 搜尋框帶極光邊框動畫
  - 分組標題更精緻
  - 鍵盤快捷鍵提示用虹彩效果

---

## 五、動畫系統

### 頁面轉場
- 使用 Framer Motion `AnimatePresence`
- 彈簧物理（spring）代替線性 ease
- 交錯入場（staggered entrance）

### 數字動畫
- 價格載入時 count-up
- 漲跌幅數字平滑過渡
- 使用 `framer-motion` 的 `useSpring`

### 微互動
- 卡片懸停：輕微放大 + 光澤掃過
- 按鈕點擊：漣漪效果
- 圖表互動：十字線跟隨

---

## 六、實施計劃

### Phase 1: 基礎視覺層（~30min）
1. 更新 `globals.css` — 新色彩系統、aurora 動畫、glass 工具類
2. 更新 `layout.tsx` — 背景層、noise overlay
3. 導入 JetBrains Mono 字體

### Phase 2: 首頁重設計（~20min）
4. 重寫 `SearchHero.tsx` — aurora 背景、玻璃搜尋框、ticker tape
5. 更新 `StockList.tsx` — 側邊欄玻璃材質

### Phase 3: 詳細頁重設計（~30min）
6. 重寫 `StockDetail.tsx` — Bento Grid 佈局
7. 重寫 `StockChart.tsx` — 新工具欄設計
8. 更新 `StockResults.tsx` — 新佈局整合

### Phase 4: 動畫與優化（~20min）
9. 加入數字動畫（count-up）
10. 加入光澤掃過效果
11. 微調間距與對齊

---

## 七、參考風格

- **Bloomberg Terminal**: 資料密度、暗色主題
- **Apple Vision Pro**: 玻璃材質、空間深度
- **Linear**: 極簡互動、微動畫
- **Vercel**: 排版、漸層
- **Stripe**: 色彩系統、動畫曲線
