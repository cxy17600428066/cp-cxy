/* Reusable local demo orders for checking every timing-mode interaction. */
(() => {
 const H=3600000,DAY=24*H,now=Date.now(),iso=t=>new Date(t).toISOString(),clone=v=>JSON.parse(JSON.stringify(v));
 const base=clone(Object.values(omsProfiles)[0]);
 const rule={finance:72,accept:60,ship:48,pickup:36,receipt:24,warning:4,escalation:2};
 const cases=[
  {id:'demo-system-pending',customer:'演示系统客户·待接单',mode:'system',state:'pending',arrival:now+7*DAY},
  {id:'demo-system-accepted',customer:'演示系统客户·已接单',mode:'system',state:'accepted',arrival:now+8*DAY},
  {id:'demo-negotiated-pending',customer:'演示普通客户·待接单',mode:'negotiated',state:'pending',arrival:now+5*DAY},
  {id:'demo-negotiated-rejected',customer:'演示普通客户·待磋商',mode:'negotiated',state:'rejected',arrival:now+3*DAY},
  {id:'demo-negotiated-resolved',customer:'演示普通客户·已完成磋商',mode:'negotiated',state:'resolved',arrival:now+9*DAY},
  {id:'demo-negotiated-accepted',customer:'演示普通客户·已接单',mode:'negotiated',state:'accepted',arrival:now+10*DAY}
 ];
 for(const c of cases){
  const profile=clone(base),system=c.mode==='system';
  Object.assign(profile,{source:'交互演示数据',createdAt:iso(now-2*H),customerRequiredArrivalAt:iso(c.arrival),ruleSnapshot:{type:system?'system':'standard',timingMode:c.mode,rule:system?clone(rule):clone(config)},customerCategory:system?'系统客户':'普通客户',systemName:system?'演示商超系统':'',arrivalEvidence:system?null:{name:'客户沟通记录.png'}});
  profile.statuses=(profile.statuses||[]).map(([k,v])=>[k,k.includes('接单状态')?(c.state==='accepted'?'已接单':'待接单'):v]);
  omsProfiles[c.id]=profile;
  const row=[c.id,c.customer,'¥ '+Number(profile.due||0).toFixed(2),iso(now-2*H),0.5,'normal'];
  (nodeOrders[c.state==='accepted'?'ship':'accept']||(nodeOrders.accept=[])).push(row);
 }
 window.omsTimingDemoCases=cases;
 window.omsSeedTimingDemoOrders=db=>{
  for(const c of cases){
   if(!['rejected','resolved','accepted'].includes(c.state)||db.orders[c.id])continue;
   const p=omsProfiles[c.id],system=c.mode==='system',accepted=c.state==='accepted'?iso(now-H):null;
   const order={id:c.id,type:system?'system':'standard',timingMode:c.mode,arrival:iso(c.arrival),customerRule:system?clone(rule):null,receiptRequired:true,rules:clone(config.rules),stock:c.state==='accepted'?'stock':'',lines:p.products.map((v,i)=>({key:String(i),sku:v.sku,qty:Number(v.qty)+Number(v.giftQty||0),stock:24,noStock:72})),events:{submittedAt:iso(now-2*H),factoryAcceptedAt:accepted},arrivalEvidence:system?null:{name:'客户沟通记录.png',data:'data:image/png;base64,iVBORw0KGgo='}};
   if(c.state==='rejected')order.negotiation={status:'rejected',reason:'当前排产无法满足原到货时间',rejectedAt:iso(now-H),history:[{action:'rejected',at:iso(now-H),reason:'当前排产无法满足原到货时间',arrival:order.arrival}]};
   if(c.state==='resolved')order.negotiation={status:'resolved',reason:'当前排产无法满足原到货时间',rejectedAt:iso(now-2*H),resolvedAt:iso(now-H),history:[{action:'rejected',at:iso(now-2*H),reason:'当前排产无法满足原到货时间',arrival:iso(now+3*DAY)},{action:'resolved',at:iso(now-H),before:iso(now+3*DAY),after:order.arrival,evidenceName:'客户沟通记录.png'}]};
   if(c.state==='accepted'){order.negotiation=c.mode==='negotiated'?{status:'resolved',resolvedAt:iso(now-2*H),history:[]}:undefined;order.plan=Fulfillment.plan(order,accepted);}
   db.orders[c.id]=order;
  }
  return db;
 };
 window.resetTimingDemoCases=()=>{const db=JSON.parse(localStorage.getItem('oms-fulfillment-v2')||'{"orders":{},"shipments":{}}');for(const c of cases)delete db.orders[c.id];omsSeedTimingDemoOrders(db);localStorage.setItem('oms-fulfillment-v2',JSON.stringify(db));location.reload();};
})();
