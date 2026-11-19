// 旧销售、核验批次和清偿流水保留原快照。新签收按包内预留与合同兑现方向处理。
const redemptionOptions=[['direct','直接返给客户（付款或抵货款）'],['balance','转入客户余额（以后使用）']];
const redemptionName=v=>redemptionOptions.find(([k])=>k===v)?.[1]||'历史返利专属池';
function initPackage(f,fresh=false){
 if(f.packageRevision)return;
 const r=f.rules.find(r=>r.id==='GET-001'&&r.version===1&&r.sku==='*'&&r.method==='rate'&&r.rate===10);
 if(r){f.ruleVersions||=[];f.ruleVersions.push(clone(r));r.version++;r.method='policy';r.name='按合同 SKU 总费率计提';}
 for(const l of f.bindings){l.redeemMode=l.customer==='B'?'balance':'direct';l.releaseMode='signed';}
 if(fresh)for(const o of f.openingRights||[]){o.link={...o.link,packageTerms:true,lockEarly:true,redeemMode:'direct'};}
 f.packageRevision=1;save();
}
function salePackageLink(link){const l=clone(link);l.packageTerms=true;l.lockEarly=true;l.redeemMode||='direct';l.releaseMode||='signed';
 for(const x of l.strategies||[]){x.lockEarly=true;x.redeemMode||=l.redeemMode}return l}
function rebateGroupKey(l,cid,period){return 'rebate|'+l.id+'@'+(l.accumulationVersion||l.version)+'|'+cid+'|'+period.key+(l.packageTerms?'|'+(l.redeemMode||'direct'):'')}
function packageLines(){
 const f=state.funding, groups=fundingGroups(), ret=new Map(), bySale=new Map();
 for(const s of f.sales)if(s.kind==='return'){if(!ret.has(s.original))ret.set(s.original,[]);ret.get(s.original).push(s)}
 for(const s of f.sales)if(s.kind==='sale'&&s.link.packageTerms){const reversals=ret.get(s.id)||[],rows=[s,...reversals];bySale.set(s.id,{s,base:sum(rows.map(x=>x.base)),total:sum(rows.map(x=>x.earning)),service:sum(rows.map(x=>x.service)),rebate:0,other:sum(rows.map(x=>x.otherReserve||0)),posted:s.status==='posted'||(s.rule.timing!=='instant'&&state.funding.batches.some(b=>b.kind==='earn'&&b.status==='approved'&&!b.reversesBatch&&b.key===earningGroupKey(s)&&JSON.parse(b.signature)[0].includes(s.id)))})}
 for(const g of groups.filter(g=>g.kind==='rebate'&&g.link.packageTerms)){let basis=0;const ids=new Set(g.rows);for(const o of f.openingRights||[])if(ids.has(o.id))basis+=o.base;
  for(const row of bySale.values())if(ids.has(row.s.id)){const after=basis+row.base;if(row.s.rule.pool===g.pool)row.rebate+=annualEntitlement(g.link,after)-annualEntitlement(g.link,basis);basis=after}}
 const rows=[...bySale.values()];for(const r of rows){r.net=r.total-r.rebate-r.service-r.other;r.gap=Math.max(0,-r.net)}
 const blocked=new Set(rows.filter(r=>r.gap).map(r=>r.s.customer+'|'+r.s.policy.id+'|'+r.s.doc));
 for(const r of rows){r.over=blocked.has(r.s.customer+'|'+r.s.policy.id+'|'+r.s.doc);r.manual=r.s.link.releaseMode==='review'&&!r.s.unlockRef;r.held=r.posted&&(r.manual||r.over)?Math.max(0,r.net):0;r.available=r.posted&&!r.manual&&!r.over?Math.max(0,r.net):0}return rows;
}
function packageAccounting(id){const rows=packageLines().filter(r=>r.s.rule.pool===id);return{held:sum(rows.map(r=>r.held)),gap:sum(rows.map(r=>r.gap)),other:sum(rows.filter(r=>r.posted).map(r=>r.other))}}
function packageLedgerView(){
 const rows=packageLines();return `<section class="card" style="margin-top:16px"><h2>签收行费用分配</h2><p>有效成交金额 × 本行 SKU 总费率 = 总贡献。先扣客户预留，剩余额度满足释放条件后再按组织分配。下单试算不记账。</p>${rows.length?table(['订单行 / 客户','SKU / 净销售','总贡献','年返等返利预留','服务 / 其他预留','待解锁 / 缺口','已解锁活动额度','操作'],rows.map(r=>[esc(r.s.doc)+' / '+esc(r.s.line)+'<br>'+esc(customer(r.s.customer).name),esc(r.s.sku)+'<br>'+money(r.base),money(r.total),money(r.rebate),money(r.service)+' / '+money(r.other),money(r.held)+' / '+money(r.gap),money(r.available),r.gap?'超包，待批准补足':r.over?'同订单超包，暂停释放':!r.posted?'等待贡献入账':r.manual&&r.held?`<button data-order-unlock="${r.s.id}">核对并解锁</button>`:r.s.unlockRef?'已核验 · '+esc(r.s.unlockRef):'按签收条件释放'])):'<p>暂无新口径签收行。登记签收后，可在这里核对贡献与去向。</p>'}</section>`
}
function unlockPackage(id,ref){requireFundingFinance();const r=packageLines().find(r=>r.s.id===id);if(!r?.held||r.over||!r.manual)throw Error('当前销售行不满足解锁条件。');if(!ref.trim())throw Error('请填写核验依据。');r.s.unlockRef=ref.trim();r.s.unlockDate=state.funding.date;save()}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-order-unlock]');if(!btn)return;try{requireFundingFinance();showModal('核对活动额度释放条件',`<form id="releasePackageForm" data-id="${esc(btn.dataset.orderUnlock)}"><p>确认合同释放条件已经满足后，剩余额度才计入四级组织可用。</p>${ff('releasePackageRef','核验依据或凭证号 *','','text','required maxlength="80"')}<p id="fundingError" role="alert"></p><button class="primary">确认解锁</button></form>`)}catch(err){fundingFail(err)}});
document.addEventListener('submit',e=>{if(e.target.id!=='releasePackageForm')return;e.preventDefault();try{unlockPackage(e.target.dataset.id,$('releasePackageRef').value);closeModal();render();toast('已解锁，组织可用额度已更新。')}catch(err){fundingFail(err)}});
function redeemedCustomer(cid){const f=state.funding,bs=f.batches.filter(b=>b.customer===cid&&b.kind==='rebate'&&b.status==='approved');let direct=0,balance=0,used=0,paid=0,approvedBalance=0;for(const b of bs){const v=batchBalance(b);if(b.redeemMode==='balance'){balance+=v.payable;used+=v.paid;approvedBalance+=v.remaining+v.paid}else{direct+=v.payable;paid+=v.paid}}return{direct,balance,used,paid,approvedBalance}}
function recordRedemption(b,amount,method,ref,order){
 requireFundingFinance();const f=state.funding;if(b?.status!=='approved'||b.kind!=='rebate'||f.date<b.period.end)throw Error('该批次尚未到可办理时点。');
 if(b.redeemMode==='balance'?method!=='use':!['cash','offset'].includes(method))throw Error('该方式与批次锁定的合同兑现去向不符。');
 if(!ref.trim()||f.payouts.some(p=>p.ref===ref.trim())||f.transfers.some(t=>t.adjustRef===ref.trim()))throw Error('凭证号为空或已使用。');
 if(!Number.isSafeInteger(amount)||amount<=0||amount>batchBalance(b).payable)throw Error('本次金额超过可办理金额，或原销售退货尚待调整。');
 if(b.targetPool&&amount>fundingPoolTotals(b.targetPool).available)throw Error('客户余额不足。');
 if(method==='use'&&!order?.trim())throw Error('请填写本客户的使用单据号。');
 f.payouts.push({id:nextId('REBATE-PAY-',f.payouts),batch:b.id,pool:b.targetPool||null,customer:b.customer,amount,ref:ref.trim(),method,order:method==='use'?order.trim():'',date:f.date});save()
}
