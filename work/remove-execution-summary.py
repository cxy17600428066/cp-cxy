from pathlib import Path
import re
p=Path('E:/cxy/活动执行填报.html')
s=p.read_text(encoding='utf-8')
s,n=re.subn(r'<div class="summary" aria-live="polite">.*?</div></div></section>','</section>',s,count=1,flags=re.S)
assert n==1
start=s.index('function calc(){')
end=s.index("inputs.forEach(el=>el.addEventListener('input',calc))",start)
s=s[:start]+"function calc(){return Math.round(inputs.reduce((sum,e)=>sum+Number(e.value),0)*100)/100}"+s[end:]
p.write_text(s,encoding='utf-8')
