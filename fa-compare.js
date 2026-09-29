const $=id=>document.getElementById(id); let posRows=[],dmsRows=[],results=[];
// 名稱不同時在這裡維護：DMS名稱: POS名稱
const STORE_NAME_MAP={"中壢領航":"桃園領航"};
function norm(s){return String(s??'').trim().replace(/\s+/g,'');}
function excelDate(v){if(v instanceof Date)return v;if(typeof v==='number'){const d=XLSX.SSF.parse_date_code(v);return d?new Date(d.y,d.m-1,d.d):null}const d=new Date(v);return isNaN(d)?null:d}
function ymd(v){const d=excelDate(v);if(!d)return '';return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`}
function num(v){const n=Number(String(v??0).replace(/,/g,''));return Number.isFinite(n)?n:0}
async function readFile(file){const ab=await file.arrayBuffer();const wb=XLSX.read(ab,{type:'array',cellDates:true});const ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(ws,{header:1,defval:null,raw:true})}
function findHeader(rows,required){for(let i=0;i<Math.min(rows.length,20);i++){const h=rows[i].map(norm);if(required.every(x=>h.includes(norm(x))))return i}return -1}
function objRows(rows,hi){const h=rows[hi].map(norm);return rows.slice(hi+1).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]]))).filter(o=>Object.values(o).some(v=>v!==null&&v!==''))}
function add(map,key,val){map.set(key,(map.get(key)||0)+val)}
function processPOS(rows){const hi=findHeader(rows,['店名','日期','POS金額']);if(hi<0)throw Error('POS 檔找不到「店名、日期、POS金額」欄位');const map=new Map();for(const r of objRows(rows,hi)){const store=norm(r['店名']),date=ymd(r['日期']);if(store&&date)add(map,store+'|'+date,num(r['POS金額']))}return map}
function processDMS(rows){const hi=findHeader(rows,['ID','訂單狀態','落單時間','付款方式','third_party','total_price']);if(hi<0)throw Error('DMS 檔缺少必要欄位');const map=new Map();for(const r of objRows(rows,hi)){if(norm(r['訂單狀態'])!=='完成'||norm(r['付款方式']).toLowerCase()!=='cash'||!norm(r['third_party']))continue;let store=norm(r['ID']);store=STORE_NAME_MAP[store]||store;const date=ymd(r['落單時間']);if(store&&date)add(map,store+'|'+date,num(r['total_price']))}return map}
function compare(){const p=processPOS(posRows),d=processDMS(dmsRows),keys=new Set([...p.keys(),...d.keys()]);results=[...keys].map(k=>{const [store,date]=k.split('|'),pos=p.get(k)||0,dms=d.get(k)||0,diff=pos-dms;return {store,date,pos,dms,diff,remark:diff<0?'未輸入FA':diff>0?'多輸入須扣回':'無差異'}}).sort((a,b)=>a.diff-b.diff||a.store.localeCompare(b.store,'zh-Hant'));render()}
function render(){const diff=results.filter(x=>x.diff!==0);$('diffCount').textContent=diff.length;$('missingCount').textContent=results.filter(x=>x.diff<0).length;$('overCount').textContent=results.filter(x=>x.diff>0).length;$('result').hidden=false;renderTable()}
function selected(){const f=$('filter').value;return results.filter(x=>f==='all'||(f==='diff'&&x.diff!==0)||(f==='missing'&&x.diff<0)||(f==='over'&&x.diff>0))}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function renderTable(){const fmt=n=>Number(n).toLocaleString('zh-TW');$('tbody').innerHTML=selected().map(x=>`<tr><td>${esc(x.store)}</td><td>${x.date}</td><td class="num">${fmt(x.pos)}</td><td class="num">${fmt(x.dms)}</td><td class="num ${x.diff<0?'neg':x.diff>0?'pos':'ok'}">${fmt(x.diff)}</td><td>${x.remark}</td></tr>`).join('')}
function exportExcel(){const rows=selected().map(x=>({'餐廳名稱':x.store,'日期':x.date,'POS金額':x.pos,'DMS金額':x.dms,'差異':x.diff,'備註':x.remark}));const ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=[{wch:18},{wch:13},{wch:12},{wch:12},{wch:12},{wch:18}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'FA比對結果');const now=new Date(),stamp=`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;XLSX.writeFile(wb,`FA_POS_DMS比對_${stamp}.xlsx`)}
$('posFile').onchange=async e=>{try{posRows=await readFile(e.target.files[0]);$('posStatus').textContent=`已匯入：${e.target.files[0].name}`}catch(err){$('posStatus').textContent='讀取失敗：'+err.message}};
$('dmsFile').onchange=async e=>{try{dmsRows=await readFile(e.target.files[0]);$('dmsStatus').textContent=`已匯入：${e.target.files[0].name}`}catch(err){$('dmsStatus').textContent='讀取失敗：'+err.message}};
$('compareBtn').onclick=()=>{try{if(!posRows.length||!dmsRows.length)throw Error('請先匯入 POS 與 DMS 兩份 Excel');compare();$('msg').textContent='比對完成'}catch(err){$('msg').innerHTML=`<span class="error">${esc(err.message)}</span>`}};
$('filter').onchange=renderTable;$('exportBtn').onclick=exportExcel;$('resetBtn').onclick=()=>location.reload();
