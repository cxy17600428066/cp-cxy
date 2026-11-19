function migrateFundingEpochs() {
  const f = state.funding;
  if (f.version >= 2) return;
  const versions = new Map(), previous = new Map(), aliases = new Map();
  const links = [...(f.bindingVersions || []), ...f.bindings].sort((a,b)=>a.version-b.version);
  for (const l of links) {
    l.strategies ||= [];
    setFundingEpochs(previous.get(l.id) || {...l,policyId:null}, l, 'split');
    versions.set(l.id+'@'+l.version,l);
    previous.set(l.id,l);
  }
  for (const row of [...f.sales,...(f.openingRights || [])]) {
    const snap = row.link, known = versions.get(snap.id+'@'+snap.version);
    if (!known) continue;
    snap.accumulationVersion = known.accumulationVersion;
    for (const x of snap.strategies || []) x.accumulationVersion = known.strategies.find(y=>y.id===x.id)?.accumulationVersion || snap.version;
    for (const x of fundingStrategyLinks(row)) {
      const period = row.strategyPeriods?.[x.id] || row.rebatePeriod || row.period;
      const suffix = '|'+row.customer+'|'+period.key;
      aliases.set('rebate|'+x.id+'@'+x.version+suffix,'rebate|'+x.id+'@'+(x.accumulationVersion||x.version)+suffix);
    }
  }
  for (const [rows,field] of [[f.batches,'key'],[f.transfers,'group']]) {
    for (const row of rows) {
      if (aliases.has(row[field]) && aliases.get(row[field])!==row[field]) {
        row.originalGroup = row[field];
        row[field] = aliases.get(row[field]);
      }
    }
  }
  f.version = 2;
  save();
}

function earningGroupKey(s) {
  const suffix = s.link.separateContract ? '|'+s.policy.id : '';
  return 'earn|'+s.rule.id+'@'+s.rule.version+'|'+s.customer+'|'+s.period.key+suffix;
}

function trialFundingListAmount(t,v) {
  if (!v) return '待校验';
  const q = fundingTrialQuote(t,v.net);
  return q.error ? '待匹配' : money(q.amount);
}

function policyOption(p) {
  return [p.id,p.contract+' · '+p.mode+' · '+p.name+' / V'+p.version];
}

function saleContracts(cid,date) {
  const f=state.funding;
  const ids=new Set(activeFundingVersions(f.bindingVersions,f.bindings,date).filter(l=>l.customer===cid).map(l=>l.policyId));
  return state.policySchemes.filter(p=>ids.has(p.id)&&p.status==='active'&&p.from<=date&&p.to>=date);
}

function saleReceiptFields() {
  const options=saleContracts('A',state.funding.date).map(policyOption); if(options.length!==1)options.unshift(['','请选择归属合同项目']);
  return fs('salePolicy','归属合同项目',options,options[0]?.[0],'required')+
    ff('saleReceipt','签收单号（分批签收必填）','','text','maxlength="60"')+
    ff('saleReceiptLine','签收行号','1','text','maxlength="30"')+
    ff('saleOrderedQty','原订单行总数量（分批签收必填）','','number','min="0.01" step="0.01"');
}

function syncSaleContractFields() {
  if (!$('salePolicy')) return;
  const isReturn=$('saleKind').value==='return', original=state.funding.sales.find(s=>s.id===$('saleOriginal').value);
  const policies=isReturn&&original?[original.policy]:saleContracts($('saleCustomer').value,$('saleDate').value);
  const current=$('salePolicy').value;
  $('salePolicy').innerHTML=(policies.length===1?'':'<option value="">请选择归属合同项目</option>')+
    policies.map(p=>`<option value="${esc(p.id)}">${esc(policyOption(p)[1])}</option>`).join('');
  if(policies.some(p=>p.id===current)) $('salePolicy').value=current;
  for(const id of ['salePolicy','saleReceipt','saleReceiptLine','saleOrderedQty']) {
    $(id).disabled=isReturn;
    if(id!=='salePolicy') $(id).closest('.field').hidden=isReturn;
  }
  syncSaleClause();
}

function correctionView(b) {
  if(b.status!=='approved'||b.kind!=='rebate') return '';
  const v=batchBalance(b), requests=state.funding.corrections||[];
  const pending=requests.find(r=>r.batch===b.id&&r.status==='pending');
  const summary=`<h3>退货调整与清偿</h3><p>批次账面待付 ${money(v.remaining)}　当前可发放 ${money(v.payable)}　期间待调减 ${money(v.deficit)}</p>`;
  if(pending) return summary+`<p>业务已申请 ${money(pending.amount)} · ${esc(pending.ref)}，待财务核对。</p>
    <div class="actions"><button data-correction-confirm="${esc(b.id)}" class="primary">财务确认调整</button><button data-correction-reject="${esc(b.id)}">退回调整申请</button></div><p id="fundingError" role="alert"></p>`;
  if(!v.deficit) return summary;
  return summary+`<form id="correctionForm" data-id="${esc(b.id)}"><div class="fields">
    ${fs('correctionType','调整方式',[['reverse','冲销未付返利'],['recover','已追回款项并冲回划拨']],v.remaining?'reverse':'recover')}
    ${ff('correctionAmount','调整金额（元）',Math.min(v.deficit,v.remaining||v.paid)/100,'number','min="0.01" step="0.01" required')}
    ${ff('correctionRef','调整凭证号（追偿须填实际收款凭证）','','text','required maxlength="80"')}</div>
    <p>业务复核提交申请，财务核对凭证后确认。已付款须实际追回后登记。</p>
    <button class="primary">提交调整申请</button><p id="fundingError" role="alert"></p></form>`;
}

function negativeBatchLink(g) {
  if(g.kind==='earn')return earnOrigins(g).map(b=>`<button data-funding-batch="${esc(b.id)}">查看原入池批次 ${esc(b.id)}</button>`).join(' ');
  const batches=state.funding.batches.filter(b=>b.key===g.key&&b.status==='approved'&&b.kind==='rebate');
  return batches.filter(b=>batchBalance(b).remaining||batchBalance(b).paid).map(b=>`<button data-funding-batch="${esc(b.id)}">处理 ${esc(b.id)}</button>`).join(' ');
}

function settlementBatchRow(b) {
  const v=batchBalance(b);
  return [esc(b.id)+' / '+esc(customer(b.customer).name),esc(b.targetPool),money(b.amount),money(v.paid),money(v.remaining),
    money(v.payable)+(v.deficit?'<br>'+tag('退货待调整','warn'):''),
    `<button data-funding-batch="${esc(b.id)}">${v.deficit?'核对并调整':'批次详情'}</button> `+
    (v.payable?`<button data-funding-payout="${esc(b.id)}">登记客户返利发放</button>`:'')];
}

function contractTrace(p) {
  const f=state.funding;
  const sales=f.sales.filter(s=>s.customer===p.customer && s.policy.id===p.id);
  const saleIds=new Set(sales.map(s=>s.id));
  const groups=fundingGroups().filter(g=>g.customer===p.customer&&(g.link?.policyId===p.id||g.policyId===p.id));
  const keys=new Set(groups.map(g=>g.key));
  const batches=f.batches.filter(b=>keys.has(b.key)), batchIds=new Set(batches.map(b=>b.id));
  const sourceRows=f.credits.filter(c=>saleIds.has(c.sale)||batchIds.has(c.batch)).map(c=>[c.id,c.reverses?'经营池冲回':'销售获取',esc(c.sale||c.batch)+(c.reverses?' / 原流水 '+esc(c.reverses):''),c.pool,money(c.amount)]);
  const transfers=f.transfers.filter(t=>batchIds.has(t.batch)).map(t=>[t.id,t.amount<0?'返利冲回':'返利转池',t.batch,t.source+' / '+t.target,money(t.amount)]);
  const payments=f.payouts.filter(t=>batchIds.has(t.batch)).map(t=>[esc(t.ref),t.amount<0?'追回款项':'返利清偿',t.batch,t.pool,money(t.amount)]);
  const bindings=f.bindings.filter(l=>l.customer===p.customer&&l.policyId===p.id);
  const programs=state.dealerPrograms.filter(x=>x.customer===p.customer&&x.policyId===p.id);
  const strategies=bindings.flatMap(l=>fundingStrategyLinks({link:l}).map(x=>[esc(x.strategyName||'主返利')+'<br><small>'+esc(x.clauseCode)+' · '+({primary:'主条款',stack:'可叠加',choice:'签收择一'})[x.stackMode]+'</small>',esc(x.sourcePool),
    fundingTiming[x.rebateTiming],x.lockEarly?'先预留':'到期划拨']));
  return `<section class="card"><h2>${esc(p.contract)} · ${esc(p.mode)}</h2><p>${esc(p.name)} / V${p.version}　${esc(p.from)} 至 ${esc(p.to)}</p>
    <h3>合同返利策略</h3>${bindings.map(l=>`<button data-funding-binding="${esc(l.id)}">配置合同资金策略</button>`).join(' ')}${strategies.length?table(['策略','来源池','核验时点','来源处理'],strategies):'<p>此合同尚未接入资金策略。</p>'}
    <h3>关联活动方案</h3>${programs.length?programs.map(x=>`<button data-program-open="${esc(x.id)}">${esc(programInfo(x).name)}</button>`).join(' '):'<p>暂无关联活动方案。</p>'}
    <h3>签收与退货</h3>${sales.length?table(['事件','订单行 / 退货单行','签收行 / 关联原销售','净销售','规则版本'],sales.map(s=>[s.id,esc(s.doc)+' / '+esc(s.line),s.kind==='return'?esc(s.original):esc(s.receipt?s.receipt+' / '+s.receiptLine:'整行签收'),money(s.base),s.rule.id+' V'+s.rule.version])):'<p>暂无销售事件。</p>'}
    <h3>资金流水</h3>${sourceRows.length||transfers.length||payments.length?table(['流水','业务','关联单据','资金池','金额'],[...sourceRows,...transfers,...payments]):'<p>暂无入池、划拨或清偿流水。</p>'}
    ${batches.map(b=>`<button data-funding-batch="${esc(b.id)}">查看 ${esc(b.id)}</button>`).join(' ')}</section>`;
}

function customerContractIndex(cid) {
  const policies=state.policySchemes.filter(p=>p.customer===cid&&p.status==='active');
  return `<section class="card" style="margin-top:16px"><h2>合同项目与资金明细</h2>${table(['合同项目','业务模式','商业政策','操作'],
    policies.map(p=>[esc(p.contract),esc(p.mode),esc(p.name)+' / V'+p.version,`<button data-policy-open="${esc(p.id)}">查看策略与流水</button>`]))}</section>`;
}

function openContractAdmission() {
  const f=state.funding;
  const available=state.policySchemes.filter(p=>!f.bindings.some(l=>l.policyId===p.id)&&!state.policySchemes.some(x=>
    x.id!==p.id&&x.status==='active'&&x.customer===p.customer&&x.contract===p.contract&&x.from<=p.to&&x.to>=p.from));
  if(!available.length) return toast('请先在客户政策中新建独立合同项目并保存草稿。',true);
  showModal('接入已获批合同项目',`<form id="contractAdmission"><p>选择已取得业务审批凭证的合同，由财务登记凭证并启用资金配置。</p>
    ${fs('admitPolicy','客户 / 合同项目',available.map(p=>[p.id,customer(p.customer).name+' / '+policyOption(p)[1]]),available[0].id)}
    ${ff('admitRef','外部合同审批凭证号','','text','required maxlength="80"')}<p id="fundingError" role="alert"></p><button class="primary">确认接入合同</button></form>`);
}

document.addEventListener('submit',e=>{
  const form=e.target;
  if(!['contractAdmission','correctionForm'].includes(form.id))return;
  e.preventDefault();
  try{
    const f=state.funding;
    if(form.id==='contractAdmission'){
      requireFundingFinance();
      const p=state.policySchemes.find(x=>x.id===$('admitPolicy').value),ref=$('admitRef').value.trim();
      if(!ref||f.bindings.some(l=>l.policyId===p.id||l.approvalRef===ref))throw Error('合同已接入或凭证号为空或重复。');
      if(state.policySchemes.some(x=>x.id!==p.id&&x.status==='active'&&x.customer===p.customer&&x.contract===p.contract&&x.from<=p.to&&x.to>=p.from))throw Error('该合同已有同期生效政策。');
      const link={id:nextId('LINK-',f.bindings),version:1,customer:p.customer,policyId:p.id,sourcePool:MAIN_POOL,
        strategyName:'合同返利',rebateTiming:'year',rebateMethod:'rate',rebateRate:p.rebate,tiers:clone(f.bindings[0].tiers),
        tierMode:'whole',serviceRate:p.service,lockEarly:false,strategies:[],from:p.from,to:p.to,status:'active',separateContract:true,approvalRef:ref};
      p.status='active';p.approvalRef=ref;f.bindings.push(link);save();closeModal();render();toast('合同已接入，可配置资金策略与时点。');return;
    }
    if($('role').value!=='business')throw Error('请由业务复核提交调整申请。');
    const b=f.batches.find(x=>x.id===form.dataset.id),v=batchBalance(b);
    const amount=cents($('correctionAmount').value),ref=$('correctionRef').value.trim(),recovery=$('correctionType').value==='recover';
    const groupUnpaid=sum(f.batches.filter(x=>x.key===b.key&&x.status==='approved').map(x=>batchBalance(x).remaining));
    const limit=recovery?Math.min(v.paid,Math.max(0,v.deficit-groupUnpaid)):Math.min(v.remaining,v.deficit);
    if(!ref||amount<=0||amount>limit)throw Error('请核对凭证与金额。先冲销本期未付余额，已付款项须在实际收回后登记。');
    f.corrections||=[];
    if(f.corrections.some(x=>x.status==='pending'&&x.batch===b.id||x.status!=='rejected'&&x.ref===ref)||f.payouts.some(p=>p.ref===ref))throw Error('已有待审申请或该凭证已使用。');
    const signature=fundingGroups().find(g=>g.key===b.key).signature;
    f.corrections.push({batch:b.id,amount,ref,recovery,signature,status:'pending',date:f.date});
    b.logs.push({who:'business',action:'提交返利调整',note:ref+' / '+money(amount),date:f.date});
    save();refreshCorrection(b.id);
  }catch(error){fundingFail(error)}
});

function refreshCorrection(id) {
  detailPage.dirty=false;
  detailPage.values=null;
  detailPage.baseline=JSON.stringify(formSnapshot());
  openFundingBatch(id);
}

document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  try{
    if(b.hasAttribute('data-trial-funding-refresh')){delete workTrial.fundingSnapshot;calculate();return} if(b.hasAttribute('data-admit-contract'))return openContractAdmission();
    const id=b.dataset.correctionConfirm||b.dataset.correctionReject;
    if(!id)return;
    requireFundingFinance();
    const f=state.funding, req=f.corrections?.find(x=>x.batch===id&&x.status==='pending');
    if(!req)throw Error('该申请已处理。');
    if(b.dataset.correctionConfirm){
      const batch=f.batches.find(x=>x.id===id);
      const group=fundingGroups().find(g=>g.key===batch.key);
      if(req.signature&&req.signature!==group?.signature)throw Error('期间销售已变化，请退回后按最新明细重新申请。');
      correctRebateBatch(id,req.amount,req.ref,req.recovery);
    }
    else f.batches.find(x=>x.id===id).logs.push({who:'finance',action:'退回调整申请',note:req.ref,date:f.date});
    req.status=b.dataset.correctionConfirm?'approved':'rejected';save();refreshCorrection(id);
  }catch(error){fundingFail(error)}
});
document.addEventListener('change',e=>{
  if(['saleCustomer','saleDate','saleKind','saleOriginal'].includes(e.target.id))syncSaleContractFields();
});
