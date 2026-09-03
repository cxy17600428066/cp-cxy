import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("C:/Users/admin/Downloads/订单列表.xls");
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("数据");
const rows = sheet.getUsedRange(true).values;
const headers = rows[0];
const col = Object.fromEntries(headers.map((h, i) => [h, i]));
const data = rows.slice(1).filter(r => r[col["订单编号"]]);
const num = v => Number(v) || 0;
const group = key => {
  const out = new Map();
  for (const r of data) {
    const name = String(r[col[key]] || "未分类");
    const current = out.get(name) || { name, quantity: 0, amount: 0, rows: 0 };
    current.quantity += num(r[col["总数量"]]);
    current.amount += num(r[col["合计金额"]]);
    current.rows += 1;
    out.set(name, current);
  }
  return [...out.values()].sort((a,b)=>b.quantity-a.quantity).slice(0,12);
};
const result = {
  rowCount: data.length,
  orderCount: new Set(data.map(r=>r[col["订单编号"]])).size,
  skuCount: new Set(data.map(r=>r[col["商品编码"]]).filter(Boolean)).size,
  customerCount: new Set(data.map(r=>r[col["客户编号"]]).filter(Boolean)).size,
  quantity: data.reduce((s,r)=>s+num(r[col["总数量"]]),0),
  amount: data.reduce((s,r)=>s+num(r[col["合计金额"]]),0),
  gifts: data.reduce((s,r)=>s+num(r[col["搭赠数量"]]),0),
  flavors: group("口味"),
  centers: group("客户类别"),
  regions: group("销售区域"),
  channels: group("渠道"),
  specs: group("克重"),
  categories: group("商品分类"),
  units: group("单位"),
  daily: (() => {
    const out = new Map();
    for (const r of data) {
      const serial = num(r[col["下单时间"]]);
      if (!serial) continue;
      const day = new Date(Math.round((serial - 25569) * 86400 * 1000)).toISOString().slice(0,10);
      out.set(day, (out.get(day) || 0) + num(r[col["总数量"]]));
    }
    return [...out.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,quantity])=>({date,quantity}));
  })(),
  topSkus: (() => {
    const out = new Map();
    for (const r of data) {
      const code = String(r[col["商品编码"]] || "未编码");
      const current = out.get(code) || {
        code,
        name: String(r[col["商品简称"]] || r[col["商品名称"]] || ""),
        flavor: String(r[col["口味"]] || ""),
        spec: String(r[col["克重"]] || ""),
        unit: String(r[col["单位"]] || ""),
        quantity: 0,
        amount: 0,
      };
      current.quantity += num(r[col["总数量"]]);
      current.amount += num(r[col["合计金额"]]);
      out.set(code, current);
    }
    return [...out.values()].sort((a,b)=>b.quantity-a.quantity).slice(0,10);
  })(),
};
console.log(JSON.stringify(result, null, 2));
