// 每个经营账户有唯一组织路径。集团账户通过同一条调拨凭证同时生成两方余额。
const CONTRACT_POOL = '@contract';
const sectorDefaults = [
  {sector:'休食',customer:'A',id:'POOL-SNACK',province:'浙江'},
  {sector:'餐饮',customer:'C',id:'POOL-CATER',province:'江苏'},
  {sector:'大客',customer:'B',id:'POOL-KA',province:'浙江'},
  {sector:'私域',customer:'D',id:'POOL-PRIVATE',province:'上海'}
];

function initSectorFunds(f,fresh=false) {
  if(f.sectorRevision){
    if(!f.groupLedgerId){f.groupLedgerId=crypto.randomUUID();save()}
    return;
  }
  const main = f.pools.find(p=>p.id===MAIN_POOL);
  const mixed = f.sales.some(s=>s.customer!=='A'&&s.rule.pool===MAIN_POOL);
  for(const def of sectorDefaults){
    const org={sector:def.sector,area:'华东',province:def.province};
    if(def.customer==='A'&&main&&!mixed){
      Object.assign(main,org);
      if(main.name==='全费用总资金池')main.name='休食经营池';
    }else{
      f.pools.push({...org,id:def.id,name:def.sector+'经营池',kind:'operating',initial:0,
        cap:100000000,status:'active',ratios:[10,20,20,50],from:FUND_CUTOVER,to:'2026-12-31'});
    }
  }
  if(mixed&&main?.name==='全费用总资金池')main.name='历史共用经营池';
  f.groupJournal=[];
  f.groupLedgerId=crypto.randomUUID();
  const rule=f.rules.find(r=>r.id==='GET-001'&&r.pool===MAIN_POOL&&r.method==='policy'&&r.version===2);
  if(rule && (fresh || f.date<=rule.to)){
    if(!fresh){f.ruleVersions||=[];f.ruleVersions.push(clone(rule));rule.version++;rule.from=rule.from>f.date?rule.from:f.date}
    rule.pool=CONTRACT_POOL;
    for(const link of f.bindings){
      const next=defaultSectorPool(link.customer);
      if(next===link.sourcePool||link.sourcePool!==MAIN_POOL||!fresh&&(link.version!==1||link.to<f.date))continue;
      if(!fresh){
        f.bindingVersions||=[];f.bindingVersions.push(clone(link));link.version++;link.accumulationVersion=link.version;
        link.from=link.from>f.date?link.from:f.date;
      }
      link.sourcePool=next;
    }
  }
  f.sectorRevision=1;
  save();
}
function defaultSectorPool(cid){
  const d=sectorDefaults.find(x=>x.customer===cid);
  if(!d)return MAIN_POOL;
  return state.funding.pools.some(p=>p.id===d.id)?d.id:MAIN_POOL;
}
function poolPath(p){return p.kind==='rebate'?'客户余额':p.sector?[p.sector,p.area,p.province].join(' / '):'历史归属待确认'}
function poolLevelNames(p){return ['总部留存',(p?.sector||'板块')+'本级',(p?.area||'所属')+'大区',(p?.province||'所属')+'省区']}
function operatingOptions(){return state.funding.pools.filter(p=>p.kind==='operating'&&p.status==='active').map(p=>[p.id,p.name+' · '+poolPath(p)])}
function poolOrgFields(p){
  if(p.kind==='rebate')return '';
  const fixed=p.status==='active'&&p.sector, current=p.sector||(!p.id?'休食':'');
  return fs('fpSector','所属板块 *',[['','请选择'],...sectorDefaults.map(x=>[x.sector,x.sector])],current,'required '+(fixed?'disabled':''))+
    ff('fpArea','所属大区 *',p.area??(!p.id?'华东':''),'text','required maxlength="24" '+(fixed?'readonly':''))+
    ff('fpProvince','所属省区 *',p.province??(!p.id?'浙江':''),'text','required maxlength="24" '+(fixed?'readonly':''));
}
function readPoolOrg(old){
  if(old?.status==='active'&&old.sector)return {sector:old.sector,area:old.area,province:old.province};
  const sector=$('fpSector').value,area=$('fpArea').value.trim().replace(/大区$/,'').trim(),province=$('fpProvince').value.trim().replace(/省区$/,'').trim();
  if(!sectorDefaults.some(s=>s.sector===sector)||!area||!province)throw Error('请选择板块并填写大区和省区名称。');
  return {sector,area,province};
}
function groupReceipts(pool){return sum(state.funding.groupJournal.filter(e=>e.pool===pool).map(e=>e.amount))}
function groupBalance(){return sum(state.funding.groupJournal.map(e=>e.kind==='deposit'?e.amount:-e.amount))}
function availableTargets(){
  const f=state.funding;
  return f.pools.filter(p=>p.kind==='operating'&&p.sector&&p.status==='active'&&p.from<=f.date&&p.to>=f.date);
}
function transferTargetName(p,level){
  return [p.sector,...(level>=2?[p.area+'大区']:[]),...(level===3?[p.province+'省区']:[])].join(' / ')+' · '+p.name;
}
function buildGroupEntry({kind,amount,ref,pool,level}){
  requireFundingFinance();
  const f=state.funding, journal=f.groupJournal;
  ref=String(ref||'').trim();
  if(!ref||ref.length>80||journal.some(e=>e.ref===ref))throw Error('请填写唯一凭证号。已入账的凭证可在集团流水中查询。');
  if(!Number.isSafeInteger(amount)||amount<=0)throw Error('金额须为大于零且精确到分的有效金额。');
  if(!['deposit','transfer'].includes(kind))throw Error('请选择集团入账或调拨入池。');
  if(journal.length&&f.date<journal[journal.length-1].date)throw Error('业务日早于最近一笔集团流水，请调整业务日。');
  const balance=groupBalance();
  const entry={id:nextId('GRP-',journal),kind,ref,amount,date:f.date,operator:'finance'};
  if(kind==='transfer'){
    const target=availableTargets().find(p=>p.id===pool);
    if(!target||![1,2,3].includes(level))throw Error('请选择业务日有效的经营池及接收层级。');
    if(amount>balance)throw Error('集团余额不足，请调低金额或先登记集团资金。');
    const totals=fundingPoolTotals(pool);
    if(amount>target.cap-totals.source)throw Error('调拨后将超过经营池预算上限，请调低金额或调整上限。');
    Object.assign(entry,{pool,level,target:transferTargetName(target,level),sector:target.sector,area:target.area,province:target.province});
  }else if(!Number.isSafeInteger(balance+amount))throw Error('入账后余额超出有效精度范围。');
  return entry;
}

// IndexedDB 的读写事务保证多个窗口按同一份已提交账本检查余额和凭证。
// localStorage 同步保存显示用的快照，以便沿用原有经营池、活动及导出逻辑。
let groupDatabase;
function openGroupDatabase(){
  if(!groupDatabase)groupDatabase=new Promise((resolve,reject)=>{
    const request=indexedDB.open('tgx-expense-group-ledgers',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('journals');
    request.onerror=()=>{groupDatabase=null;reject(Error('无法打开集团账本，请检查浏览器本地存储权限。'))};
    request.onsuccess=()=>resolve(request.result);
  });
  return groupDatabase;
}
async function commitGroupEntry(input){
  requireFundingFinance();
  const db=await openGroupDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('journals','readwrite'),store=tx.objectStore('journals');
    const persisted=JSON.parse(localStorage.getItem(key)||'null');
    if(persisted?.funding?.groupLedgerId)state=persisted;
    const f=state.funding,request=store.get(f.groupLedgerId);
    let entry,next,failure;
    request.onsuccess=()=>{
      try{
        if(request.result)f.groupJournal=request.result;
        entry=buildGroupEntry(input);next=[...f.groupJournal,entry];
        store.put(next,f.groupLedgerId);
      }catch(error){failure=error;tx.abort()}
    };
    tx.onabort=()=>reject(failure||Error('集团账本保存失败，请检查本地存储后重试。'));
    tx.oncomplete=()=>{f.groupJournal=next;save();resolve(entry)};
  });
}
function preserveGroupJournal(){
  const f=state.funding;
  if(!f?.groupLedgerId)return;
  const stored=JSON.parse(localStorage.getItem(key)||'null')?.funding;
  if(stored?.groupLedgerId===f.groupLedgerId&&stored.groupJournal.length>f.groupJournal.length)f.groupJournal=stored.groupJournal;
}
async function restoreGroupJournal(){
  const f=state.funding;
  if(!f?.groupLedgerId||!window.indexedDB)return;
  try{
    const db=await openGroupDatabase(),request=db.transaction('journals').objectStore('journals').get(f.groupLedgerId);
    request.onsuccess=()=>{
      if(f===state.funding&&request.result?.length>f.groupJournal.length){
        f.groupJournal=request.result;save();render();
      }
    };
  }catch{/* 已保存的快照仍可查看，提交时会说明存储状态。 */}
}
window.addEventListener('load',restoreGroupJournal);
window.addEventListener('focus',restoreGroupJournal);
function groupLedgerView(){
  const journal=state.funding.groupJournal;
  let balance=0;
  const rows=journal.map(e=>{
    const out=e.kind==='transfer';balance+=out?-e.amount:e.amount;
    return [esc(e.date),esc(e.ref)+'<br><small>'+esc(e.id)+'</small>',out?'调拨入池':'集团资金入账',
      out?esc(e.target):'集团账户',(out?'−':'+')+money(e.amount),out?'+'+money(e.amount):'—',money(balance)];
  }).reverse();
  return `<section class="card group-ledger"><h2>集团流水</h2>${rows.length?table(['业务日','凭证 / 流水号','业务','接收方','集团变动','经营池变动','集团结余'],rows):'<p class="note">暂无流水。财务登记集团资金后，即可按板块和组织调拨。</p>'}</section>`;
}
function sectorOverview(){
  const all=state.funding.pools.filter(p=>p.kind==='operating'&&p.status==='active').map(p=>({p,t:fundingPoolTotals(p.id),org:fundingOrgBalances(p.id)}));
  const total=(rows,k)=>sum(rows.map(x=>x.t[k]));
  const at=(rows,k,i)=>sum(rows.map(x=>x.org[k][i]));
  const tree=sectorDefaults.map(({sector})=>{
    const rows=all.filter(x=>x.p.sector===sector),areas=[...new Set(rows.map(x=>x.p.area))];
    const parts=[];
    for(const area of areas){
      const regional=rows.filter(x=>x.p.area===area);
      parts.push([esc(area)+'大区本级',money(at(regional,'available',2)),money(at(regional,'occupied',2)),money(at(regional,'gap',2))]);
      for(const province of new Set(regional.map(x=>x.p.province))){
        const local=regional.filter(x=>x.p.province===province);
        parts.push([esc(area)+' / '+esc(province)+'省区',money(at(local,'available',3)),money(at(local,'occupied',3)),money(at(local,'gap',3))]);
      }
    }
    const orgRows=[...['总部留存','板块本级'].map((name,i)=>[name,money(at(rows,'available',i)),money(at(rows,'occupied',i)),money(at(rows,'gap',i))]),...parts];
    return `<details class="sector-row"><summary aria-label="${sector}，本期销售贡献 ${money(total(rows,'earned'))}，集团调入 ${money(total(rows,'incoming'))}，活动可用 ${money(total(rows,'available'))}"><span class="sector-name">${sector}</span><small>活动可用</small><strong>${money(total(rows,'available'))}</strong><span class="sector-metrics"><span>销售贡献<b>${money(total(rows,'earned'))}</b></span><span>集团调入<b>${money(total(rows,'incoming'))}</b></span></span><span class="sector-link" aria-hidden="true">组织明细</span></summary><div class="sector-body">${table(['组织归属','本级可用','本级占用','本级缺口'],orgRows)}</div></details>`;
  }).join('');
  const unknown=all.filter(x=>!x.p.sector);
  return `<section class="card sector-overview"><div class="fund-summary"><div><h2>经营池可用合计</h2><strong>${money(total(all,'available'))}</strong></div><div><h2>集团可调拨余额</h2><strong>${money(groupBalance())}</strong><button data-group-account="overview">进入集团账户 <span aria-hidden="true">→</span></button></div></div><h2 class="sector-title">板块资金</h2><div class="sector-grid">${tree}</div>${unknown.length?`<p class="banner warn">另有 ${unknown.length} 个历史经营池待确认组织，可用合计 ${money(total(unknown,'available'))}，已计入总额。请在资金池配置中确认归属。</p>`:''}</section>`;
}
function openGroupAccount(action='overview'){
  const transfer=action==='transfer',entry=transfer||action==='deposit',f=state.funding;
  const title=entry?(transfer?'集团调拨入池':'登记集团资金'):'集团账户';
  launchPage({kind:'groupAccount',id:entry?action:'overview'},()=>{
    if(!entry){
      const received=sum(f.groupJournal.filter(e=>e.kind==='deposit').map(e=>e.amount));
      showModal(title,`<div class="fund-summary group-summary"><div><h2>集团可调拨余额</h2><strong>${money(groupBalance())}</strong></div><div><h2>累计入账</h2><strong>${money(received)}</strong></div><div><h2>累计调拨</h2><strong>${money(received-groupBalance())}</strong></div></div><div class="actions group-actions"><button class="primary" data-group-account="transfer">调拨入池</button><button data-group-account="deposit">登记集团资金</button></div><p class="note">由财务复核角色办理。调拨到账后，接收组织可用于活动；签收贡献与客户返利仍按合同计算。</p>${groupLedgerView()}`);
      return;
    }
    const targets=availableTargets();
    showModal(title,`<form id="groupEntryForm" data-kind="${action}"><p>集团可调拨余额 <strong>${money(groupBalance())}</strong></p><div class="fields">${transfer?fs('groupTarget','接收经营池 *',[['','请选择板块及组织路径'],...targets.map(p=>[p.id,poolPath(p)+' · '+p.name])],'','required')+fs('groupLevel','额度归属 *',[['1','板块本级'],['2','大区本级'],['3','省区本级']],'1','required'):''}${ff('groupAmount',transfer?'调拨金额（元） *':'集团入账金额（元） *','','number','required min="0.01" step="0.01"')}${ff('groupRef','财务凭证号 *','','text','required maxlength="80"')}</div><p id="groupPreview" class="banner" aria-live="polite">${transfer?'选择经营池、接收层级并填写金额后可核对双方变动。':'集团资金按凭证登记，入账后即可调拨。'}</p><p id="fundingError" class="error-text" role="alert"></p><button class="primary">${transfer?'确认调拨入池':'确认集团入账'}</button></form>`);
  });
}
function updateGroupPreview(){
  if(!$('groupPreview'))return;
  const amount=cents($('groupAmount').value);
  if(!Number.isSafeInteger(amount)||amount<=0)return $('groupPreview').textContent='填写有效金额后可预览余额。';
  if(!$('groupTarget'))return $('groupPreview').textContent='入账后集团余额 '+money(groupBalance()+amount);
  const pool=availableTargets().find(p=>p.id===$('groupTarget').value),level=Number($('groupLevel').value);
  $('groupPreview').textContent=!pool?'请选择接收经营池。':amount>groupBalance()?'集团可调拨余额不足。':
    '集团余额 '+money(groupBalance())+' → '+money(groupBalance()-amount)+'；'+transferTargetName(pool,level)+' 增加 '+money(amount)+'。';
}
function activityLevelShares(amount,value){
  const level=({province:3,region:2,sector:1,hq:0})[value];
  return [0,1,2,3].map(i=>i===level?amount:0);
}
function syncActivityPool(existing){
  const p=state.funding.pools.find(x=>x.id===$('activitySourcePool')?.value);
  if(!p||!$('apool'))return;
  const names=poolLevelNames(p),modes=['hq','sector','region','province'];
  let mode=$('apool').value||'province';
  if(existing?.shares?.filter(Boolean).length===1)mode=modes[existing.shares.findIndex(Boolean)];
  $('apool').innerHTML=modes.map((v,i)=>`<option value="${v}">${esc(names[i])}承担</option>`).join('')+'<option value="multi">按所选资金池的四级组织比例分摊</option>';
  $('apool').value=mode;
  const sourceCustomers=[...new Set(state.funding.bindings.filter(l=>l.sourcePool===p.id).map(l=>l.customer))];
  $('acustomer').value=existing?.customer||(sourceCustomers.length===1&&!groupReceipts(p.id)?customer(sourceCustomers[0]).name:p.name+'（组织统筹）');
  const linked=state.dealerPrograms.find(x=>x.id===$('executionProgram')?.value);
  const recipient=linked?customer(linked.customer).name:existing?.recipient||$('arecipient').value;
  $('arecipient').innerHTML=(linked?[customer(linked.customer)]:customers).map(c=>`<option>${esc(c.name)}</option>`).join('');
  $('arecipient').value=recipient;
}
document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-group-account]');
  if(btn)openGroupAccount(btn.dataset.groupAccount);
});
document.addEventListener('input',e=>{if(e.target.closest('#groupEntryForm'))updateGroupPreview()});
document.addEventListener('change',e=>{if(e.target.id==='activitySourcePool')syncActivityPool()});
document.addEventListener('submit',async e=>{
  if(e.target.id!=='groupEntryForm')return;
  e.preventDefault();
  const submit=e.target.querySelector('button[type=submit],button.primary');
  if(submit.disabled)return;
  try{
    requireFundingFinance();
    submit.disabled=true;e.target.setAttribute('aria-busy','true');
    $('fundingError').textContent='';
    const kind=e.target.dataset.kind;
    const r=await commitGroupEntry({kind,amount:cents($('groupAmount').value),ref:$('groupRef').value,pool:$('groupTarget')?.value,level:Number($('groupLevel')?.value)});
    finishDetail();openGroupAccount();toast((kind==='transfer'?'已调拨入池':'集团资金已入账')+' · '+r.id);
  }catch(error){fundingFail(error)}
  finally{submit.disabled=false;e.target.removeAttribute('aria-busy')}
});
