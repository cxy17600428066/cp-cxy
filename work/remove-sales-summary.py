from pathlib import Path
import re
p=Path('C:/Users/admin/.codex/visualizations/2026/10/07/01a113f3-1f33-7d40-bf39-7aaed264b0b9/custom-activity.html')
s=p.read_text(encoding='utf-8')
for label in ['预计活动期间销售额(元)：','费销比合计：']:
 pattern=r'<div class="basic-field"><span>'+re.escape(label)+r'</span><div>.*?</div></div>'
 s,n=re.subn(pattern,'',s,count=1,flags=re.S)
 assert n==1,label
s=s.replace("const sale=Number(q('#forecast-sales').value);q('#basic-ratio').textContent=sale>0?(company/sale*100).toFixed(2)+'%':'不适用';",'')
s=s.replace("q('#forecast-sales').oninput=calc;",'')
assert 'forecast-sales' not in s and 'basic-ratio' not in s
p.write_text(s,encoding='utf-8')
Path('E:/cxy/自定义活动申请.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>自定义活动申请</title><body style="margin:16px">'+s+'</body></html>',encoding='utf-8')
