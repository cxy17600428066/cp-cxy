import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";
console.log("imports-ok");

const outDir = "E:\\cxy\\outputs\\大客中心利润分析";
const renderDir = `${outDir}\\rendered`;
await fs.mkdir(renderDir, { recursive: true });
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
console.log("deck-ok");
const C = { blue: "#2867C7", light: "#A9D6F5", ink: "#111827", gray: "#5F6B7A", pale: "#F3F5F7", red: "#C43D4B", green: "#18856B" };

function box(slide, x, y, w, h, fill = C.pale) {
  return slide.shapes.add({ geometry: "roundRect", position: { left: x, top: y, width: w, height: h }, fill, line: { style: "solid", fill, width: 0 } });
}
function txt(slide, text, x, y, w, h, size = 24, color = C.ink, bold = false, align = "left") {
  const sh = slide.shapes.add({ geometry: "textbox", position: { left: x, top: y, width: w, height: h }, fill: "none", line: { style: "solid", fill: "none", width: 0 } });
  sh.text = text;
  sh.text.style = { fontSize: size, typeface: "Microsoft YaHei", color, bold, alignment: align, verticalAlignment: "middle", autoFit: "shrinkText" };
  return sh;
}
function header(slide, title, page) {
  txt(slide, title, 42, 28, 1130, 70, 36, C.ink, true);
  txt(slide, String(page).padStart(2, "0"), 1190, 665, 45, 22, 12, C.gray, false, "right");
}
function addNotes(slide, body) {
  slide.speakerNotes.textFrame.setText(`${body}\n\n[Sources]\n- 2026年度卓希线下经营管理报表Q1-大客中心7.20.xlsx，事业部利润表（4月及累计）`);
  slide.speakerNotes.setVisible(true);
}
function addChart(slide, categories, series, max) {
  slide.charts.add("bar", {
    position: { left: 60, top: 145, width: 560, height: 490 }, categories, series,
    hasLegend: true, legend: { position: "bottom", overlay: false },
    dataLabels: { showValue: true, position: "outEnd" },
    chartFill: "#FFFFFF", chartLine: { style: "solid", width: 0, fill: "#FFFFFF" },
    plotAreaFill: { type: "none" }, plotAreaLine: { style: "solid", width: 0, fill: "#FFFFFF" },
    xAxis: { visible: true, line: { style: "solid", width: 1, fill: "#B8BCC4" }, textStyle: { typeface: "Microsoft YaHei", fontSize: "13px", color: C.ink } },
    yAxis: { visible: true, ...(max ? { max } : {}), majorGridlines: { style: "solid", width: 1, fill: "#E5E7EB" }, line: { style: "solid", width: 0, fill: "#FFFFFF" }, textStyle: { typeface: "Microsoft YaHei", fontSize: "11px", color: C.gray } },
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 85 },
  });
}
function chartNarrative(slide, title, body, stat1, label1, stat2, label2, page) {
  header(slide, title, page);
  txt(slide, body, 670, 145, 540, 170, 24, C.ink);
  box(slide, 670, 365, 250, 220);
  box(slide, 960, 365, 250, 220);
  txt(slide, stat1, 695, 395, 200, 90, 38, stat1.startsWith("-") ? C.red : C.blue, true);
  txt(slide, label1, 695, 495, 200, 65, 20, C.gray);
  txt(slide, stat2, 985, 395, 200, 90, 38, stat2.startsWith("-") ? C.red : C.blue, true);
  txt(slide, label2, 985, 495, 200, 65, 20, C.gray);
}

let s = deck.slides.add();
console.log("slide1-add");
txt(s, "经营复盘｜2026年4月", 42, 35, 600, 45, 22, C.gray, true);
console.log("slide1-text1");
txt(s, "大客中心\n利润结构分析", 42, 170, 900, 230, 62, C.ink, true);
txt(s, "预算 vs 实际｜累计预算 vs 累计实际\n营业收入 · 毛利率 · 销售费用", 42, 480, 700, 110, 27, C.gray);
addNotes(s, "各位好，今天汇报大客中心2026年4月及累计经营表现。核心结论是：收入增长明显，但4月利润被合同扣点、零食业务负毛利和市场费用集中投放共同侵蚀；累计仍保持盈利，但利润完成度明显落后于收入完成度。");

s = deck.slides.add();
header(s, "收入超预算，但利润转化明显不足", 2);
txt(s, "累计净收入8,820.7万元，完成预算134.9%；但毛利率只有12.0%，净利润仅完成预算41.3%。当前重点应从规模增长切换到收入质量与费用效率。", 42, 115, 1160, 130, 24);
const stats = [["134.9%", "累计净收入达成\n8,820.7万元", C.blue], ["12.0%", "累计实际毛利率\n较预算低2.4pct", C.green], ["41.3%", "累计净利润达成\n211.9万元", C.red]];
stats.forEach((a, i) => { const x = 42 + i * 408; box(s, x, 310, 370, 300); txt(s, a[0], x + 28, 345, 310, 100, 44, a[2], true); txt(s, a[1], x + 28, 470, 310, 90, 22, C.gray); });
addNotes(s, "先看总体判断。累计净收入8,820.7万元，完成预算134.9%，但累计毛利率只有12.0%，较预算14.4%低2.4个百分点；累计净利润211.9万元，仅完成预算的41.3%。这说明新增收入没有按预算转化为利润。4月单月更严峻，毛利为负53.9万元，净亏损335.2万元。");

s = deck.slides.add();
chartNarrative(s, "关键指标：4月利润转负，累计利润承压", "4月净收入超预算9.9%，但成本超预算33.6%、销售直接费用超预算127.6%，导致净利润由预算盈利113.4万元转为亏损335.2万元。", "-448.6万元", "4月净利润预算差额", "-300.9万元", "累计净利润预算差额", 3);
addChart(s, ["4月净收入", "4月毛利", "4月销售费用", "4月净利润", "累计净收入", "累计净利润"], [{ name: "预算（万元）", values: [1629.5, 248.2, 114.9, 113.4, 6536.7, 512.9], fill: C.light }, { name: "实际（万元）", values: [1791.4, -53.9, 261.4, -335.2, 8820.7, 211.9], fill: C.blue }]);
addNotes(s, "这页把预算与实际放在一起看。4月净收入比预算多161.9万元，但毛利比预算少302.1万元；销售直接费用比预算多146.5万元，最终净利润比预算少448.6万元。累计收入多2,284.0万元，净利润却少300.9万元，利润弹性显著弱于收入弹性。");

s = deck.slides.add();
chartNarrative(s, "营业收入结构：会员增长最强，零食单月明显收缩", "4月毛收入中，会员&创新占52.6%，成为第一大来源；零食占比由累计24.9%降至5.9%。4月合同扣点378.7万元，占毛收入17.4%，显著压缩净收入增长。", "52.6%", "4月会员&创新\n毛收入占比", "17.4%", "4月合同扣点/毛收入", 4);
addChart(s, ["大客-KA", "大客-餐饮", "会员&创新", "大客-零食"], [{ name: "4月毛收入占比（%）", values: [37.0, 4.6, 52.6, 5.9], fill: C.blue }, { name: "累计毛收入占比（%）", values: [28.7, 2.6, 43.8, 24.9], fill: C.light }], 60);
addNotes(s, "收入结构出现明显切换。4月会员与创新占毛收入52.6%，较累计结构高8.8个百分点；KA占37.0%，也高于累计。零食则从累计24.9%降到4月5.9%，单月规模显著收缩。需要特别关注合同扣点：4月达到378.7万元，占毛收入17.4%，使毛收入33.2%的超预算增长，最终只转化为净收入9.9%的增长。");

s = deck.slides.add();
chartNarrative(s, "毛利率结构：零食负毛利拖累，KA贡献主要利润", "4月KA毛利率31.9%，贡献222.8万元毛利；会员&创新15.8%，贡献136.8万元；零食毛利率-39.0%，单项亏损49.8万元，拉低整体毛利率。", "-3.0%", "4月整体实际毛利率", "12.0%", "累计整体实际毛利率", 5);
addChart(s, ["大客-KA", "大客-餐饮", "会员&创新", "大客-零食"], [{ name: "4月毛利率（%）", values: [31.9, 15.1, 15.8, -39.0], fill: C.blue }, { name: "累计毛利率（%）", values: [27.2, 14.5, 14.0, 8.3], fill: C.light }], 40);
addNotes(s, "毛利结构分化明显。KA是4月最主要的利润来源，毛利222.8万元、毛利率31.9%；会员与创新贡献136.8万元，毛利率15.8%；餐饮规模较小。零食单月收入127.5万元，却产生负毛利49.8万元，毛利率负39.0%，是4月整体毛利率跌到负3.0%的直接拖累项。累计看零食仍有8.3%毛利率，说明问题集中在4月，需要追溯具体订单、成本及促销政策。");

s = deck.slides.add();
chartNarrative(s, "销售费用结构：市场费用占八成，投入增速远超收入", "4月销售直接费用261.4万元，其中市场费用216.3万元，占82.7%；费用率14.6%，较预算7.0%高7.5pct。累计销售费用率8.9%，较预算高3.3pct。", "127.6%", "4月销售费用超预算", "114.4%", "累计销售费用超预算", 6);
addChart(s, ["职工薪酬", "市场费用"], [{ name: "4月（万元）", values: [45.1, 216.3], fill: C.blue }, { name: "累计（万元）", values: [144.8, 639.8], fill: C.light }]);
addNotes(s, "销售费用是第二个核心矛盾。4月销售直接费用261.4万元，较预算多146.5万元；其中市场费用216.3万元，占销售费用82.7%，是主要增量。费用率从预算7.0%升到14.6%。累计市场费用639.8万元，占销售费用81.6%；累计销售费用率8.9%，比预算高3.3个百分点。建议从客户、项目和费用类型三个维度核算投放后毛利，而不是只看收入增量。");

s = deck.slides.add();
header(s, "三项动作优先恢复利润转化", 7);
const acts = [["立即｜7天", "止损", "逐单复盘零食负毛利；冻结低于底线毛利率的新增订单与促销。"], ["短期｜30天", "控费", "拆解市场费用到客户/活动；设置“增量毛利覆盖费用”准入标准。"], ["季度内", "调结构", "扩大KA高毛利收入；优化会员扣点条款；建立周度收入质量看板。"]];
acts.forEach((a, i) => { const x = 42 + i * 410; txt(s, a[0], x, 200, 330, 40, 19, C.gray, true); box(s, x, 275, 360, 270); txt(s, a[1], x + 25, 300, 310, 65, 32, C.blue, true); txt(s, a[2], x + 25, 385, 310, 120, 21, C.ink); });
addNotes(s, "建议分三步推进。第一，七天内完成零食负毛利订单清单，明确价格、采购成本、物流和促销责任，低于底线毛利率的业务先止损。第二，三十天内把市场费用穿透到客户和活动，要求新增费用必须有可验证的增量毛利覆盖。第三，季度内优化收入结构，优先放大KA高毛利业务，同时重新审视会员与创新业务的合同扣点条款，并建立周度收入质量看板。");

s = deck.slides.add();
txt(s, "结论", 42, 35, 250, 45, 22, C.gray, true);
txt(s, "规模已增长\n利润要追回", 42, 175, 850, 230, 62, C.ink, true);
txt(s, "守住零食毛利底线\n压降市场费用率\n提升合同后净收入质量", 42, 490, 650, 130, 27, C.gray);
addNotes(s, "最后总结：大客中心的增长动能是清晰的，但4月已经出现规模与利润背离。下一阶段经营目标应从单纯追收入，切换到合同后净收入、毛利率和费用后利润三项指标联动管理。只要零食负毛利及时止损、市场费用效率恢复、合同扣点得到控制，累计利润仍有修复空间。");

for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(`${renderDir}\\slide-${String(i + 1).padStart(2, "0")}.png`, new Uint8Array(await png.arrayBuffer()));
}
const montage = await deck.export({ format: "png", montage: true, scale: 0.55 });
await fs.writeFile(`${outDir}\\montage.png`, new Uint8Array(await montage.arrayBuffer()));
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(`${outDir}\\2026年4月大客中心利润结构分析及演讲稿.pptx`);
const inspect = await deck.inspect({ kind: "slide,textbox,chart,notes", maxChars: 30000 });
await fs.writeFile(`${outDir}\\inspection.ndjson`, inspect.ndjson, "utf8");
console.log(`DONE ${deck.slides.items.length}`);
