# FA POS / DMS 比對工具

## GitHub Pages 使用
將 `index.html` 與 `fa-compare.js` 放在同一個 GitHub Pages 資料夾即可。

## 固定比對規則
- POS：依「店名 + 日期」彙總 `POS金額`
- DMS：只納入 `訂單狀態=完成`、`付款方式=Cash`、`third_party` 有值，依「ID(餐廳) + 落單日期」彙總 `total_price`
- 差異 = POS金額 - DMS金額
- 差異 < 0：未輸入FA
- 差異 > 0：多輸入須扣回
- 差異 = 0：無差異

## 餐廳名稱對照
在 `fa-compare.js` 的 `STORE_NAME_MAP` 維護，例如：
`"中壢領航":"桃園領航"`

## 隱私
Excel 由瀏覽器端 JavaScript 處理，不會因本工具自動上傳或寫入 GitHub。
