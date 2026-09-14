/* Presentation only: estimates never write back actual fulfillment events. */
(() => {
 const originalOverview=boardOverview, originalInfo=clarityOrderInfo;
 boardOverview=function(){
  const root=document.createElement('div');root.innerHTML=originalOverview();
  const stages=root.querySelector('.clarity-stages');if(!stages)return root.innerHTML;
  stages.classList.add('workflow-five');
  const heading=root.querySelector('.clarity-node-heading');
  if(heading)heading.innerHTML='<div><div class="workflow-eyebrow">FULFILLMENT WORKFLOW</div><h3>按履约步骤查看</h3><p>从接单到回执，沿着订单前进的方向，定位每一步待办。</p></div><div class="workflow-guide">① — ⑥ 履约顺序<br><span>点击步骤筛选订单</span></div>';
  const finance=stages.querySelector('[data-node-card="finance"]');
  if(finance){const count=finance.querySelector('.stage-total')?.textContent||'';const bar=document.createElement('div');bar.className='workflow-finance';bar.innerHTML='<button class="btn" data-node-card="finance" aria-pressed="false" onclick="openNode(\'finance\')">财务审核 · '+safe(count)+'</button><span>与接单并行；财务审核通过且工厂接单后，方可同步旺店通。</span>';stages.after(bar);finance.remove();}
  const labels={accept:['接单','工厂确认订单'],ship:['发货','备货并生成物流单号'],pickup:['揽收','仓库完成出库'],sign:['签收','客户确认收货'],receipt:['回执上传','上传收货凭证'],receiptReview:['回执审核','核验回执并审核通过']};
  [...stages.children].forEach((card,i)=>{
   const label=labels[card.dataset.nodeCard];if(!label)return;
   card.querySelector('.stage-top').innerHTML='<div class="workflow-step-title"><span class="workflow-number">'+String(i+1).padStart(2,'0')+'</span><b>'+label[0]+'</b></div><p>'+label[1]+'</p>';
   card.querySelector('.segments')?.remove();
   const counts=card.querySelector('.clarity-counts');if(counts){const late=counts.querySelector('.overdue'),warning=counts.querySelector('.warning');if(warning)counts.prepend(warning);if(late)counts.prepend(late);}
  });
  return root.innerHTML;
 };
 function estimate(x,p){
  const now=Date.now(),hour=3600000,id=x.r.id,nextId={finance:'ship',accept:'ship',ship:'pickup',pickup:'sign',sign:'receipt',receipt:'receiptReview'}[id];
  const current=x.localStage?.deadline??x.sla?.at??(x.level==='awaiting'?null:now+(Number(x.r.value)-Number(x.o[4]))*hour);
  const remaining=t=>t==null?'待补充计时信息':t<=now?'已超时 '+duration((now-t)/hour):'剩余 '+duration((t-now)/hour);
  const box=(label,value,sub,tone='')=>'<div class="flow-time '+tone+'" title="'+safe(sub||'')+'"><span>'+safe(label)+'</span><strong>'+safe(value)+'</strong><small>'+safe(sub||'')+'</small></div>';
  let html=box('当前 · '+x.r.name,remaining(current),current==null?'起算记录或时效待同步':'截止 '+kaDate(current),current!=null&&current<=now?'late':'');
  if(!nextId)return html+box('后续流程','回执审核通过后完成','回执审核独立处理，不重置首次上传时间');
  const next=config.rules.find(r=>r.id===nextId);if(!next)return html;
  let start=current==null||current<=now?null:current,end=null,source='按本节点按时完成推算，非实际承诺';
  if(id==='finance'){
   const accepted=boardTime(p.events?.factoryAcceptedAt),acceptTask=x.tasks?.find(t=>t.r.id==='accept');
   start=accepted??(acceptTask?now+(Number(acceptTask.r.value)-Number(acceptTask.o[4]))*hour:null);
   if(start!==null&&start<=now&&accepted===null)start=null;
   source='发货计时从工厂接单开始；同步还需财务通过';
  }
  let local;try{local=JSON.parse(localStorage.getItem('oms-fulfillment-v2')||'{}').orders?.[x.o[0]];}catch(e){}
  if(x.client?.type==='system'&&nextId!=='receiptReview'){
   try{const data=JSON.parse(localStorage.getItem('shipping-customer-arrival-v1')||'{}'),rule=p.ruleSnapshot?.rule||customerTimingRule(x.client,data),arrival=boardTime(p.customerRequiredArrivalAt);end=nextId==='receipt'?(start===null?null:start+Number(rule.receipt)*hour):(arrival===null?null:arrival-Number(nextId==='sign'?0:rule[nextId])*hour);source='按客户交期倒排；预计开始不代表实际完成';}catch(e){}
  }else if(nextId==='ship'){
   const stock=local?.stock||p.stock,lines=local?.lines||p.products||[],values=lines.map(l=>Number(l[stock]));
   if(start!==null&&['stock','noStock'].includes(stock)&&values.length&&values.every(v=>Number.isFinite(v)&&v>0))end=start+Math.min(...values)*hour;
   else source='接单时选择整单有货／无货后，按订单商品时效计算截止';
  }else if(start!==null)end=start+Number(next.value)*hour;
  const startText=start===null?'开始时间待确定':start<=now?'已到预计开始时间':'预计 '+duration((start-now)/hour)+' 后开始';
  html+=box('下一步 · '+next.name,startText,start===null?'当前节点超时或资料缺失，不顺延计划':kaDate(start));
  html+=box(next.name+'预计完成',end===null?'截止时间待确定':remaining(end),end===null?source:'预计截止 '+kaDate(end),end!==null&&end<=now?'late':'');
  return html+'<p class="flow-time-note">'+safe(source)+(id==='accept'?'；可开始发货计时，但须财务通过后才可同步旺店通。':'')+'</p>';
 }
 clarityOrderInfo=function(x,p){return originalInfo(x,p)+'<div class="order-flow-times">'+estimate(x,p||{})+'</div>';};
 const originalOpen=openOrder;
 openOrder=function(id){
  originalOpen(id);
  const target=document.getElementById('orderDetail');if(!target)return;
  target.querySelector('.order-journey')?.remove();
  [...target.querySelectorAll('.section-title')].filter(e=>e.textContent.includes('订单待办节点')).forEach(e=>e.remove());
  const p=omsProfiles[id]||{};let saved;
  try{saved=JSON.parse(localStorage.getItem('oms-fulfillment-v2')||'{}').orders?.[id];}catch(e){}
  const e=Fulfillment.normalize({...p.events,...saved?.events}),rules=Fulfillment.ensureRules(saved?.rules||config.rules),now=Date.now(),H=3600000;
  const row=boardRows('all').find(x=>x.o[0]===id),tasks=row?.tasks||records().filter(x=>x.o[0]===id);
  const ends={finance:'financeApprovedAt',accept:'factoryAcceptedAt',ship:'shippedAt',pickup:'wmsOutboundAt',sign:'signedAt',receipt:'firstReceiptUploadedAt',receiptReview:'receiptApprovedAt'};
  const starts={finance:'submittedAt',accept:'submittedAt',ship:'factoryAcceptedAt',pickup:'wmsReceivedAt',sign:'wmsOutboundAt',receipt:'signedAt',receiptReview:'firstReceiptUploadedAt'};
  const estimates={},cards={};let customerRule;
  if(row?.client?.type==='system')try{customerRule=p.ruleSnapshot?.rule||customerTimingRule(row.client,JSON.parse(localStorage.getItem('shipping-customer-arrival-v1')||'{}'));}catch(error){}
  const time=t=>t===null?'待同步':kaDate(t);
  rules.forEach(r=>{
   const task=tasks.find(t=>t.r.id===r.id),actual=boardTime(e[ends[r.id]]),actualStart=boardTime(e[starts[r.id]]);
   let start=actualStart,deadline=null,basis='按订单节点时限推算';
   if(start===null){
    if(['finance','accept'].includes(r.id))start=boardTime(e.submittedAt)||boardTime(p.createdAt);
    else {const previous={ship:'accept',pickup:'ship',sign:'pickup',receipt:'sign',receiptReview:'receipt'}[r.id];start=boardTime(e[ends[previous]])??estimates[previous]??null;basis='以上一步预计完成时间推算';}
   }
   let hours=Number(r.value);
   if(r.id==='ship'){
    const stock=saved?.stock||p.stock,lines=saved?.lines||p.products||[],values=lines.map(l=>Number(l[stock]));
    hours=['stock','noStock'].includes(stock)&&values.length&&values.every(v=>Number.isFinite(v)&&v>0)?Math.min(...values):null;
    basis=hours===null?'待接单库存选择及商品时效同步':'按接单有货／无货商品时效推算';
   }
   if(start!==null&&hours!==null)deadline=start+hours*H;
   if(task&&!customerRule&&task.level!=='awaiting'&&Number.isFinite(Number(task.o[4]))){deadline=task.localStage?.deadline??now+(Number(task.r.value)-Number(task.o[4]))*H;basis='按当前节点已用时及保存时限计算';}
   if(customerRule&&r.id!=='receiptReview'){const arrival=boardTime(p.customerRequiredArrivalAt);deadline=r.id==='receipt'?(start===null?null:start+Number(customerRule.receipt)*H):(arrival===null?null:arrival-Number(r.id==='sign'?0:customerRule[r.id])*H);basis=r.id==='receipt'?'签收后按客户回执时限计算':'按客户要求到货时间倒排';}
   if(!Number.isFinite(deadline))deadline=null;
   if(saved?.plan?.[r.id]){deadline=saved.plan[r.id].deadline;basis='按接单时保存的计划展示';}
   estimates[r.id]=deadline;
   const skip=['receipt','receiptReview'].includes(r.id)&&(saved?.receiptRequired??p.receiptRequired)===false;
   const running=actualStart!==null||!!(task&&task.level!=='awaiting');
   const status=skip?'无需回执':actual!==null?'已完成':running?'进行中':'待开始';
   const late=!skip&&deadline!==null&&(actual??now)>deadline&&(actual!==null||running);
   cards[r.id]='<article class="detail-flow-node '+(actual!==null?'done':running?'active':'')+'"><header><b>'+safe(r.name)+'</b><span class="badge '+(skip?'gray':late?'red':actual!==null?'green':running?'':'gray')+'">'+(late?(actual!==null?'超时完成':'已超时'):status)+'</span></header><dl><dt>预计完成</dt><dd>'+safe(skip?'不考核':deadline===null?'待确定':time(deadline))+'</dd><dt>实际完成</dt><dd class="actual">'+safe(actual!==null?time(actual):skip?'—':'尚无完成记录')+'</dd></dl><p>'+safe(skip?'不计入回执时效':actual!==null?'完成时间来源：'+(r.id==='sign'?(e.signSource||'物流回传'):r.id==='receipt'?'首次成功上传':'业务事件'):running&&deadline!==null?(deadline<=now?'已超时 '+duration((now-deadline)/H):'剩余 '+duration((deadline-now)/H)):basis)+'</p></article>';
  });
  const section=document.createElement('section');section.className='detail-fulfillment';
  section.innerHTML='<div class="detail-flow-title"><h3>履约时效流程</h3><span>预计时间用于安排进度，实际时间以业务记录为准</span></div><div class="detail-flow-track"><div class="detail-flow-parallel"><small>并行处理 · 两项完成后可同步旺店通</small>'+cards.finance+cards.accept+'</div>'+['ship','pickup','sign','receipt','receiptReview'].map(id=>'<span class="detail-flow-arrow" aria-hidden="true">→</span>'+cards[id]).join('')+'</div><p class="detail-flow-caption">发货从工厂接单开始计时；拆合单不重置起点。分批履约的实际完成时间需结合关联发货单查看，未取得整单完成记录时不提前标记完成。</p>';
  target.querySelector('.dialog-head')?.after(section);
 };
 render();
})();
