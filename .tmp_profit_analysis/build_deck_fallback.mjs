import pptxgen from "pptxgenjs";
import fs from "node:fs/promises";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.subject = "大客中心利润结构分析";
pptx.title = "2026年4月大客中心利润结构分析及演讲稿";
pptx.company = "卓希";
pptx.lang = "zh-CN";
pptx.theme = { headFontFace: "Microsoft YaHei", bodyFontFace: "Microsoft YaHei", lang: "zh-CN" };
const C = { blue: "2867C7", light: "A9D6F5", ink: "111827", gray: "5F6B7A", pale: "F3F5F7", red: "C43D4B", green: "18856B", white: "FFFFFF" };
const out = "E:\\cxy\\outputs\\大客中心利润分析\\2026年4月大客中心利润结构分析及演讲稿.pptx";
await fs.mkdir("E:\\cxy\\outputs\\大客中心利润分析", { recursive: true });

function text(slide, t, x, y, w, h, fs = 20, color = C.ink, bold = false, align = "left") {
  slide.addText(t, { x, y, w, h, fontFace: "Microsoft YaHei", fontSize: fs, color, bold, align, valign: "mid", margin: 0, breakLine: false, fit: "shrink" });
}
function rect(slide, x, y, w, h, fill = C.pale) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill, transparency: 100 } });
}
function head(slide, title, p) {
  text(slide, title, 0.45, 0.25, 11.8, 0.72, 27, C.ink, true);
  text(slide, String(p).padStart(2, "0"), 12.55, 7.1, 0.35, 0.2, 9, C.gray, false, "right");
}
function note(slide, t) {
  slide.addNotes(`${t}\n\n[Sources]\n- 2026年度卓希线下经营管理报表Q1-大客中心7.20.xlsx，事业部利润表（4月及累计）`);
}
function chart(slide, cats, series, yMax) {
  const data = series.map(s => ({ name: s.name, labels: cats, values: s.values }));
  slide.addChart(pptx.ChartType.bar, data, {
    x: 0.55, y: 1.45, w: 5.85, h: 5.2,
    catAxisLabelFontFace: "Microsoft YaHei", catAxisLabelFontSize: 10,
    valAxisLabelFontFace: "Microsoft YaHei", valAxisLabelFontSize: 9,
    showLegend: true, legendPos: "b", legendFontFace: "Microsoft YaHei", legendFontSize: 10,
    showValue: true, showTitle: false, showCatName: false,
    chartColors: series.map(s => s.color), showCatName: false,
    showValue: true, dataLabelPosition: "outEnd",
    valGridLine: { color: "E5E7EB", width: 1 },
    showValue: true, showValAxisTitle: false,
    valAxisMaxVal: yMax, showBorder: false,
    catAxisLabelRotate: 0, gapWidthPct: 75,
  });
}
function narrative(slide, title, body, stat1, label1, stat2, label2, p) {
  head(slide, title, p);
  text(slide, body, 6.85, 1.45, 5.55, 1.65, 18);
  rect(slide, 6.85, 3.75, 2.55, 2.2); rect(slide, 9.75, 3.75, 2.55, 2.2);
  text(slide, stat1, 7.1, 4.05, 2.05, 0.75, 28, stat1.startsWith("-") ? C.red : C.blue, true);
  text(slide, label1, 7.1, 5.05, 2.05, 0.65, 15, C.gray);
  text(slide, stat2, 10.0, 4.05, 2.05, 0.75, 28, stat2.startsWith("-") ? C.red : C.blue, true);
  text(slide, label2, 10.0, 5.05, 2.05, 0.65, 15, C.gray);
}

let s = pptx.addSlide(); s.background = { color: C.white };
text(s, "经营复盘｜2026年4月", 0.45, 0.35, 6, 0.35, 17, C.gray, true);
text(s, "大客中心\n利润结构分析", 0.45, 1.75, 9.5, 2.2, 46, C.ink, true);
text(s, "预算 vs 实际｜累计预算 vs 累计实际\n营业收入 · 毛利率 · 销售费用", 0.45, 5.0, 7.3, 1.1, 20, C.gray);
note(s, "各位好，今天汇报大客中心2026年4月及累计经营表现。核心结论是：收入增长明显，但4月利润被合同扣点、零食业务负毛利和市场费用集中投放共同侵蚀；累计仍保持盈利，但利润完成度明显落后于收入完成度。");

s = pptx.addSlide(); head(s, "收入超预算，但利润转化明显不足", 2);
text(s, "累计净收入8,820.7万元，完成预算134.9%；但毛利率只有12.0%，净利润仅完成预算41.3%。当前重点应从规模增长切换到收入质量与费用效率。", 0.45, 1.15, 12.2, 1.15, 18);
[["134.9%", "累计净收入达成\n8,820.7万元", C.blue], ["12.0%", "累计实际毛利率\n较预算低2.4pct", C.green], ["41.3%", "累计净利润达成\n211.9万元", C.red]].forEach((a,i)=>{const x=.45+i*4.25;rect(s,x,3.15,3.85,2.8);text(s,a[0],x+.3,3.55,3.2,.8,32,a[2],true);text(s,a[1],x+.3,4.75,3.2,.75,16,C.gray);});
note(s, "先看总体判断。累计净收入8,820.7万元，完成预算134.9%，但累计毛利率只有12.0%，较预算14.4%低2.4个百分点；累计净利润211.9万元，仅完成预算的41.3%。这说明新增收入没有按预算转化为利润。4月单月更严峻，毛利为负53.9万元，净亏损335.2万元。");

s = pptx.addSlide(); narrative(s, "关键指标：4月利润转负，累计利润承压", "4月净收入超预算9.9%，但成本超预算33.6%、销售直接费用超预算127.6%，导致净利润由预算盈利113.4万元转为亏损335.2万元。", "-448.6万元", "4月净利润预算差额", "-300.9万元", "累计净利润预算差额", 3);
chart(s, ["4月净收入","4月毛利","4月销售费用","4月净利润","累计净收入","累计净利润"], [{name:"预算（万元）",values:[1629.5,248.2,114.9,113.4,6536.7,512.9],color:C.light},{name:"实际（万元）",values:[1791.4,-53.9,261.4,-335.2,8820.7,211.9],color:C.blue}]);
note(s, "这页把预算与实际放在一起看。4月净收入比预算多161.9万元，但毛利比预算少302.1万元；销售直接费用比预算多146.5万元，最终净利润比预算少448.6万元。累计收入多2,284.0万元，净利润却少300.9万元，利润弹性显著弱于收入弹性。");

s = pptx.addSlide(); narrative(s, "营业收入结构：会员增长最强，零食单月明显收缩", "4月毛收入中，会员&创新占52.6%，成为第一大来源；零食占比由累计24.9%降至5.9%。4月合同扣点378.7万元，占毛收入17.4%，显著压缩净收入增长。", "52.6%", "4月会员&创新\n毛收入占比", "17.4%", "4月合同扣点/毛收入", 4);
chart(s, ["大客-KA","大客-餐饮","会员&创新","大客-零食"], [{name:"4月毛收入占比（%）",values:[37.0,4.6,52.6,5.9],color:C.blue},{name:"累计毛收入占比（%）",values:[28.7,2.6,43.8,24.9],color:C.light}],60);
note(s, "收入结构出现明显切换。4月会员与创新占毛收入52.6%，较累计结构高8.8个百分点；KA占37.0%，也高于累计。零食则从累计24.9%降到4月5.9%，单月规模显著收缩。需要特别关注合同扣点：4月达到378.7万元，占毛收入17.4%，使毛收入33.2%的超预算增长，最终只转化为净收入9.9%的增长。");

s = pptx.addSlide(); narrative(s, "毛利率结构：零食负毛利拖累，KA贡献主要利润", "4月KA毛利率31.9%，贡献222.8万元毛利；会员&创新15.8%，贡献136.8万元；零食毛利率-39.0%，单项亏损49.8万元，拉低整体毛利率。", "-3.0%", "4月整体实际毛利率", "12.0%", "累计整体实际毛利率", 5);
chart(s, ["大客-KA","大客-餐饮","会员&创新","大客-零食"], [{name:"4月毛利率（%）",values:[31.9,15.1,15.8,-39.0],color:C.blue},{name:"累计毛利率（%）",values:[27.2,14.5,14.0,8.3],color:C.light}],40);
note(s, "毛利结构分化明显。KA是4月最主要的利润来源，毛利222.8万元、毛利率31.9%；会员与创新贡献136.8万元，毛利率15.8%；餐饮规模较小。零食单月收入127.5万元，却产生负毛利49.8万元，毛利率负39.0%，是4月整体毛利率跌到负3.0%的直接拖累项。累计看零食仍有8.3%毛利率，说明问题集中在4月，需要追溯具体订单、成本及促销政策。");

s = pptx.addSlide(); narrative(s, "销售费用结构：市场费用占八成，投入增速远超收入", "4月销售直接费用261.4万元，其中市场费用216.3万元，占82.7%；费用率14.6%，较预算7.0%高7.5pct。累计销售费用率8.9%，较预算高3.3pct。", "127.6%", "4月销售费用超预算", "114.4%", "累计销售费用超预算", 6);
chart(s, ["职工薪酬","市场费用"], [{name:"4月（万元）",values:[45.1,216.3],color:C.blue},{name:"累计（万元）",values:[144.8,639.8],color:C.light}]);
note(s, "销售费用是第二个核心矛盾。4月销售直接费用261.4万元，较预算多146.5万元；其中市场费用216.3万元，占销售费用82.7%，是主要增量。费用率从预算7.0%升到14.6%。累计市场费用639.8万元，占销售费用81.6%；累计销售费用率8.9%，比预算高3.3个百分点。建议从客户、项目和费用类型三个维度核算投放后毛利，而不是只看收入增量。");

s = pptx.addSlide(); head(s, "三项动作优先恢复利润转化", 7);
[["立即｜7天","止损","逐单复盘零食负毛利；冻结低于底线毛利率的新增订单与促销。"],["短期｜30天","控费","拆解市场费用到客户/活动；设置“增量毛利覆盖费用”准入标准。"],["季度内","调结构","扩大KA高毛利收入；优化会员扣点条款；建立周度收入质量看板。"]].forEach((a,i)=>{const x=.45+i*4.3;text(s,a[0],x,2.0,3.5,.4,14,C.gray,true);rect(s,x,2.75,3.8,2.8);text(s,a[1],x+.3,3.05,3.1,.65,25,C.blue,true);text(s,a[2],x+.3,4.0,3.1,1.2,16,C.ink);});
note(s, "建议分三步推进。第一，七天内完成零食负毛利订单清单，明确价格、采购成本、物流和促销责任，低于底线毛利率的业务先止损。第二，三十天内把市场费用穿透到客户和活动，要求新增费用必须有可验证的增量毛利覆盖。第三，季度内优化收入结构，优先放大KA高毛利业务，同时重新审视会员与创新业务的合同扣点条款，并建立周度收入质量看板。");

s = pptx.addSlide(); text(s,"结论",.45,.35,2.5,.35,17,C.gray,true);text(s,"规模已增长\n利润要追回",.45,1.8,9,2.2,46,C.ink,true);text(s,"守住零食毛利底线\n压降市场费用率\n提升合同后净收入质量",.45,5.0,7,1.2,20,C.gray);
note(s, "最后总结：大客中心的增长动能是清晰的，但4月已经出现规模与利润背离。下一阶段经营目标应从单纯追收入，切换到合同后净收入、毛利率和费用后利润三项指标联动管理。只要零食负毛利及时止损、市场费用效率恢复、合同扣点得到控制，累计利润仍有修复空间。");

await pptx.writeFile({ fileName: out });
console.log(out);
