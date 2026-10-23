from pathlib import Path
import re
p=Path('C:/Users/admin/.codex/visualizations/2026/10/07/01a113f3-1f33-7d40-bf39-7aaed264b0b9/custom-activity.html')
s=p.read_text(encoding='utf-8')
s,n=re.subn(r'<section><h2>核销与凭证</h2>.*?</section>','',s,flags=re.S)
assert n==1
s,n=re.subn(r'<details><summary>审批记录与操作日志</summary>.*?</details>','',s,flags=re.S)
assert n==1
s,n=re.subn(r"q\('#files'\)\.onchange=\(\)=>\{.*?\};",'',s)
assert n==1
s=s.replace("else if(!root.querySelector('.check input:checked'))msg='请至少选择一项核销凭证。';",'')
p.write_text(s,encoding='utf-8')
