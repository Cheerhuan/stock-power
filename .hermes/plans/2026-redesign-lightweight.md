# Stock Power — 輕量視覺升級計劃（零效能成本）

## 原則
- **零 JS 動畫新增** — 保留現有 Framer Motion，不新增
- **純 CSS 換膚** — 色彩、邊框、陰影、玻璃材質
- **靜態背景** — radial-gradient，不循環動畫
- **不換字體** — 保留 Inter / monospace
- **不重構佈局** — 保留現有組件結構

## 變更清單

### globals.css
- 新色彩變數（極光暗色系）
- 靜態 aurora 光暈背景（`body::before` pseudo-element）
- 細微 noise overlay（`body::after` + SVG filter）
- 新 glass 工具類（`backdrop-blur` + 虹彩邊框）
- 卡片 hover 光澤（CSS `::before` + `transition`）

### layout.tsx
- body 加 `overflow-hidden`（配合 aurora 固定背景）

### SearchHero.tsx
- 搜尋框：玻璃材質 + 虹彩邊框 focus
- 熱門股票 pills：微妙 glass hover
- 移除三個 radial-gradient div → 改用全域 aurora

### StockDetail.tsx
- 卡片間距微調
- 玻璃材質統一套用
- 數字顏色改用新色板

### StockList.tsx
- 側邊欄背景透明度調整
- 搜尋框玻璃化

### StockChart.tsx
- 工具欄按鈕改 pill 風格
- MA 按鈕啟用態加 glow

### CommandPalette.tsx
- 模態框玻璃材質
- 搜尋框虹彩邊框

## 預估
- **檔案數**：7
- **新增 CSS**：~150 行
- **JS 改動**：僅色彩值替換，0 新邏輯
- **效能影響**：0（純 CSS）
- **載入時間影響**：0
