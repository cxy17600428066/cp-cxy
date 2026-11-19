// 合同条款、期间入池冲回和进度。历史单据保留原 ID，不改原始金额。
function normClause(v){return String(v||'').normalize('NFKC').trim().toUpperCase()}
function clauseList(l){
 const main={...l,clauseCode:normClause(l.clauseCode||l.id+'-MAIN'),stackMode:'primary'};
 return [main,...(l.strategies||[]).map(x=>({...l,...x,id:l.id+'/'+x.id,strategies:[],rebateMethod:'rate',serviceRate:0,clauseCode:normClause(x.clauseCode||l.id+'-'+x.id),stackMode:x.stackMode||'stack'}))];
}
function validateClauses(l,old){
 const seen=new Set();for(const x of clauseList(l)){
  if(!/^[A-Z0-9][A-Z0-9._-]{0,59}$/.test(x.clauseCode))throw Error('合同条款编号须为 1–60 位字母、数字、点、横线或下划线。');
  if(seen.has(x.clauseCode))throw Error('同一合同条款编号不能重复；改名也不能再累计一次。');seen.add(x.clauseCode);
 }
 if(!old)return;
 const history=[...(state.funding.bindingVersions||[]),old].filter(v=>v.id===old.id).flatMap(clauseList);
 for(const x of clauseList(l)){
  if(history.some(h=>h.id!==x.id&&h.clauseCode===x.clauseCode))throw Error('条款编号已用于本合同另一策略行，请沿用原行或使用独立条款编号。');
  const previous=clauseList(old).find(h=>h.id===x.id);
  const referenced=previous&&(old.clauseCode&&x.id===old.id||(old.strategies||[]).some(h=>h.clauseCode&&x.id===old.id+'/'+h.id)||
    [...state.funding.sales,...(state.funding.openingRights||[])].some(s=>s.link.id===old.id&&clauseList(s.link).some(a=>a.id===x.id))||
    (state.dealerPrograms||[]).some(p=>[p.live,p.draft,p.oa?.candidate].some(v=>v?.items?.some(i=>i.clauseRef?.code===previous.clauseCode&&i.clauseRef.policyId===old.policyId))));
  if(previous&&previous.clauseCode!==x.clauseCode&&referenced)throw Error('已有条款引用或累计记录，不能替换编号；请保留原条款并新增独立义务。');
 }
}
function appliedClauses(s){const rows=clauseList(s.link),selected=s.selectedClause||rows[0].clauseCode;
 return rows.filter(x=>x.stackMode==='stack'||x.clauseCode===selected)}
function immediateClauseAmount(s,base){return sum(appliedClauses(s).filter(l=>l.rebateTiming==='instant').map(l=>annualEntitlement(l,base)))}
function chooseSaleClause(link,choice){validateClauses(link);const alternatives=clauseList(link).filter(x=>x.stackMode!=='stack');
 if(alternatives.length>1&&!choice)throw Error('合同有互斥返利条款，请为本次签收选择一项。');
 const selected=choice||alternatives[0].clauseCode;if(!alternatives.some(x=>x.clauseCode===selected))throw Error('所选返利条款不属于当前合同，请重新选择。');return selected}
function syncSaleClause(){
 const sel=$('saleClause');if(!sel)return;const ret=$('saleKind').value==='return',orig=ret&&state.funding.sales.find(s=>s.id===$('saleOriginal').value);
 const l=orig?.link||activeFundingVersions(state.funding.bindingVersions,state.funding.bindings,$('saleDate').value).find(x=>x.policyId===$('salePolicy').value&&x.customer===$('saleCustomer').value);
 const all=l?clauseList(l):[],opts=all.filter(x=>x.stackMode!=='stack'),key=l?l.id+'/'+l.version:'',current=key===sel.dataset.contract?sel.value:'';
 sel.innerHTML=(opts.length===1?'':'<option value="">请先选择合同及适用条款</option>')+opts.map(x=>`<option value="${esc(x.clauseCode)}">${esc(x.clauseCode+' · '+(x.strategyName||'主返利'))}</option>`).join('');
 sel.dataset.contract=key;sel.value=orig?(orig.selectedClause||opts[0]?.clauseCode):opts.length===1?opts[0].clauseCode:current;sel.disabled=ret;sel.required=!ret&&opts.length>1;
 $('saleClauseTip').textContent=all.some(x=>x.stackMode==='stack')?'同时适用：'+all.filter(x=>x.stackMode==='stack').map(x=>x.clauseCode).join('、'):'同一签收对同一条款仅累计一次。';
}
function programClauseOptions(policyId,ref){const l=state.funding.bindings.find(l=>l.policyId===policyId),rows=l?clauseList(l):[];return '<option value="">仅作方案测算，不关联返利入账</option>'+(ref?.policyId===policyId&&!rows.some(x=>x.clauseCode===ref.code)?`<option value="${esc(ref.code)}" selected>${esc(ref.code)} · 历史方案快照</option>`:'')+rows.map(x=>`<option value="${esc(x.clauseCode)}" ${ref?.policyId===policyId&&ref.code===x.clauseCode?'selected':''}>${esc(x.clauseCode+' · '+(x.strategyName||'主返利'))}</option>`).join('')}
function programClauseField(r,policyId){return r.route==='rebate'?`<div class="field"><label for="clause_${r.id}">引用合同返利条款</label><select data-program-clause id="clause_${r.id}">${programClauseOptions(policyId,r.clauseRef)}</select></div>`:''}
document.addEventListener('change',e=>{if(e.target.id==='salePolicy')syncSaleClause();if(['gPolicy','gCustomer'].includes(e.target.id))document.querySelectorAll('[data-program-clause]').forEach(sel=>{sel.innerHTML=programClauseOptions($('gPolicy').value,null)})});

// 查明每个签收首次计入哪个正向批次；批次签名包含当时已核验的销售及退货行。
function earnReturnPlan(batch){
 if(!batch||batch.kind!=='earn'||batch.status!=='approved'||batch.reversesBatch)return null;
 const f=state.funding,approved=f.batches.filter(b=>b.key===batch.key&&b.status==='approved'),owner=new Map(),covered=new Set();
 for(const b of approved){
  if(b.reversesBatch){for(const id of b.returnIds)covered.add(id);continue}
  for(const id of JSON.parse(b.signature)[0]){if(!owner.has(id))owner.set(id,b.id);covered.add(id)}
 }
 const rows=f.sales.filter(s=>s.kind==='return'&&owner.get(s.original)===batch.id&&!covered.has(s.id));
 if(!rows.length)return null;
 return {ids:rows.map(s=>s.id),amount:sum(rows.map(s=>s.earning)),service:sum(rows.map(s=>s.service||0)),rebate:sum(rows.map(s=>s.instantRebate||0)),originalCredit:f.credits.find(c=>c.batch===batch.id)?.id};
}
function earnOrigins(g){return g.kind==='earn'?state.funding.batches.filter(b=>b.key===g.key&&earnReturnPlan(b)):[]}
function requestEarnReturn(id){
 const f=state.funding,b=f.batches.find(x=>x.id===id),plan=earnReturnPlan(b);
 if(plan&&f.sales.some(s=>plan.ids.includes(s.id)&&s.date>f.date))throw Error('业务日不能早于关联退货日期。');
 if(!plan||!plan.originalCredit)throw Error('没有可冲回的已入池退货，或找不到原入池流水。');
 if($('role').value!=='sales')throw Error('请由销售发起经营池冲回申请。');
 if(f.batches.some(x=>x.key===b.key&&x.status==='pending'))throw Error('该期间已有待审单据，请先处理。');
 const g=fundingGroups().find(g=>g.key===b.key),req={id:nextId('BATCH-',f.batches),kind:'earn',key:g.key,customer:b.customer,pool:b.pool,period:clone(b.period),basis:g.basis,target:g.target,
  amount:plan.amount,service:plan.service,rebate:plan.rebate,reversesBatch:b.id,reversesCredit:plan.originalCredit,returnIds:plan.ids,signature:g.signature,strategyName:'退货冲回经营池',status:'pending',step:0,applicant:'sales',logs:[{who:'sales',action:'申请退货冲回',date:f.date}]};
 f.batches.push(req);save();return req;
}
function earnReturnView(b){
 if(b.reversesBatch)return `<div class="banner">原期间 ${esc(b.period.key)} · 原批次 ${esc(b.reversesBatch)} · 原入池流水 ${esc(b.reversesCredit)}<br>关联退货：${b.returnIds.map(esc).join('、')}。财务通过后按当前业务日追加调整流水。</div>`;
 const p=earnReturnPlan(b),requests=state.funding.batches.filter(x=>x.reversesBatch===b.id);
 if(!p&&!requests.length)return '';
 const pending=state.funding.batches.find(x=>x.key===b.key&&x.status==='pending');
 return `<section><h3>跨期退货冲回</h3>${p?`<p>关联退货 ${p.ids.map(esc).join('、')}；经营池来源调整 ${money(p.amount)}，服务预留调整 ${money(p.service)}。原批次及已核销活动保留。</p>${pending?`<button data-funding-batch="${pending.id}">查看本期待审单</button>`:`<button class="primary" data-earn-return="${b.id}">申请冲回经营池</button>`}`:''}${requests.length?'<p>冲回记录：'+requests.map(x=>`<button data-funding-batch="${x.id}">${x.id} · ${batchStatusLabel(x)}</button>`).join(' ')+'</p>':''}</section>`;
}
function batchStatusLabel(b){return b.status==='pending'?'待'+roles[['business','finance'][b.step]]:b.status==='rejected'?'已驳回':b.reversesBatch?'已冲回':'已入池'}
function periodProgress(g){
 const f=state.funding,batches=f.batches.filter(b=>b.key===g.key&&b.status==='approved'),ids=new Set(batches.map(b=>b.id)),paid=sum(f.payouts.filter(p=>ids.has(p.batch)).map(p=>p.amount));
 let status=g.pending?'待'+roles[['business','finance'][g.pending.step]]:g.kind==='earn'&&earnOrigins(g).length?'待销售申请冲回':g.delta<0?'待业务申请调整':g.delta>0?(g.ready?'已到期 · 待销售申请':'累计中 · 未到期'):g.kind==='rebate'&&g.released>paid?(paid>0?'部分已发放 · 待财务付余款':'已转池 · 待财务发放'):g.kind==='rebate'&&paid>0?'已发放':g.released?'已入池':'无待办';
 if(g.kind==='rebate'&&g.delta<0&&(f.corrections||[]).some(c=>ids.has(c.batch)&&c.status==='pending'))status='待财务确认调整';
 return {status,paid};
}
function unreservedAnnual(pool){return sum(fundingGroups().filter(g=>g.kind==='rebate'&&g.pool===pool&&g.link.rebateTiming==='year'&&!g.link.lockEarly).map(g=>Math.max(0,g.delta-Math.max(0,(g.openingReserve||0)-g.released))))}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-earn-return]');if(!btn)return;try{openFundingBatch(requestEarnReturn(btn.dataset.earnReturn).id)}catch(err){fundingFail(err)}});

function periodSaleTag(s){
 const batches=state.funding.batches.filter(b=>b.kind==='earn'&&b.key===earningGroupKey(s)&&b.status!=='rejected');
 const includes=(b,id)=>b.reversesBatch?b.returnIds.includes(id):JSON.parse(b.signature)[0].includes(id);
 const posted=batches.find(b=>b.status==='approved'&&includes(b,s.id));
 if(posted)return tag(posted.reversesBatch?'已冲回经营池':'已按期入池','ok');
 const review=batches.find(b=>b.status==='pending'&&includes(b,s.id));
 if(review)return tag('待'+roles[['business','finance'][review.step]],'warn');
 return s.kind==='return'&&batches.some(b=>b.status==='approved'&&includes(b,s.original))?tag('待申请经营池冲回','warn'):tag('待期间入池','warn');
}
