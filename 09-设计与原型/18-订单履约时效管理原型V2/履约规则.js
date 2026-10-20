(function(root){
 'use strict';
 const HOUR=3600000;
 const REVIEW={id:'receiptReview',name:'回执审核',from:'回执单首次成功上传',to:'回执审核通过',value:24,warn:80,on:true};
 const ensureRules=rules=>rules.some(r=>r.id==='receiptReview')?rules:[...rules,{...REVIEW}];
 function review(shipment,decision,time,reason=''){
  if(!shipment||at(shipment.events?.firstReceiptUploadedAt)===null)throw Error('请先上传回执');
  if(!['approved','rejected'].includes(decision))throw Error('审核结果无效');
  if(shipment.receiptReview!=='待审核')throw Error('当前回执不在待审核状态');
  if(at(time)===null||at(time)<at(shipment.receipts?.at(-1)?.uploadedAt||shipment.events.firstReceiptUploadedAt))throw Error('审核时间不能早于上传时间');
  if(decision==='rejected'&&!reason.trim())throw Error('请填写驳回原因');
  const next=clone(shipment);next.receiptReview=decision==='approved'?'审核通过':'已驳回';
  next.events.receiptApprovedAt=decision==='approved'?time:null;
  next.reviewHistory=[...(next.reviewHistory||[]),{decision,time,reason:reason.trim()}];return next;
 }
 const at=v=>v===null||v===undefined||v===''?null:Number.isFinite(+v)&&typeof v==='number'?v:Number.isFinite(Date.parse(v))?Date.parse(v):null;
 const clone=v=>JSON.parse(JSON.stringify(v));
 function normalize(events={}){
  const e={...events};
  if(at(e.firstReceiptUploadedAt)!==null)e.receiptUploadedAt=e.firstReceiptUploadedAt;
  else if(at(e.receiptUploadedAt)!==null)e.firstReceiptUploadedAt=e.receiptUploadedAt;
  if(at(e.signedAt)===null&&at(e.receiptUploadedAt)!==null){e.signedAt=e.receiptUploadedAt;e.signSource='回执确认';}
  if(at(e.wmsReceivedAt)!==null&&at(e.trackingCreatedAt)!==null&&e.trackingNumber)e.shippedAt=new Date(Math.max(at(e.wmsReceivedAt),at(e.trackingCreatedAt))).toISOString();
  else e.shippedAt=null;
  return e;
 }
 function canSync(e){return at(e.financeApprovedAt)!==null&&at(e.factoryAcceptedAt)!==null;}
 function upload(shipment,time,file){
  if(at(time)===null)throw Error('上传时间无效');
  if(!file||!file.name)throw Error('请选择回执文件');
  const next=clone(shipment),e=next.events||{};
  if(!shipment.receiptOnly&&at(e.wmsOutboundAt)===null)throw Error('尚无出库记录，不能上传收货回执');
  if(!shipment.receiptOnly&&at(time)<at(e.wmsOutboundAt))throw Error('上传时间不能早于出库时间');
  e.firstReceiptUploadedAt=e.firstReceiptUploadedAt||e.receiptUploadedAt||time;
  e.receiptUploadedAt=e.firstReceiptUploadedAt;
  e.receiptApprovedAt=null;next.events=normalize(e);next.receiptReview='待审核';
  next.receipts=[...(next.receipts||[]),{...file,uploadedAt:time}];
  return next;
 }
 function stage(order,shipment,id,now=Date.now()){
  const e=normalize({...order.events,...shipment?.events}),r=ensureRules(order.rules).find(r=>r.id===id);
  if(!r)return {id,state:'awaiting',reason:'规则待补充'};
  if(['receipt','receiptReview'].includes(id)&&order.receiptRequired===false)return {id,state:'skipped',reason:'无需回执'};
  const edge={finance:['submittedAt','financeApprovedAt'],accept:['submittedAt','factoryAcceptedAt'],ship:['factoryAcceptedAt','shippedAt'],pickup:['wmsReceivedAt','wmsOutboundAt'],sign:['wmsOutboundAt','signedAt'],receipt:['signedAt','firstReceiptUploadedAt'],receiptReview:['firstReceiptUploadedAt','receiptApprovedAt']}[id];
  const start=at(e[edge[0]]),end=at(e[edge[1]]);
  if(start===null)return {id,state:'awaiting',reason:'起算记录待同步'};
  let hours=Number(r.value);
  if(id==='ship'&&order.type!=='system'){
   if(!['stock','noStock'].includes(order.stock))return {id,state:'awaiting',reason:'接单有货状态待同步'};
   const values=(shipment?.lines||order.lines||[]).map(l=>Number(l[order.stock]??order.lines?.find(original=>original.key===l.key)?.[order.stock]));
   if(!values.length||values.some(v=>!Number.isFinite(v)||v<=0))return {id,state:'awaiting',reason:'商品时效待同步'};
   hours=Math.min(...values);
  }
  const rule=order.customerRule;
  const deadline=order.type==='system'&&!['receipt','receiptReview'].includes(id)?at(order.arrival)===null||!rule?null:at(order.arrival)-(id==='sign'?0:Number(rule[id])*HOUR):start+(order.type==='system'&&id==='receipt'?Number(rule?.receipt):hours)*HOUR;
  if(!Number.isFinite(deadline))return {id,state:'awaiting',reason:'截止时间待补充'};
  const warning=order.type==='system'&&id!=='receiptReview'?Math.max(start,deadline-Number(rule.warning)*HOUR):start+hours*HOUR*Number(r.warn)/100;
  return {id,start,end,deadline,warning,signSource:e.signSource||'物流回传',elapsed:((end??now)-start)/HOUR,state:end!==null?(end<=deadline?'completed':'completedLate'):!r.on?'paused':now>=deadline?'overdue':now>=warning?'warning':'normal'};
 }
 function validateLinks(order,shipments){
  const totals=new Map((order.lines||[]).map(l=>[l.key,Number(l.qty)])),allocated=new Map();
  for(const s of shipments){
   if(!s.id)throw Error('发货单号必填');
   for(const l of s.lines||[]){if(l.orderId!==order.id)continue;if(!totals.has(l.key)||!(l.qty>0))throw Error('商品或关联数量无效');allocated.set(l.key,(allocated.get(l.key)||0)+Number(l.qty));}
  }
  for(const [key,qty] of allocated)if(qty>totals.get(key))throw Error('发货单关联数量超过原订单数量');
  return [...totals].every(([key,qty])=>allocated.get(key)===qty);
 }
 function plan(order,acceptedAt){
  const accepted=at(acceptedAt),result={};if(accepted===null)throw Error('接单时间无效');
  if(!['stock','noStock'].includes(order.stock))throw Error('请选择整单库存状态');
  const values=(order.lines||[]).map(l=>Number(l[order.stock]));
  if(!values.length||values.some(v=>!Number.isFinite(v)||v<=0))throw Error('商品时效缺失，请先维护商品时效');
  const e=normalize(order.events||{}),rule=order.customerRule;
  for(const id of ['finance','accept','ship','pickup','sign','receipt','receiptReview']){
   const r=ensureRules(order.rules).find(r=>r.id===id);if(!r)throw Error('节点规则缺失');
   const actual=at(e[{finance:'financeApprovedAt',accept:'factoryAcceptedAt',ship:'shippedAt',pickup:'wmsOutboundAt',sign:'signedAt',receipt:'firstReceiptUploadedAt',receiptReview:'receiptApprovedAt'}[id]]);
   let deadline=null;
   if(order.type==='system'&&!['receipt','receiptReview'].includes(id)){
    const offset=Number(id==='sign'?0:rule?.[id]);if(at(order.arrival)!==null&&Number.isFinite(offset))deadline=at(order.arrival)-offset*HOUR;
   }else if(id==='finance')deadline=at(e.submittedAt)===null?null:at(e.submittedAt)+Number(r.value)*HOUR;
   else if(id==='accept')deadline=at(e.submittedAt)===null?null:at(e.submittedAt)+Number(r.value)*HOUR;
   else {
    const start=id==='receiptReview'?at(e.firstReceiptUploadedAt)??result.receipt?.estimated:id==='ship'?accepted:id==='pickup'?at(e.wmsReceivedAt)??result.ship?.estimated:id==='sign'?at(e.wmsOutboundAt)??result.pickup?.estimated:at(e.signedAt)??result.sign?.estimated;
    const hours=id==='ship'?Math.min(...values):id==='receipt'&&order.type==='system'?Number(rule?.receipt):Number(r.value);
    if(start!==null&&start!==undefined&&Number.isFinite(hours))deadline=start+hours*HOUR;
   }
   const skip=['receipt','receiptReview'].includes(id)&&order.receiptRequired===false;
   result[id]={deadline:skip?null:deadline,actual:id==='accept'?accepted:actual,estimated:skip?null:id==='accept'?accepted:actual??deadline,skipped:skip};
  }
  return result;
 }
 const api={ensureRules,review,at,normalize,canSync,upload,stage,validateLinks,plan};
 root.Fulfillment=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
