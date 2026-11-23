from pathlib import Path
p=Path(__file__).resolve().parents[1]/'多次执行核销.html'
s=p.read_text(encoding='utf-8')
css='''body.execution-with-sidebar #execution-application-sidebar dl{display:block}body.execution-with-sidebar #execution-application-sidebar dl>div{display:block;margin:0 0 22px}body.execution-with-sidebar #execution-application-sidebar dt,body.execution-with-sidebar #execution-application-sidebar dd{display:inline;margin:0;line-height:1.9}body.execution-with-sidebar #execution-application-sidebar dt{margin-right:12px}body.execution-with-sidebar #execution-application-sidebar dd{overflow-wrap:anywhere}body.execution-with-sidebar #execution-application-sidebar{position:sticky;top:16px}#activity-info-panel{padding:0}#activity-info-panel details{margin:0}#activity-info-panel summary{display:list-item;padding:20px;border-bottom:1px solid #dce3ec;font-weight:600;color:#263445}#activity-info-panel #snapshot{padding:16px}#activity-info-panel #snapshot>div{border:0!important}body.execution-with-sidebar main>.row h1{font-size:18px}#activity-info-panel input:disabled,#activity-info-panel select:disabled,#activity-info-panel textarea:disabled{background:#f4f6f9;opacity:1;color:#586779}@media(max-width:800px){body.execution-with-sidebar #execution-application-sidebar{position:static}body.execution-with-sidebar #execution-application-sidebar dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}body.execution-with-sidebar #execution-application-sidebar dl>div{margin:0}}
'''
s=s.replace('</style>',css+'</style>',1)
anchor="q('#title').textContent=isWriteoff?'活动核销记录':'活动执行记录';"
assert anchor in s
s=s.replace(anchor,"""if(!isWriteoff){const detail=q('#snapshot').parentElement,overview=detail.parentElement,panel=document.createElement('section');panel.id='activity-info-panel';overview.before(panel);panel.append(detail);detail.open=true;detail.querySelector('summary').textContent='活动信息　自定义活动（申请表单，只读）';q('#list-title').textContent='执行情况';} """+anchor)
s=s.replace("q('#list-title').textContent=isWriteoff?'核销记录':'执行记录';","q('#list-title').textContent=isWriteoff?'核销记录':'执行情况 · 执行记录';")
p.write_text(s,encoding='utf-8')
