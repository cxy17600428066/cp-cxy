from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'多次执行核销.html'
s=p.read_text(encoding='utf-8')
anchor='<form id="form"><label id="execution-choice">'
assert anchor in s
s=s.replace(anchor,'''<form id="form"><div id="execution-period" class="row" style="justify-content:flex-start"><label>执行数据所属期间 · 开始日期 *<input id="period-start" type="date" required></label><label>结束日期 *<input id="period-end" type="date" required></label><small>填写本次实际费用对应的执行期间。</small></div><label id="execution-choice">''')
s=s.replace("readonly=['待审核','审核通过','已提交'].includes(record?.status);", "readonly=['待审核','审核通过','已提交'].includes(record?.status);q('#execution-period').hidden=isWriteoff;q('#period-start').required=!isWriteoff;q('#period-end').required=!isWriteoff;q('#period-start').value=record?.periodStart||'';q('#period-end').value=record?.periodEnd||'';q('#period-start').disabled=readonly;q('#period-end').disabled=readonly;")
s=s.replace("if(submit){if(lines.some", "if(submit){if(!isWriteoff&&(!q('#period-start').value||!q('#period-end').value))throw Error('请填写执行数据所属期间');if(!isWriteoff&&q('#period-end').value<q('#period-start').value)throw Error('结束日期不能早于开始日期');if(lines.some")
s=s.replace("const record={id,status:submit?(isWriteoff?", "const record={id,periodStart:isWriteoff?null:q('#period-start').value,periodEnd:isWriteoff?null:q('#period-end').value,status:submit?(isWriteoff?")
s=s.replace('<th>执行数据 / 实际费用（元）</th>','<th>执行数据所属期间</th><th>执行数据 / 实际费用（元）</th>')
s=s.replace("cell(tr,r.id);const detail=cell(tr,'');", "cell(tr,r.id);cell(tr,r.periodStart&&r.periodEnd?r.periodStart+' 至 '+r.periodEnd:'未记录（历史数据）');const detail=cell(tr,'');")
p.write_text(s,encoding='utf-8')
p=root/'核销页面.html'
s=p.read_text(encoding='utf-8')
s=s.replace('<th>活动类型</th>','<th>执行数据所属期间</th><th>活动类型</th>')
s=s.replace("td(tr,e.id);td(tr,'自定义活动');", "td(tr,e.id);td(tr,e.periodStart&&e.periodEnd?e.periodStart+' 至 '+e.periodEnd:'未记录（历史数据）');td(tr,'自定义活动');")
s=s.replace("td(tr,'暂无符合条件的已审核执行记录').colSpan=11", "td(tr,'暂无符合条件的已审核执行记录').colSpan=12")
s=s.replace("const note=document.createElement('p');note.textContent='备注：'", "const period=document.createElement('p');period.textContent='执行数据所属期间：'+(e.periodStart&&e.periodEnd?e.periodStart+' 至 '+e.periodEnd:'未记录（历史数据）');const note=document.createElement('p');note.textContent='备注：'")
s=s.replace('dlg.append(title,detail,note,close)','dlg.append(title,period,detail,note,close)')
s=s.replace("executionIds:[...ids],execution:ids.join('、'),lines", "executionIds:[...ids],executionPeriods:selectedRows().map(e=>({executionId:e.id,start:e.periodStart||null,end:e.periodEnd||null})),execution:ids.join('、'),lines")
p.write_text(s,encoding='utf-8')
