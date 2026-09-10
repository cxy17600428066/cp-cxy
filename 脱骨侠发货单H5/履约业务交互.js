/* Local prototype interactions; no external messages or business-system writes. */
(() => {
 const KEY='oms-fulfillment-v2', esc=v=>safe(v??''), clone=v=>JSON.parse(JSON.stringify(v));
 let db,ready=true,activeOrder;
 try{db=JSON.parse(localStorage.getItem(KEY)||'{"orders":{},"shipments":{}}');if(!db.orders||!db.shipments)throw Error();}catch(e){ready=false;db={orders:{},shipments:{}};}
 function commit(next){if(!ready)throw Error('履约资料读取失败，请刷新后重试');localStorage.setItem(KEY,JSON.stringify(next));db=next;}
 function profile(id){return omsProfiles[id]||{};}
 function links(id){return Object.values(db.shipments).filter(s=>s.lines.some(l=>l.orderId===id));}
 function fmt(v){return v?kaDate(v):'待同步';}
 function notice(message){document.getElementById('fulfillmentMessage').textContent=message;}
 function order(id){
  if(db.orders[id])return db.orders[id];
  const p=profile(id),snapshot=historicalRules[id];
  return {id,stock:p.stock||'',receiptRequired:p.receiptRequired!==false,rules:clone(snapshot.rules),events:{...p.events},type:p.ruleSnapshot?.type||'standard',customerRule:p.ruleSnapshot?.rule,arrival:p.customerRequiredArrivalAt,lines:p.products.map((p,i)=>({key:String(i),sku:p.sku,qty:Number(p.qty)+Number(p.giftQty||0),stock:24,noStock:72})),version:snapshot.version};
 }
 // Freeze existing order thresholds once; subsequent configuration saves affect new orders only.
 const SNAP='oms-rule-snapshots-v2';let historicalRules={};
 try{
  historicalRules=JSON.parse(localStorage.getItem(SNAP)||'{}');
  Object.keys(omsProfiles).forEach(id=>{if(!historicalRules[id])historicalRules[id]={version:'历史规则保留',rules:clone(config.rules)};});
  localStorage.setItem(SNAP,JSON.stringify(historicalRules));
 }catch(e){ready=false;showToast('历史规则保存失败，禁止修改履约资料');}
 const originalRecords=records;
 records=function(id='all'){
  return originalRecords(id).map(x=>{const r=historicalRules[x.o[0]]?.rules.find(r=>r.id===x.r.id)||x.r;return {...x,r,level:classify(x.o,r)};});
 };
 const originalDetail=openOrder;
 openOrder=function(id){originalDetail(id);const detail=document.getElementById('orderDetail');if(!detail)return;detail.insertAdjacentHTML('beforeend','<section class="fulfillment-summary"><h3>发货单与回执</h3><p>原订单不变；拆合单只调整发货单。继承接单时间、有货状态及原规则，不重新计时。</p><button class="btn primary" onclick="openFulfillment(\''+esc(id)+'\')">查看履约资料</button><span> '+links(id).length+' 张关联发货单 · '+esc(order(id).version)+'</span></section>');};
 window.openFulfillment=function(id){
  activeOrder=id;let dialog=document.getElementById('fulfillmentDialog');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='fulfillmentDialog';dialog.className='fulfillment-dialog';document.body.append(dialog);}
  const o=order(id),p=profile(id),list=links(id);
  dialog.innerHTML='<header><div><h2>履约资料</h2><p>原订单 '+esc(id)+'</p></div><button class="btn" onclick="document.getElementById(\'fulfillmentDialog\').close()">关闭</button></header><div class="fulfillment-body"><p class="note">资料仅保存本机。物流回传、回执审核及企业微信群通知尚未连接业务系统。</p><section><h3>接单与计时</h3><div class="fulfillment-facts"><span>库存选择：<b>'+({stock:'有货',noStock:'无货'}[o.stock]||'待接单系统同步')+'</b></span><span>接单时间：'+fmt(o.events.factoryAcceptedAt)+'</span><span>财务审核：'+(o.events.financeApprovedAt?'已通过':'待同步')+'</span><span>同步旺店通：'+(Fulfillment.canSync(o.events)?'满足前置条件':'须财务通过且工厂接单完成')+'</span></div><p>发货从工厂接单起算，接单时整单选择有货或无货。按连续小时统计，配置变更不影响本订单。</p></section><section><h3>关联发货单 <small>'+list.length+' 张</small></h3><div class="fulfillment-scroll"><table><thead><tr><th>发货单号／关联订单</th><th>本单数量</th><th>物流来源／单号</th><th>签收来源／时间</th><th>首次回执／审核</th><th>操作</th></tr></thead><tbody>'+list.map(s=>{const e=Fulfillment.normalize(s.events);return '<tr><td>'+esc(s.id)+'<small>'+s.lines.map(l=>esc(l.orderId)+' · '+esc(l.sku)+' × '+l.qty).join('<br>')+'</small></td><td>'+s.lines.filter(l=>l.orderId===id).reduce((a,l)=>a+l.qty,0)+'</td><td>'+esc(s.source)+'<small>'+esc(s.company||'无物流公司')+'<br>'+esc(s.trackingNumber||'无可查询单号')+'</small></td><td>'+esc(e.signSource||'待物流回传')+'<small>'+fmt(e.signedAt)+'</small></td><td>'+fmt(e.firstReceiptUploadedAt)+'<small>'+esc(s.receiptReview||'未上传')+'</small></td><td><label class="btn">上传回执<input hidden type="file" accept=".pdf,.png,.jpg,.jpeg" onchange="uploadFulfillmentReceipt(\''+esc(s.id)+'\',this)"></label>'+(s.receipts?.length?'<button class="btn" onclick="viewFulfillmentReceipt(\''+esc(s.id)+'\')">查看回执</button>':'')+'</td></tr>';}).join('')||'<tr><td colspan="6">暂无发货单关联资料，请从发货单系统同步或填写下方物流资料。</td></tr>'+'</tbody></table></div></section><details><summary>导入物流资料并关联发货单</summary><p>使用物流导入表中的发货单号、发货方式、日期、数量、物流公司和单号。费用不参与时效判断；不采集司机资料。没有物流单号时，上传回执确认收货。</p><form id="fulfillmentImport"><div class="fulfillment-form"><label>发货单号<input name="shipment" required maxlength="80"></label><label>发货方式<input name="method" required maxlength="30" placeholder="快递／物流／自配送"></label><label>发货日期<input name="date" type="date" required></label><label>商品<select name="line">'+p.products.map((p,i)=>'<option value="'+i+'">'+esc(p.name)+'</option>').join('')+'</select></label><label>本单发货数量<input name="qty" type="number" min="1" step="1" required></label><label>物流公司<input name="company" maxlength="80"></label><label>物流单号<input name="tracking" maxlength="100"></label><label>WMS出库时间<input name="outbound" type="datetime-local" required></label></div><p>发货日期不代替出库时间。相同发货单号可关联多个原订单；同一商品再次录入会更新该关联数量。</p><button class="btn primary">保存本机物流资料</button></form></details><p id="fulfillmentMessage" role="status"></p><p class="note">回执需要审核，时效按第一次成功上传计算。审核驳回、补传不重置首次时间；无签收回传时标记为“回执确认”。</p></div>';
  document.getElementById('fulfillmentImport').onsubmit=importLogistics;
  if(!dialog.open)dialog.showModal();
 };
 function importLogistics(event){
  event.preventDefault();try{
   const f=new FormData(event.target),o=order(activeOrder),id=String(f.get('shipment')).trim(),key=String(f.get('line')),qty=Number(f.get('qty')),outbound=new Date(f.get('outbound')).toISOString();
   if(!Fulfillment.at(o.events.factoryAcceptedAt))throw Error('接单记录尚未同步，请先在接单系统完成接单并同步资料');
   if(Fulfillment.at(outbound)<Fulfillment.at(o.events.factoryAcceptedAt)||Fulfillment.at(outbound)>Date.now())throw Error('出库时间必须在接单后且不晚于当前时间');
   const next=clone(db),old=next.shipments[id];
   if(old&&(old.company!==f.get('company')||old.trackingNumber!==f.get('tracking')))throw Error('该发货单已存在，物流公司或单号不一致，请检查');
   const line={...o.lines.find(l=>l.key===key),orderId:activeOrder,qty};
   const s=old||{id,source:'物流信息导入',company:f.get('company'),trackingNumber:f.get('tracking'),method:f.get('method'),date:f.get('date'),lines:[],events:{wmsOutboundAt:outbound}};
   s.lines=s.lines.filter(l=>!(l.orderId===activeOrder&&l.key===key));s.lines.push(line);next.shipments[id]=s;
   Fulfillment.validateLinks(o,Object.values(next.shipments));next.orders[activeOrder]=o;commit(next);openFulfillment(activeOrder);notice('本机物流资料已保存；未触发实际物流查询。');
  }catch(e){notice(e.message);}
 }
 window.uploadFulfillmentReceipt=async function(id,input){
  try{const file=input.files[0];if(!file)return;if(!/\.(pdf|png|jpe?g)$/i.test(file.name)||file.size>2*1024*1024||!file.size)throw Error('请选择不超过 2MB 的 PDF、PNG 或 JPG 文件（本机存储限制）');
   const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('文件读取失败'));r.readAsDataURL(file);});
   const next=clone(db);next.shipments[id]=Fulfillment.upload(next.shipments[id],new Date().toISOString(),{name:file.name,data});commit(next);openFulfillment(activeOrder);notice('回执已保存本机，首次上传时间已保留；实际审核待接入。');
  }catch(e){notice(e.message);input.value='';}
 };
 window.viewFulfillmentReceipt=id=>{const file=db.shipments[id]?.receipts?.at(-1);if(!file)return;const a=document.createElement('a');a.href=file.data;a.download=file.name;a.click();};
 // The removed driver route no longer exposes a hidden legacy configuration.
 if(location.hash==='#driver')location.hash='#flow';
 render();
})();
