# FA POS / DMS 比對工具 v3

GitHub Pages 靜態網頁工具。

## 功能
- 匯入財務 POS Excel
- 匯入 DMS 送餐紀錄 Excel
- 依「餐廳＋日期」彙總比對
- 差異 = POS - DMS
  - 負數：未輸入FA
  - 正數：多輸入須扣回
  - 0：無差異
- 餐廳名稱對照管理（保存在瀏覽器 localStorage）
- 預設名稱對照：
  - 中壢領航 = 桃園領航
  - 西屯家樂福 = 西屯康達盛通
- 匯入後顯示可能的未配對餐廳名稱
- 匯出財務 Excel

## 更新 GitHub
將 `index.html` 與 `fa-compare.js` 上傳並覆蓋 Repository 根目錄中的同名檔案即可。
