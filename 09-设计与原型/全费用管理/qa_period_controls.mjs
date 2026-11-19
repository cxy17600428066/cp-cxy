import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {visit,visitFunding} from './qa-workspace.mjs';
const {chromium}=createRequire(process.execPath)('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[], p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(4400);
const entry=new URL('./原型.html',import.meta.url).href;
try{
 await p.goto(entry);
 const state1=await p.evaluate(()=>{
  const f=state.funding, x={kind:'sale',customer:'B',doc:'NOV-ORDER',line:'1',sku:'S',base:1000000,qty:100,date:f.date};f.rules[0].method='rate';f.rules[0].rate=10;f.rules[0].timing='month';const s=postFundingSale(x);
  f.date='2026-11-30';const key=fundingGroups().find(g=>g.kind==='earn').key,b=prepareFundingBatch(key);for(const role of ['business','finance']){$('role').value=role;approveFundingBatch(b.id,false,'核准')}
  const original=clone(f.credits[0]);f.date='2026-12-03';postFundingSale({...x,kind:'return',original:s.id,date:f.date,doc:'DEC-RETURN',qty:20,base:200000});save();
  return {original,earned:fundingPoolTotals(MAIN_POOL).earned,service:fundingPoolTotals(MAIN_POOL).service}
 });assert.equal(state1.earned,100000);assert.equal(state1.service,50000);
 await visit(p,'exceptions');await p.getByRole('button',{name:'查看原入池批次 BATCH-001'}).click();
 await p.getByRole('button',{name:'申请冲回经营池'}).click();assert.match(await p.locator('#toast').innerText(),/销售/);
 await p.locator('#role').selectOption('sales');await p.locator('[data-earn-return]').click();
 assert.match(await p.locator('#workspace').innerText(),/原入池流水 CREDIT-001/);
 assert.ok(await p.evaluate(()=>state.funding.credits.length===1));await p.locator('#role').selectOption('business');await p.locator('[data-funding-approve]').click();
 await visit(p,'approval');await p.locator('[data-funding-batch="BATCH-002"]').click();await p.locator('#role').selectOption('finance');await p.locator('[data-funding-approve]').click();
 const outcome=await p.evaluate(()=>({credit:state.funding.credits.at(-1),first:state.funding.credits[0],pool:fundingPoolTotals(MAIN_POOL),again:earnReturnPlan(state.funding.batches[0])}));assert.deepEqual(outcome.first,state1.original);assert.equal(outcome.credit.amount,-20000);assert.equal(outcome.credit.date,'2026-12-03');assert.equal(outcome.credit.reverses,'CREDIT-001');assert.equal(outcome.pool.earned,80000);assert.equal(outcome.pool.service,40000);assert.equal(outcome.again,null);await p.reload();assert.equal(await p.evaluate(()=>state.funding.credits.length),2);
 console.log('PASS 11月获取1000元，12月退货经两岗核准冲回200元；原批次、预留及刷新幂等');
 await visit(p,'policies');await p.locator('#role').selectOption('finance');await p.locator('[data-funding-binding="LINK-002"]').click();
 await p.locator('[data-funding-strategy-add]').click();const main=await p.locator('#fbClause').inputValue();await p.locator('[data-st=strategyName]').fill('年度别名');await p.locator('[data-st=clauseCode]').fill(main.toLowerCase());await p.locator('[data-st=stackMode]').selectOption('choice');
 await p.locator('#fundingBindingForm button[type=submit]').click();assert.match(await p.locator('#fundingError').innerText(),/条款编号不能重复/);
 await p.locator('[data-st=clauseCode]').fill('BONUS-B');await p.locator('#fundingBindingForm button[type=submit]').click();
 await visitFunding(p,'sales');await p.locator('#role').selectOption('sales');await p.locator('[data-funding-sale-new]').click();await p.locator('#saleCustomer').selectOption('B');assert.equal(await p.locator('#saleClause').inputValue(),'');await p.locator('#saleDoc').fill('DEC-02');await p.locator('#saleClause').selectOption('BONUS-B');await p.locator('#fundingSaleForm button').click();
 const clauses=await p.evaluate(()=>{const f=state.funding,s=f.sales.at(-1),l=clone(s.link);l.strategies.push({...l.strategies[0],id:'EXTRA',stackMode:'stack',clauseCode:'ADD',strategyName:'可叠加奖励'});const group=fundingGroups().find(x=>x.link?.clauseCode==='BONUS-B');return [s.selectedClause,appliedClauses(s).map(x=>x.clauseCode),group.basis,appliedClauses({...s,link:l}).map(x=>x.clauseCode)]});
 assert.deepEqual(clauses,['BONUS-B',['BONUS-B'],10000000,['BONUS-B','ADD']]);console.log('PASS 条款别名拦截、互斥显式选一、独立可叠加');
 await visitFunding(p,'pools');assert.match(await p.locator('#workspace').innerText(),/签收行费用分配/);
 const flow=await p.evaluate(()=>{
 const f=state.funding;f.date='2026-12-10';f.rules[0].timing='instant';const s=postFundingSale({customer:'A',kind:'sale',doc:'A10',line:'1',sku:'S',base:10000000,qty:100,date:f.date});const grp=()=>fundingGroups().find(x=>x.customer==='A'&&x.kind==='rebate');const before=fundingPoolTotals(MAIN_POOL).available,advisory=unreservedAnnual(MAIN_POOL);const after=fundingPoolTotals(MAIN_POOL).available;const stages=[periodProgress(grp()).status];f.date='2026-12-31';stages.push(periodProgress(grp()).status);const b=prepareFundingBatch(grp().key);stages.push(periodProgress(grp()).status);$('role').value='business';approveFundingBatch(b.id,false,'');stages.push(periodProgress(grp()).status);$('role').value='finance';approveFundingBatch(b.id,false,'');stages.push(periodProgress(grp()).status);save();return {advisory,before,after,stages,batch:b.id,post:unreservedAnnual(MAIN_POOL)}});
 assert.equal(flow.before,flow.after);assert.equal(flow.advisory,0);assert.equal(flow.post,0);assert.match(flow.stages.join('/'),/累计中.*待销售申请.*业务.*财务.*待财务兑现/);
 await visit(p,'settlement');await p.locator('[data-funding-payout="'+flow.batch+'"]').click();await p.locator('#rebatePayAmount').fill('4000');await p.locator('#rebatePayRef').fill('PAY-A-FULL');await p.locator('#fundingPayoutForm button').click();
 await visitFunding(p,'period');assert.match(await p.locator('#workspace').innerText(),/已兑现/);assert.deepEqual(await p.evaluate(()=>periodProgress(fundingGroups().find(x=>x.customer==='A'&&x.kind==='rebate'))),{status:'已兑现',paid:400000});
 await p.setViewportSize({width:390,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 console.log('PASS 年返待办、转池与实付分列，期初预留不重复提示，提示不改变余额，手机布局');
 const edge=await browser.newPage();edge.on('pageerror',e=>errors.push(e.message));await edge.goto(entry);
 const audit=await edge.evaluate(()=>{
  const f=state.funding;f.rules[0].method='rate';f.rules[0].rate=10;f.rules[0].timing='month';const inp={kind:'sale',customer:'B',doc:'NOV',line:'1',sku:'S',qty:100,base:1000000,date:f.date};const sale=postFundingSale(inp);f.date='2026-11-30';
  const b=prepareFundingBatch(fundingGroups().find(g=>g.kind==='earn').key);for(const role of ['business','finance']){$('role').value=role;approveFundingBatch(b.id,false,'OK')}
  const shares=fundingOrgBalances(MAIN_POOL).available;state.activities.push({id:'TEST-RESERVED',status:'approved',shares:clone(shares),amount:sum(shares)});
  f.date='2026-12-08';const ret=(doc,qty)=>postFundingSale({...inp,kind:'return',doc,qty,base:qty*10000,date:f.date,original:sale.id});ret('R1',20);$('role').value='sales';const stale=requestEarnReturn(b.id);
  $('role').value='business';approveFundingBatch(stale.id,false,'');ret('R2',10);$('role').value='finance';let blocked=false;try{approveFundingBatch(stale.id,false,'')}catch{blocked=true}
  if(f.credits.length!==1)throw Error('stale attempt posted');approveFundingBatch(stale.id,true,'退货明细已更新');$('role').value='sales';const next=requestEarnReturn(b.id);
  for(const role of ['business','finance']){$('role').value=role;approveFundingBatch(next.id,false,'')}
  let duplicate=false;try{requestEarnReturn(b.id)}catch{duplicate=true}
  return [blocked,duplicate,next.returnIds.length,f.credits.length,f.credits[1].amount,f.credits[1].service,fundingPoolTotals(MAIN_POOL).gap,JSON.stringify(state.activities.at(-1).shares)===JSON.stringify(shares)];
 });assert.deepEqual(audit,[true,true,2,2,-30000,-15000,12000,true]);await edge.close();console.log('PASS 核验中新增退货拦截旧金额，驳回重报，已占用不改写，来源缺口120元，禁止重复冲回');
 assert.deepEqual(errors,[]);
}finally{await browser.close()}
