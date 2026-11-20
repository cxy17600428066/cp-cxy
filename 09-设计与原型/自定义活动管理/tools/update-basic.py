from pathlib import Path
import re
p=Path('E:/cxy/09-设计与原型/自定义活动管理/custom-activity.html')
s=p.read_text(encoding='utf-8')
def field(label,content):return '<div class="basic-field"><span>'+label+'</span><div>'+content+'</div></div>'
def radio(name,items):return '<div class="row">'+''.join('<label class="check"><input type="radio" name="'+name+'" value="'+v+'" '+('checked' if i==0 else '')+'>'+v+'</label>' for i,v in enumerate(items))+'</div>'
basic='<section class="basic"><h2>基础信息</h2><div class="basic-grid">'
basic+=field('<em>*</em> 经销商全称：','<input required value="示例经销商有限公司">')+field('<em>*</em> 系统名称：','<input required value="示例连锁系统">')+field('<em>*</em> 经销商归属省区/城市：','<input required value="上海市 / 上海市">')
basic+=field('<em>*</em> 计划起止日期：','<div class="datepair"><input id="start" aria-label="开始日期" required type="date" value="2026-10-01"><span>—</span><input id="end" aria-label="结束日期" required type="date" value="2026-11-30"></div>')+field('<em>*</em> 提报人：','<input readonly value="当前登录用户">')+field('提报日期：','<span>提交时自动生成</span>')
basic+='<div class="basic-product">'+field('<em>*</em> 产品属性：',radio('product',['常温休食','冻品休食','餐饮']))+'</div>'+field('<em>*</em> 事业中心：',radio('center',['大客','休食','餐饮']))
basic+='<div class="wide">'+field('<em>*</em> 渠道类型：',radio('channel',['超市卤味档口','社会卤味店','乡厨','农批（贸）市场','烧烤店','连锁餐饮','星级酒店']))+'</div></div>'
basic+='<div class="basic-stats">'+field('预算费用合计(元)：','<b id="basic-total">0.00</b>')+field('预计我司承担费用合计(元)：','<b id="basic-company">0.00</b>')+field('预计活动期间销售额(元)：','<input id="forecast-sales" aria-label="预计活动期间销售额" type="number" min="0" step="0.01" placeholder="无销售目标可留空">')+field('费销比合计：','<b id="basic-ratio">不适用</b>')+'</div></section>'
s,n=re.subn(r'<section><h2>基础信息</h2>.*?</section>',basic,s,count=1,flags=re.S);assert n==1
css='''#custom-activity .basic-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px 32px}#custom-activity .basic-field{display:flex;align-items:center;gap:12px;min-width:0}#custom-activity .basic-field>span{flex:0 0 130px;text-align:right;font-size:12px}#custom-activity .basic-field>div{flex:1;min-width:0}#custom-activity .basic .check{flex-direction:row;font-size:12px}#custom-activity .basic input[type=radio]{width:14px;min-height:14px}#custom-activity .basic-product{grid-column:span 2}#custom-activity .basic-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:32px}#custom-activity .basic-stats b{color:var(--p-blue)}#custom-activity .basic .datepair input{min-width:0;padding:8px 4px}#custom-activity .basic .datepair{align-items:center}@media(max-width:1200px){#custom-activity .basic-grid{grid-template-columns:1fr}#custom-activity .basic-product{grid-column:auto}}@media(max-width:600px){#custom-activity .basic-stats{grid-template-columns:1fr}#custom-activity .basic-field{align-items:flex-start;flex-direction:column;gap:6px}#custom-activity .basic-field>span{flex:auto;text-align:left}#custom-activity .basic-field>div{width:100%}}'''
s=s.replace('</style>',css+'</style>',1)
s=s.replace('return {total,company}',"q('#basic-total').textContent=fmt(total);q('#basic-company').textContent=fmt(company);const sale=Number(q('#forecast-sales').value);q('#basic-ratio').textContent=sale>0?(company/sale*100).toFixed(2)+'%':'不适用';return {total,company}")
s=s.replace("q('#add').onclick=","q('#forecast-sales').oninput=calc;q('#add').onclick=")
p.write_text(s,encoding='utf-8')
Path('E:/cxy/09-设计与原型/自定义活动管理/自定义活动申请.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>自定义活动申请</title><body style="margin:16px">'+s+'</body></html>',encoding='utf-8')
