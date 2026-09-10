(function(root){
 'use strict';
 const HOUR=3600000;
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
  if(at(e.wmsOutboundAt)===null)throw Error('尚无出库记录，不能上传收货回执');
  if(at(time)<at(e.wmsOutboundAt))throw Error('上传时间不能早于出库时间');
  e.firstReceiptUploadedAt=e.firstReceiptUploadedAt||e.receiptUploadedAt||time;
  e.receiptUploadedAt=e.firstReceiptUploadedAt;
  next.events=normalize(e);next.receiptReview='待审核';
  next.receipts=[...(next.receipts||[]),{...file,uploadedAt:time}];
  return next;
 }
 function stage(order,shipment,id,now=Date.now()){
  const e=normalize({...order.events,...shipment?.events}),r=order.rules.find(r=>r.id===id);
  if(!r)return {id,state:'awaiting',reason:'规则待补充'};
  if(id==='receipt'&&order.receiptRequired===false)return {id,state:'skipped',reason:'无需回执'};
  const edge={finance:['submittedAt','financeApprovedAt'],accept:['submittedAt','factoryAcceptedAt'],ship:['factoryAcceptedAt','shippedAt'],pickup:['wmsReceivedAt','wmsOutboundAt'],sign:['wmsOutboundAt','signedAt'],receipt:['signedAt','firstReceiptUploadedAt']}[id];
  const start=at(e[edge[0]]),end=at(e[edge[1]]);
  if(start===null)return {id,state:'awaiting',reason:'起算记录待同步'};
  let hours=Number(r.value);
  if(id==='ship'&&order.type!=='system'){
   if(!['stock','noStock'].includes(order.stock))return {id,state:'awaiting',reason:'接单有货状态待同步'};
   const values=(shipment?.lines||order.lines||[]).map(l=>Number(l[order.stock]));
   if(!values.length||values.some(v=>!Number.isFinite(v)||v<=0))return {id,state:'awaiting',reason:'商品时效待同步'};
   hours=Math.min(...values);
  }
  const rule=order.customerRule;
  const deadline=order.type==='system'&&id!=='receipt'?at(order.arrival)===null||!rule?null:at(order.arrival)-(id==='sign'?0:Number(rule[id])*HOUR):start+(order.type==='system'&&id==='receipt'?Number(rule?.receipt):hours)*HOUR;
  if(!Number.isFinite(deadline))return {id,state:'awaiting',reason:'截止时间待补充'};
  const warning=order.type==='system'?Math.max(start,deadline-Number(rule.warning)*HOUR):start+hours*HOUR*Number(r.warn)/100;
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
 const api={at,normalize,canSync,upload,stage,validateLinks};
 root.Fulfillment=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
