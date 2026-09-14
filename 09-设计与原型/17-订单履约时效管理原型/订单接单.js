(() => {
 const H=3600000,read=k=>JSON.parse(localStorage.getItem(k)||'{}');
 let filter='pending',query='',active=null,selection='',lines=[],snapshot={};
 const saved=id=>read('oms-fulfillment-v2').orders?.[id];
 const accepted=id=>saved(id)?.events?.factoryAcceptedAt||omsProfiles[id]?.events?.factoryAcceptedAt;
 const nav=document.getElementById('navAcceptance');
 const previousRender=render;
 render=function(){previousRender();if(location.hash==='#accept')renderAcceptance();};
 function renderAcceptance(){
  document.querySelector('.page-head h1').textContent='订单接单列表';document.querySelector('.page-head p').textContent='整单选择有货或无货，预览后续计划，再确认接单。';
  document.querySelectorAll('.sla-nav-item').forEach(a=>{a.classList.toggle('active',a===nav);a.removeAttribute('aria-current');});nav.setAttribute('aria-current','page');
  const rows=Object.entries(omsProfiles).filter(([id,p])=>(filter==='all'||(filter==='accepted')===!!accepted(id))&&(!query||(id+' '+(p.customer||'')+' '+p.products.map(v=>v.name).join(' ')).includes(query)));
  const timingPriority={system:0,negotiated:1,default:2};
  const timingRank=id=>{const o=getOrderAcceptanceContext(id),mode=o.timingMode||(o.type==='system'?'system':o.arrival?'negotiated':'default');return timingPriority[mode]??2;};
  const acceptanceHead='<div class="oms-column-head acceptance-column-head"><div>商品信息</div><div>单价 / 数量</div><div>应付金额</div><div>买家 / 收货人</div><div>客户名称</div><div>时效类型</div><div>接单状态</div><div>操作</div></div>';
  rows.sort(([a],[b])=>timingRank(a)-timingRank(b));
  const body=rows.map(([id,p])=>{
   const o=getOrderAcceptanceContext(id),row=Object.values(nodeOrders).flat().find(v=>v[0]===id),mode=o.timingMode||(o.type==='system'?'system':o.arrival?'negotiated':'default');
   const label={default:'系统默认时效',system:'系统客户时效',negotiated:'磋商时效'}[mode],state=o.negotiation?.status==='rejected'?'<small class="negotiation-rejected">待线下磋商</small>':o.negotiation?.status==='resolved'?'<small class="negotiation-resolved">已更新到货时间</small>':'';
   let actions='<button class="btn primary" onclick="showAcceptance(\''+safe(id)+'\',\'accept\')">工厂接单</button>';
   if(accepted(id))actions='<button class="btn" onclick="openOrder(\''+safe(id)+'\')">查看节点</button>';
   else if(mode==='negotiated'&&o.negotiation?.status==='rejected')actions='<button class="btn negotiation-upload" onclick="showAcceptance(\''+safe(id)+'\',\'resolve\')">客服上传磋商结果</button>';
   else if(mode==='negotiated'&&o.negotiation?.status!=='resolved')actions+='<button class="btn negotiation-reject" onclick="showAcceptance(\''+safe(id)+'\',\'reject\')">拒绝接单</button>';
   const card=document.createElement('div');
   const record=boardRows('all').find(v=>v.o[0]===id)||{o:row||[id,p.customer||'',p.due,'',0],r:config.rules.find(r=>r.id==='accept'),level:'normal'};
   card.innerHTML=omsOrderCard(record,false);
   card.querySelector('.oms-order').dataset.acceptanceOrder=id;
   card.querySelector('.oms-order-head .sla-clock')?.remove();
   card.querySelector('.oms-order-head .oms-node-tag')?.remove();
   card.querySelector('.oms-order-head > .timing-mode')?.remove();
   const status=card.querySelector('.oms-order-body > div:nth-last-child(2)');
   const timingCell=document.createElement('div');timingCell.className='acceptance-timing-cell';timingCell.innerHTML='<span class="timing-mode '+mode+'">'+label+'</span>';status.before(timingCell);
   status.innerHTML='<div class="oms-status-row"><span class="badge '+(accepted(id)?'green':'gray')+'">'+(accepted(id)?safe(({stock:'有货发货',noStock:'无货发货'})[o.stock]||'已接单'):'待接单')+'</span></div>'+(accepted(id)?'<div class="order-sub">接单时间：<br>'+safe(kaDate(accepted(id)))+'</div>':'')+state;
   card.querySelector('.oms-actions').innerHTML='<div class="acceptance-row-actions">'+actions+'</div>';
   return card.innerHTML;
  }).join('');
  document.getElementById('content').innerHTML='<section class="acceptance-panel"><div class="acceptance-toolbar"><div class="filter-tabs">'+[['pending','待接单'],['accepted','已接单'],['all','全部']].map(([key,label])=>'<button class="'+(key===filter?'active':'')+'" onclick="acceptanceFilter(\''+key+'\')">'+label+'</button>').join('')+'</div><form onsubmit="acceptanceSearch(event)"><input name="query" value="'+safe(query)+'" placeholder="搜索订单号 / 商品"><button class="btn">查询</button></form></div><div class="timing-demo-guide"><div><b>可操作时效案例</b><span>系统客户：待接单、已接单</span><span>磋商时效：待接单、待磋商、已完成磋商、已接单</span></div><button class="btn" onclick="resetTimingDemoCases()">重置演示案例</button></div><div class="timing-mode-legend"><span><b>系统默认时效</b> 内部时效流程</span><span><b>系统客户时效</b> 必须接单</span><span><b>磋商时效</b> 可拒绝并协商到货时间</span></div><div class="oms-order-scroll clarity-order-list acceptance-order-cards">'+acceptanceHead+body+''+(rows.length?'':'<p class="empty-orders">暂无符合条件的订单</p>')+'</div></section>';
 }
 window.acceptanceFilter=v=>{filter=v;render();};window.acceptanceSearch=e=>{e.preventDefault();query=e.target.elements.query.value.trim();render();};
 window.showAcceptance=(id,intent='accept')=>{
  active=id;selection='';const p=omsProfiles[id];
  const plans=p.productRuleSnapshot?.plans||read('shipping-product-schemes-v1').plans||[];
  lines=p.products.map((v,i)=>{const plan=plans.find(s=>s.enabled&&s.skus.includes(String(v.sku).toUpperCase()));return {key:String(i),sku:v.sku,qty:Number(v.qty)+Number(v.giftQty||0),stock:Number(v.stock??plan?.stock??24),noStock:Number(v.noStock??plan?.noStock??72)};});
  const row=boardRows('all').find(x=>x.o[0]===id),context=getOrderAcceptanceContext(id),type=row?.client?.type==='system'?'system':context.type||row?.client?.type||'standard';
  snapshot={type,timingMode:context.timingMode||(type==='system'?'system':context.arrival||p.customerRequiredArrivalAt?'negotiated':'default'),arrival:context.arrival||p.customerRequiredArrivalAt,negotiation:context.negotiation};
  if(snapshot.type==='system')snapshot.customerRule=p.ruleSnapshot?.rule||customerTimingRule(row.client,read('shipping-customer-arrival-v1'));
  let d=document.getElementById('acceptanceDialog');if(!d){d=document.createElement('dialog');d.id='acceptanceDialog';d.className='acceptance-dialog';document.body.append(d);}
  const modeLabel={default:'系统默认时效',system:'系统客户时效',negotiated:'磋商时效'}[snapshot.timingMode],modeText=snapshot.timingMode==='system'?'系统客户订单不可拒绝，必须按照客户要求到货时间履约。':snapshot.timingMode==='negotiated'?'普通客户填写了到货时间；工厂可接单，也可拒绝后线下磋商。':'按内部配置的商品和履约节点时效执行。';
  const rejected=snapshot.timingMode==='negotiated'&&snapshot.negotiation?.status==='rejected';
  const productTable='<div class="acceptance-product-hours"><table class="acceptance-product-table"><caption>商品发货明细（共 '+lines.length+' 项）</caption><thead><tr><th>序号</th><th>商品名称</th><th>商品编码</th><th>数量（含赠品）</th><th>有货时限</th><th>无货时限</th></tr></thead><tbody>'+lines.map((l,i)=>'<tr><td>'+(i+1)+'</td><td>'+safe(p.products[i].name)+'</td><td>'+safe(l.sku||'—')+'</td><td>'+safe(l.qty)+'</td><td><b>'+l.stock+' 小时</b></td><td><b>'+l.noStock+' 小时</b></td></tr>').join('')+'</tbody></table></div>';
  const choices='<div class="acceptance-choice-title"><b>选择接单方式</b><span>有货、无货将展示对应的预测节点时效</span></div><div class="acceptance-choice-grid"><button class="acceptance-choice" data-choice="stock" onclick="chooseAcceptance(\'stock\')"><i></i><b>有货发货</b><small>按有货时效预测履约节点</small></button><button class="acceptance-choice" data-choice="noStock" onclick="chooseAcceptance(\'noStock\')"><i></i><b>无货发货</b><small>按无货时效预测履约节点</small></button>'+(snapshot.timingMode==='negotiated'?'<button class="acceptance-choice reject" data-choice="reject" onclick="chooseAcceptance(\'reject\')"><i></i><b>'+(snapshot.negotiation?.status==='resolved'?'继续拒接':'拒接')+'</b><small>填写原因后进入磋商</small></button>':'')+'</div><div id="acceptancePreview" class="acceptance-preview-empty">请选择接单方式查看后续节点预测</div><div class="acceptance-decision-buttons"><button id="confirmAcceptance" class="btn primary" disabled onclick="confirmAcceptance()">确认接单</button></div>';
  const content=rejected?negotiationEditor():productTable+choices;
  d.innerHTML='<div class="dialog-head"><h2>'+(rejected?'客服上传磋商结果':'工厂接单')+'</h2><button class="btn" onclick="document.getElementById(\'acceptanceDialog\').close()">关闭</button></div><div class="acceptance-order-ref"><span>订单编号</span><b>'+safe(id)+'</b></div><div class="acceptance-mode-banner '+snapshot.timingMode+'"><b>'+modeLabel+'</b><span>'+modeText+'</span>'+(snapshot.arrival?'<small>'+(snapshot.negotiation?.status==='resolved'?'变更后':'当前')+'要求到货：'+safe(kaDate(snapshot.arrival))+'</small>':'')+'</div>'+content+'<p id="acceptanceError" class="error" role="alert"></p>';if(!d.open)d.showModal();if(intent==='reject'&&!rejected)setTimeout(()=>chooseAcceptance('reject'));if(intent==='resolve')setTimeout(()=>document.getElementById('negotiatedArrival')?.focus());
 };
 window.chooseAcceptance=choice=>{selection=choice;document.querySelectorAll('.acceptance-choice').forEach(el=>el.classList.toggle('selected',el.dataset.choice===choice));const preview=document.getElementById('acceptancePreview'),confirm=document.getElementById('confirmAcceptance');document.getElementById('acceptanceError').textContent='';confirm.disabled=false;if(choice==='reject'){preview.className='acceptance-reject-panel';preview.innerHTML='<label class="negotiation-reason">'+(snapshot.negotiation?.status==='resolved'?'继续拒接原因':'拒接原因')+'<input id="negotiationReason" maxlength="300" placeholder="请填写无法按客户时间履约的具体原因"></label>';confirm.textContent=snapshot.negotiation?.status==='resolved'?'确认继续拒接':'确认拒接';confirm.className='btn danger';setTimeout(()=>document.getElementById('negotiationReason')?.focus());return}confirm.textContent='确认接单';confirm.className='btn primary';preview.className='';previewAcceptance(choice);};
 function negotiationEditor(){return '<section class="negotiation-editor"><b>待线下磋商</b><p>拒绝原因：'+safe(snapshot.negotiation?.reason||'—')+'</p><label>协商后的客户要求到货时间<input id="negotiatedArrival" type="datetime-local"></label><label>本次磋商凭证<input id="negotiatedEvidence" type="file" accept=".png,.jpg,.jpeg,.pdf"></label><button class="btn primary" onclick="saveNegotiation()">保存磋商结果，再次接单</button></section>'}
 window.previewAcceptance=stock=>{
  selection=stock;const now=Date.now(),p=omsProfiles[active],context=getOrderAcceptanceContext(active),rules=context.rules,times={},shipHours=Math.min(...lines.map(l=>l[stock]));
  const plan=Fulfillment.plan({...context,...snapshot,stock,lines,events:{...context.events,submittedAt:context.events.submittedAt||boardTime(p.createdAt)}},now);
  rules.forEach(r=>{times[r.id]=plan[r.id].estimated;});
  const arrival=Fulfillment.at(snapshot.arrival),sign=Fulfillment.at(times.sign),check=snapshot.timingMode==='negotiated'&&arrival!==null?'<p class="negotiated-result '+(sign!==null&&sign<=arrival?'ok':'risk')+'">协商到货校验：预计签收 '+(sign===null?'待确定':safe(kaDate(sign)))+'；客户要求 '+safe(kaDate(arrival))+' · '+(sign!==null&&sign<=arrival?'可以按期完成':'预计无法按期完成，建议拒绝并继续磋商')+'</p>':'';
  document.getElementById('acceptancePreview').innerHTML='<p class="note">'+(snapshot.type==='system'?'系统客户仍按要求到货时间倒排，库存选择不覆盖客户交期。':snapshot.timingMode==='negotiated'?'磋商时效按内部节点推算，并校验能否满足协商后的到货时间。':'所选商品发货时限：'+shipHours+' 小时。后续节点按上一步预计完成时间推算。')+'</p>'+check+'<div class="acceptance-product-hours"><table class="acceptance-product-table"><caption>商品发货明细（共 '+lines.length+' 项）</caption><thead><tr><th scope="col">序号</th><th scope="col">商品名称</th><th scope="col">商品编码</th><th scope="col">数量（含赠品）</th><th scope="col">'+(stock==='stock'?'有货':'无货')+'发货时限</th></tr></thead><tbody>'+lines.map((l,i)=>'<tr><td>'+(i+1)+'</td><td>'+safe(p.products[i].name)+'</td><td>'+safe(l.sku||'—')+'</td><td>'+safe(l.qty)+'</td><td><b>'+l[stock]+' 小时</b></td></tr>').join('')+'</tbody></table></div><div class="acceptance-plan">'+rules.map(r=>'<div><small>'+safe(r.name)+(r.id==='finance'||r.id==='accept'?' · 并行':'')+'</small><b>'+safe(times[r.id]===null?'待补充客户到货时间':kaDate(times[r.id]))+'</b><span>'+ (r.id==='accept'?'确认时完成接单':r.id==='finance'?(p.events?.financeApprovedAt?'已审核通过':'审核截止，不自动通过'):'预计完成')+'</span></div>').join('')+'</div><p class="sub">后续时间是计划，不是实际完成记录。未取得商品时效的展示数据沿用页面 24 / 72 小时默认值；多商品暂按最早时限预览。</p>';
  document.getElementById('confirmAcceptance').disabled=snapshot.timingMode==='negotiated'&&snapshot.negotiation?.status==='rejected';
 };
 window.rejectAcceptance=()=>{try{const reason=document.getElementById('negotiationReason').value.trim();rejectNegotiatedOrderLocally(active,reason);showAcceptance(active);document.getElementById('acceptanceError').textContent='已拒绝接单，请线下沟通后填写新的到货时间并上传凭证。';}catch(e){document.getElementById('acceptanceError').textContent=e.message;}};
 function readNegotiationEvidence(file){return new Promise((resolve,reject)=>{if(!file){reject(Error('请上传本次磋商的聊天记录或其他凭证。'));return}if(!/\.(png|jpe?g|pdf)$/i.test(file.name)||!file.size||file.size>2*1024*1024){reject(Error('磋商凭证仅支持不超过 2MB 的 PNG、JPG 或 PDF。'));return}const reader=new FileReader();reader.onload=()=>resolve({name:file.name,type:file.type,size:file.size,data:reader.result,uploadedAt:new Date().toISOString()});reader.onerror=()=>reject(Error('磋商凭证读取失败。'));reader.readAsDataURL(file)})}
 window.saveNegotiation=async()=>{try{const arrival=document.getElementById('negotiatedArrival').value,file=document.getElementById('negotiatedEvidence').files[0],evidence=await readNegotiationEvidence(file);resolveNegotiatedOrderLocally(active,arrival,evidence);showAcceptance(active);document.getElementById('acceptanceError').textContent='磋商结果已上传，等待工厂接单或继续拒接。';}catch(e){document.getElementById('acceptanceError').textContent=e.message;}};
 window.acceptWithStock=stock=>{try{selection=stock;acceptOrderLocally(active,stock,lines,snapshot);document.getElementById('acceptanceDialog').close();render();showToast((stock==='stock'?'有货发货':'无货发货')+'接单成功');}catch(e){document.getElementById('acceptanceError').textContent=e.message;}};
 window.confirmAcceptance=()=>{if(selection==='reject'){rejectAcceptance();return}try{if(!selection)throw Error('请先选择有货发货或无货发货。');acceptOrderLocally(active,selection,lines,snapshot);document.getElementById('acceptanceDialog').close();render();showToast('接单成功，销售可在订单列表查看发货及后续节点计划');}catch(e){document.getElementById('acceptanceError').textContent=e.message;}};
 const priorInfo=clarityOrderInfo;
 clarityOrderInfo=function(x,p){
  const local=saved(x.o[0]),profile=p||omsProfiles[x.o[0]]||{},context=getOrderAcceptanceContext(x.o[0]);
  const acceptedAt=Fulfillment.at(local?.events?.factoryAcceptedAt??profile.events?.factoryAcceptedAt);
  const acceptedStatus=(profile.statuses||[]).some(([name,value])=>name.includes('接单状态')&&value==='已接单');
  if(acceptedAt===null&&!acceptedStatus)return priorInfo(x,p);
  const o={...context,...local,id:x.o[0],rules:Fulfillment.ensureRules(local?.rules||context.rules),plan:local?.plan||{}};
  let fallbackPlan={};if(acceptedAt!==null)try{fallbackPlan=Fulfillment.plan(o,acceptedAt);}catch(e){}

  const db=read('oms-fulfillment-v2'),shipments=Object.values(db.shipments||{}).filter(s=>s.lines?.some(l=>l.orderId===o.id)),events=Fulfillment.normalize({...p?.events,...o.events});
  let covered=false;try{covered=shipments.length>0&&Fulfillment.validateLinks(o,shipments);}catch(e){}
  const ends={finance:'financeApprovedAt',accept:'factoryAcceptedAt',ship:'shippedAt',pickup:'wmsOutboundAt',sign:'signedAt',receipt:'firstReceiptUploadedAt',receiptReview:'receiptApprovedAt'};
  const steps=Fulfillment.ensureRules(o.rules).map(r=>{
   const item=o.plan[r.id]||fallbackPlan[r.id],skip=['receipt','receiptReview'].includes(r.id)&&o.receiptRequired===false;
   let actual=Fulfillment.at(events[ends[r.id]]);
   if(shipments.length&&!['finance','accept'].includes(r.id)){const times=shipments.map(s=>Fulfillment.at(Fulfillment.normalize(s.events)[ends[r.id]]));actual=covered&&times.every(t=>t!==null)?Math.max(...times):null;}
   const done=actual!==null||(r.id==='accept'&&acceptedStatus),state=skip?'无需回执':done?'实际':'预计',time=done?actual:item?.estimated,full=skip?'不考核':time==null?(done?'待同步':'待确定'):kaDate(time),short=full.replace(/^\d{4}\//,'').replace(/:\d{2}$/,'');
   return '<span class="sales-plan-item '+(skip?'is-skipped':done?'is-done':'is-pending')+'" title="'+safe(r.name+' · '+state+'：'+full)+'"><span>'+safe(r.name)+'</span><b>'+safe((skip?'':state+' ')+short)+'</b>'+(done&&!skip?'<em>✓ 已完成</em>':skip?'<em>不考核</em>':'')+'</span>';
  });
  const flow='<span class="sales-plan-parallel"><small>并行</small>'+steps.slice(0,2).join('<i class="sales-plan-parallel-divider"> / </i>')+'</span>'+steps.slice(2).map(step=>'<i class="sales-plan-arrow" aria-hidden="true">→</i>'+step).join('');
  return '<section class="sales-shipping-plan sales-plan-inline" aria-label="发货及履约计划"><b class="sales-plan-label" title="未完成节点显示预计时间；完成状态以实际履约记录为准">履约计划</b><div class="sales-plan-items">'+flow+'</div><button class="orders-toggle sales-plan-detail" onclick="openOrder(\''+safe(x.o[0])+'\')">详情 →</button></section>';
 };
 const priorCard=omsOrderCard;
 omsOrderCard=function(x,inDialog){
  const el=document.createElement('div');el.innerHTML=priorCard(x,inDialog);
  const id=x.o[0],o=getOrderAcceptanceContext(id),mode=o.timingMode||(o.type==='system'?'system':o.arrival?'negotiated':'default'),label={default:'系统默认时效',system:'系统客户时效',negotiated:'磋商时效'}[mode];
  el.querySelector('.oms-order-head')?.insertAdjacentHTML('beforeend','<span class="timing-mode '+mode+'">'+label+'</span>');
  el.querySelector('.sales-plan-label')?.insertAdjacentHTML('afterend','<span class="timing-mode '+mode+'" style="flex-shrink:0" aria-label="时效类型：'+label+'">'+label+'</span>');
  if(!inDialog&&saved(id)?.events.factoryAcceptedAt)el.querySelector('.oms-actions')?.insertAdjacentHTML('beforeend','<button class="orders-toggle" onclick="openOrder(\''+safe(id)+'\')">查看发货计划 →</button>');
  if(!inDialog&&group==='flow'&&selectedNode==='accept'&&!accepted(id)){
   let actions='<button class="btn primary" onclick="showAcceptance(\''+safe(id)+'\',\'accept\')">工厂接单</button>';
   if(mode==='negotiated'&&o.negotiation?.status==='rejected')actions='<button class="btn negotiation-upload" onclick="showAcceptance(\''+safe(id)+'\',\'resolve\')">上传磋商结果</button>';
   else if(mode==='negotiated'&&o.negotiation?.status!=='resolved')actions+='<button class="btn negotiation-reject" onclick="showAcceptance(\''+safe(id)+'\',\'reject\')">拒绝接单</button>';
   el.querySelector('.oms-actions')?.insertAdjacentHTML('beforeend','<div class="overview-accept-actions"><span>接单操作</span>'+actions+'</div>');
  }
  return el.innerHTML;
 };
 render();
})();
