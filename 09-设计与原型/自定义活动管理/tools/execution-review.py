from pathlib import Path
p=Path(__file__).resolve().parents[1]/'多次执行核销.html'
s=p.read_text(encoding='utf-8')
# Reservation includes pending executions; only approved executions can be written off.
s=s.replace("db.executions.filter(r=>r.status==='已提交')","db.executions.filter(r=>['待审核','审核通过','已提交'].includes(r.status))")
s=s.replace("e.status==='已提交'","['审核通过','已提交'].includes(e.status)")
s=s.replace("readonly=record?.status==='已提交'","readonly=['待审核','审核通过','已提交'].includes(record?.status)")
s=s.replace("?.status==='已提交')throw Error('该单已提交，不可覆盖')","?.status&&['待审核','审核通过','已提交'].includes((isWriteoff?db.writeoffs:db.executions).find(r=>r.id===editing)?.status))throw Error('该单已提交，不可覆盖')")
s=s.replace("status:submit?'已提交':'草稿',lines:submit?normalized", "status:submit?(isWriteoff?'已提交':'待审核'):'草稿',submittedAt:submit?new Date().toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):null,lines:submit?normalized")
s=s.replace("say(submit?'已提交，演示为审核通过并占用额度。':'草稿已保存，暂不占用额度。')","say(submit?(isWriteoff?'核销已提交。':'执行已提交，等待审核；审核通过后才可核销。'):'草稿已保存，暂不占用额度。')")
s=s.replace("<tr><th>执行单号</th><th>实际费用</th><th>已处理核销原额</th><th>剩余可核销原额</th><th>状态</th><th>操作</th></tr>","<tr><th>执行单号</th><th>实际费用</th><th>已处理核销原额</th><th>剩余可核销原额</th><th>状态</th><th>操作</th></tr>")
# Rebuild execution rows with business fields and independent audit/writeoff states.
anchor="if(!records.length){"
insert='''if(!isWriteoff){q('#head').innerHTML='<tr><th>执行单号</th><th>执行数据 / 实际费用（元）</th><th>合计（元）</th><th>提交时间</th><th>核销状态</th><th>审核状态</th><th>操作</th></tr>';q('#records').replaceChildren();db.executions.forEach(r=>{const tr=document.createElement('tr');cell(tr,r.id);const detail=cell(tr,'');db.application.items.forEach((item,i)=>{const div=document.createElement('div');div.textContent=item.name+'：'+(r.lines[i]===''?'未填':money(r.lines[i]));detail.append(div)});cell(tr,money(actualTotal(r)));cell(tr,r.submittedAt||'—');const related=db.writeoffs.filter(w=>(w.executionIds||[w.execution]).includes(r.id));cell(tr,related.some(w=>w.status==='已提交')?'已核销':related.length?'核销草稿占用':'未核销');const status=r.status==='已提交'?'审核通过':r.status;const statusCell=cell(tr,status);if(r.reviewNote){const note=document.createElement('div');note.textContent=r.reviewNote;statusCell.append(note)}const ops=cell(tr,'');ops.append(button(['草稿','已退回'].includes(status)?'编辑':'查看',()=>open(r)));if(status==='待审核'){ops.append(button('审核',()=>reviewExecution(r.id)))}q('#records').append(tr)})}'''
s=s.replace(anchor,insert+anchor)
# Simple native review dialog, with required return reason.
anchor='function selectedExec()'
function='''function reviewExecution(id){const dialog=document.createElement('dialog');dialog.style.cssText='width:min(520px,90vw);padding:24px;border:1px solid #dce3ec;border-radius:8px';const title=document.createElement('h2');title.textContent='审核执行 '+id;const tip=document.createElement('p');tip.textContent='原型审核演示；正式系统应按审核人权限控制。';const note=document.createElement('textarea');note.setAttribute('aria-label','审核意见');note.placeholder='审核意见（退回时必填）';const feedback=document.createElement('p');feedback.setAttribute('role','alert');function decide(pass){if(!pass&&!note.value.trim()){feedback.textContent='请填写退回原因。';return}load();const record=db.executions.find(r=>r.id===id);if(record?.status!=='待审核'){feedback.textContent='单据状态已变化，请关闭并刷新。';return}record.status=pass?'审核通过':'已退回';record.reviewNote=note.value.trim();save();dialog.close();dialog.remove();render();say(pass?'审核通过，该执行单可核销。':'已退回，申请人可编辑后重新提交。')}dialog.append(title,tip,note,feedback,button('审核通过',()=>decide(true)),button('退回',()=>decide(false)),button('取消',()=>{dialog.close();dialog.remove()}));document.body.append(dialog);dialog.showModal()}
'''
s=s.replace(anchor,function+anchor)
s=s.replace('提交模拟审核通过，草稿不占额度，已提交记录不可修改。','执行提交后需人工审核，通过后方可核销；待审核占用预算，退回释放额度。')
s=s.replace("'已提交记录不可修改'","'已提交记录不可修改'")
p.write_text(s,encoding='utf-8')
