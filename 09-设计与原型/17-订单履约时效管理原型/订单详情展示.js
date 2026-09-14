/* Full OMS detail layout. Missing source fields are never fabricated. */
(() => {
 const previous=openOrder;
 const val=v=>v===null||v===undefined||v===''?'—':safe(v);
 const money=v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?'—':'¥ '+Number(v).toFixed(2);
 const field=(name,value)=>'<div class="od-field"><span>'+safe(name)+'：</span><b>'+val(value)+'</b></div>';
 const block=(title,body)=>'<section class="od-section"><h3>'+title+'</h3>'+body+'</section>';
 openOrder=function(id){
  previous(id);
  const target=document.getElementById('orderDetail'),p=omsProfiles[id];if(!target||!p)return;
  const flow=target.querySelector('.detail-fulfillment'),shipments=target.querySelector('.fulfillment-summary');
  let local;try{local=JSON.parse(localStorage.getItem('oms-fulfillment-v2')||'{}').orders?.[id];}catch(e){}
  const row=boardRows('all').find(x=>x.o[0]===id),e=Fulfillment.normalize({...p.events,...local?.events});
  const status=(p.statuses||[]).map(([key,value])=>'<span>'+safe(key)+'：<b class="badge gray">'+safe(value)+'</b></span>').join('');
  const receipt=local?.receiptRequired??p.receiptRequired;
  const timingMode=local?.timingMode||p.ruleSnapshot?.timingMode||(p.ruleSnapshot?.type==='system'?'system':p.customerRequiredArrivalAt?'negotiated':'default'),timingLabel={default:'系统默认时效',system:'系统客户时效',negotiated:'磋商时效'}[timingMode];
  const products=(p.products||[]).map(v=>'<tr><td><b>'+val(v.name)+'</b><small>商品编码：'+val(v.sku)+'</small><div class="od-tags">'+(v.tags||[]).map(t=>'<span>'+safe(t)+'</span>').join('')+'</div></td><td>'+money(v.factoryPrice)+'</td><td>'+money(v.price)+'</td><td>'+val(v.qty)+'</td><td>'+val(v.giftQty??0)+'</td><td>'+val(Number(v.qty||0)+Number(v.giftQty||0))+'</td><td>'+val(v.giftRatio)+'</td><td>'+money(v.coupon)+'</td><td>'+money(v.creditAmount)+'</td><td>'+money(v.paidAmount)+'</td><td>'+money(v.lineTotal??(v.price!=null&&v.qty!=null?Number(v.price)*Number(v.qty):null))+'</td></tr>').join('');
  const logs=[{time:p.createdAt,text:'订单创建 · '+(p.creator||'创建人未提供')}];
  [['financeApprovedAt','财务审核通过'],['factoryAcceptedAt','工厂接单完成'+(local?.stock?' · '+(local.stock==='stock'?'有货发货':'无货发货'):'')],['shippedAt','发货完成'],['wmsOutboundAt','WMS 出库（揽收）'],['signedAt',e.signSource==='回执确认'?'回执确认收货':'物流签收'],['firstReceiptUploadedAt','首次回执上传'],['receiptApprovedAt','回执审核通过']].forEach(([key,text])=>{if(e[key])logs.push({time:e[key],text});});
  if(p.paidAt)logs.push({time:p.paidAt,text:'客户付款成功'});
  const grid=items=>'<div class="od-grid">'+items.join('')+'</div>';
  target.innerHTML='<div class="dialog-head"><h2>订单详情</h2><button class="btn" aria-label="关闭订单详情" onclick="document.getElementById(\'orderDialog\').close()">返回列表</button></div><div class="od-document">'+
   block('订单信息',grid([field('订单号',id),field('买家',row?.o[1]),field('订单类型',p.type),field('订单来源',p.channel),field('客户类别',p.customerCategory),field('支付单号',p.paymentReference),field('付款方式',p.paymentMethod),field('销售人员',p.salesperson),field('销售区域',p.salesRegion),field('经销转私域',p.privateTransfer),field('订单用途',p.purpose),field('客户区域',p.customerRegion),field('发货主体',p.shippingEntity),field('是否回执',receipt===undefined?null:receipt?'是':'否'),field('下单时间',p.createdAt)])+'<div class="od-notes">'+field('买家留言',p.buyerNote)+field('工厂备注',p.factoryRemark)+field('商品清单附件',p.attachmentName)+'</div>')+
   block('认证信息',grid([field('我方主体',p.ourEntity),field('对方主体',p.customerEntity)]))+
   block('订单状态','<div class="od-status">'+status+'</div>'+grid([field('时效类型',timingLabel),field('客户要求到货时间',(local?.arrival||p.customerRequiredArrivalAt)?kaDate(local?.arrival||p.customerRequiredArrivalAt):null),field('预计发货完成',local?.plan?.ship?.estimated?kaDate(local.plan.ship.estimated):null),field('当前履约节点',row?.r.name),field('磋商状态',timingMode==='negotiated'?({rejected:'待线下磋商',resolved:'已完成磋商'}[local?.negotiation?.status]||'未拒绝接单'):null),field('到货凭证',local?.arrivalEvidence?.name||p.arrivalEvidence?.name)])+'<div id="odFlowSlot"></div>')+
   block('商品信息','<div class="od-table-scroll"><table class="od-product-table"><thead><tr>'+['商品','出厂价','成交价','数量','搭赠数量','总数量','搭赠比例','抵扣券','上账','实付','合计'].map(v=>'<th>'+v+'</th>').join('')+'</tr></thead><tbody>'+products+'</tbody></table></div><div class="od-amounts">'+[['商品原价总额',p.originalAmount],['运费金额',p.freight],['优惠券优惠',p.couponDiscount],['VIP 优惠',p.vipDiscount],['抵扣券使用金额',p.couponUsed],['上账使用金额',p.creditAmount],['已付金额',p.paidAmount],['调整价格',p.adjustment],['授信支付金额',p.creditPaid],['钱包支付金额',p.walletPaid],['商品总价',p.totalAmount],['核销费用',p.writeoffAmount]].map(([k,v])=>'<div><span>'+k+'：</span><b>'+money(v)+'</b></div>').join('')+'<div class="od-total"><span>应付金额：</span><b>'+money(p.due)+'</b></div></div>')+
   block('发货信息',grid([field('收货人',p.receiver),field('联系电话',p.phone),field('收货地址',p.address)])+'<div id="odShipmentsSlot"></div>')+
   block('订单操作日志','<ol class="od-log">'+logs.filter(l=>boardTime(l.time)!==null).sort((a,b)=>boardTime(b.time)-boardTime(a.time)).map(l=>'<li><time>'+safe(kaDate(l.time))+'</time><span>'+safe(l.text)+'</span></li>').join('')+'</ol>')+
   '<p class="od-footnote">未提供的字段以“—”展示；预计时间与实际完成记录分开显示。</p></div>';
  if(flow)target.querySelector('#odFlowSlot').append(flow);
  if(shipments)target.querySelector('#odShipmentsSlot').append(shipments);
 };
})();
