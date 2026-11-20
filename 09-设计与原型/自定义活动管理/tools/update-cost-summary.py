from pathlib import Path
import re
p=Path('E:/cxy/09-设计与原型/自定义活动管理/custom-activity.html')
s=p.read_text(encoding='utf-8')
a=s.index('<div class="summary"');b=s.index('</section>',a)
s=s[:a]+'''<div class="grid" style="background:var(--p-soft);padding:24px;margin-top:16px;border-radius:4px"><div>预计费用总额：<b id="total">—</b> 元</div><label><span><em>*</em> 我司承担</span><div class="row" style="flex-wrap:nowrap"><input id="company" aria-label="我司承担金额" required type="number" min="0" step="0.01"><span>元</span><input id="company-percent" aria-label="我司承担比例" required type="number" min="0" max="100" step="0.01" value="100"><span>%</span></div></label><label><span><em>*</em> 经销商承担</span><div class="row" style="flex-wrap:nowrap"><input id="dealer" aria-label="经销商承担金额" required type="number" min="0" step="0.01"><span>元</span><input id="dealer-percent" aria-label="经销商承担比例" required type="number" min="0" max="100" step="0.01" value="0"><span>%</span></div></label><label><span><em>*</em> 支付方式</span><select required id="payment"><option>经销商上账</option><option>对公付款</option><option>账扣</option><option>零工平台</option></select></label><label class="wide">费用说明<input id="original" placeholder="请填写费用用途、计算依据及申请原因"></label></div>'''+s[b:]
s=s.replace('<th>我司承担%</th><th>结算方式</th>','').replace("'amount','share','pay','delete'","'amount','delete'")
s=s.replace('每项独立设置测算方式、承担比例和结算方式，汇总自动计算。','每项设置费用测算方式，汇总后统一设置承担金额、比例及支付方式。')
start=s.index('total=round(total);company=round(company);');end=s.index('return {total,company}',start)
s=s[:start]+'''total=round(total);company=round(total*Number(q('#company-percent').value)/100);q('#total').textContent=fmt(total);q('#company').value=company.toFixed(2);q('#dealer').value=round(total-company).toFixed(2);q('#dealer-percent').value=round(100-Number(q('#company-percent').value));q('#company').max=total;q('#dealer').max=total;'''+s[end:]
s=re.sub(r"q\('#sales'\)\.oninput=calc;q\('#nature'\)\.onchange=.*?\};",'''q('#company-percent').oninput=calc;q('#dealer-percent').oninput=()=>{q('#company-percent').value=100-Number(q('#dealer-percent').value);calc()};q('#company').onchange=()=>{const total=calc().total;};''',s)
# amount editing reads the user's value before recalculation.
s=s.replace("q('#company').onchange=()=>{const total=calc().total;};", "q('#company').onchange=()=>{const amount=Number(q('#company').value),total=rows.reduce((sum,r)=>sum+r.amount,0);q('#company-percent').value=total?amount/total*100:100;calc()};q('#dealer').onchange=()=>{const amount=Number(q('#dealer').value),total=rows.reduce((sum,r)=>sum+r.amount,0);q('#company-percent').value=total?(total-amount)/total*100:100;calc()};")
s=re.sub(r"else if\(Number\(q\('#cap'\).*?target=q\('#cap'\)\}",'',s)
p.write_text(s,encoding='utf-8')
Path('E:/cxy/09-设计与原型/自定义活动管理/自定义活动申请.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>自定义活动申请</title><body style="margin:16px">'+s+'</body></html>',encoding='utf-8')
