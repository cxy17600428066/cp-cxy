from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
old=(root/'活动核销.html').read_text(encoding='utf-8')
basic=re.search(r'<section><h2>基础信息</h2>.*?</section>',old,re.S).group()
# IDs in the earlier page are filled from the locked request below.
p=root/'多次执行核销.html'
s=p.read_text(encoding='utf-8')
anchor="if(isWriteoff){let selectedIds=[]"
assert anchor in s
setup='''if(isWriteoff){const main=q('main'),basic=document.createElement('div');basic.id='writeoff-basic-restored';basic.innerHTML=BASIC;main.querySelector('section').before(basic);const activity=q('#snapshot').parentElement,activityPanel=document.createElement('section');activityPanel.id='writeoff-activity-restored';activityPanel.style.padding='0';basic.after(activityPanel);activityPanel.append(activity);activity.querySelector('summary').textContent='活动信息 · 展开查看申请表单（只读）';activity.open=false;main.querySelector('section:has(#stats)').hidden=true;const title=q('#list-title');title.textContent='核销记录';const editor=q('#editor');editor.querySelector('h2').textContent='核销信息';function restoreValues(){const app=db.application;if(!app)return;const holder=document.createElement('div');holder.innerHTML=app.html;const fields=holder.querySelectorAll('.basic-grid input');const set=(id,value)=>{const el=basic.querySelector(id);if(el)el.value=value};set('#dealer-name',app.dealer);set('#system-name',fields[1]?.value||'');set('#dates',(holder.querySelector('#start')?.value||'')+' 至 '+(holder.querySelector('#end')?.value||''));set('#pay',app.pay);const approved=db.executions.filter(e=>['已提交','审核通过'].includes(e.status));set('#actual-sum',money(shareTotal(db.application.items.map((_,i)=>sum(approved.map(e=>e.lines[i]))))));}restoreValues();window.addEventListener('storage',()=>{load();restoreValues()});const overviewSummary=basic.querySelector('textarea');if(overviewSummary){overviewSummary.removeAttribute('form');overviewSummary.removeAttribute('required');}const oldRefresh=window.refreshRecords;window.refreshRecords=()=>{oldRefresh?.();restoreValues()};}
'''.replace('BASIC',json.dumps(basic,ensure_ascii=False))
s=s.replace(anchor,setup+anchor)
# In the batch editor put the existing controls in the familiar named sections.
s=s.replace("function batchDraw(){q('#details').replaceChildren();", "function batchDraw(){q('#editor-title').textContent=active?'核销信息 · '+active:'核销信息';q('#details').replaceChildren();")
# Place supplemental fields after the execution cost table, as in the former page.
s=s.replace("q('#new').onclick=()=>{load();if(!db.application)","q('#new').onclick=()=>{load();if(!db.application)")
p.write_text(s,encoding='utf-8')
