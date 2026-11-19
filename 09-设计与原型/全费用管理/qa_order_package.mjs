import assert from 'node:assert/strict';
import {createRequire} from 'node:module';import {visit,visitFunding} from './qa-workspace.mjs';
const {chromium}=createRequire(process.execPath)('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),errors=[];
try{for(const mode of ['direct','balance']){
 const page=await browser.newPage();page.setDefaultTimeout(5200);page.on('pageerror',e=>errors.push(e.message));const q=s=>page.locator(s).first();
 await page.goto(new URL('./原型.html',import.meta.url).href);await visit(page,'policies');await q('#role').selectOption('finance');await q('[data-funding-binding="LINK-003"]').click();await q('#fbRedeem').selectOption(mode);await q('#fbRate').fill('2');await q('#fbService').fill('3');await q('#fbRelease').selectOption('review');await q('#fundingBindingForm button[type=submit]').click();
 const snap=await page.evaluate(()=>{
 const f=state.funding;f.rules.push({...clone(f.rules[0]),id:'GET-SKU-X',name:'SKU-X 10%',sku:'X',method:'rate',rate:10});const before=fundingPoolTotals(MAIN_POOL);
 const s=postFundingSale({kind:'sale',customer:'C',sku:'X',doc:'ORDER-C',line:'1',base:10000000,qty:100,date:f.date});const row=packageLines()[0];return {id:s.id,before:before.available,after:fundingPoolTotals(MAIN_POOL).available,values:[row.total,row.rebate,row.service,row.held,row.available]};
 });assert.deepEqual(snap.values,[1000000,200000,300000,500000,0]);assert.equal(snap.before,snap.after);
 await visitFunding(page,'pools');await q('[data-order-unlock]').click();await q('#releasePackageRef').fill('客户验收-001');await q('#releasePackageForm button').click();const unlocked=await page.evaluate(()=>fundingPoolTotals(MAIN_POOL).available);assert.equal(unlocked-snap.before,500000);
 const batch=await page.evaluate(()=>{const f=state.funding;f.date='2026-12-31';$('role').value='sales';const g=fundingGroups().find(g=>g.customer==='C'&&g.kind==='rebate'),b=prepareFundingBatch(g.key);for(const role of ['business','finance']){$('role').value=role;approveFundingBatch(b.id,false,'核对完成')}return b});
 assert.equal(batch.redeemMode,mode);assert.equal(await page.evaluate(()=>fundingPoolTotals(MAIN_POOL).available),unlocked);assert.equal(await page.evaluate(()=>state.funding.pools.some(p=>p.id==='REBATE-C')),mode==='balance');assert.equal(await page.evaluate(()=>state.funding.payouts.length),0);
 // Changing future terms cannot redirect this batch; a forged attempt to use both paths is rejected.
 const blocked=await page.evaluate(({batch,mode})=>{state.funding.bindings.find(x=>x.customer==='C').redeemMode=mode==='balance'?'direct':'balance';try{recordRedemption(batch,100,mode==='balance'?'cash':'use','WRONG','REF')}catch{return true}return false},{batch,mode});assert.ok(blocked);
 await visit(page,'settlement');await q('[data-funding-payout="'+batch.id+'"]').click();assert.equal(await q('#rebatePayMethod option').count(),1);assert.equal(await page.locator('#rebatePayMethod option').count(),mode==='direct'?2:1);
 if(mode==='balance')await q('#rebateUseOrder').selectOption('ORDER-C');else await q('#rebatePayMethod').selectOption('offset');
 await q('#rebatePayAmount').fill('500');await q('#rebatePayRef').fill('C-001');await q('#fundingPayoutForm button').click();await page.reload();
 const end=await page.evaluate(()=>[fundingPoolTotals(MAIN_POOL).available,redeemedCustomer('C'),state.funding.payouts[0].method,redeemedCustomer('B').balance]);assert.equal(end[0],unlocked);assert.equal(end[3],0);assert.equal(end[1][mode==='balance'?'balance':'direct'],150000);assert.equal(end[1][mode==='balance'?'used':'paid'],50000);
 assert.equal(end[2],mode==='balance'?'use':'offset');
 const limits=await page.evaluate(id=>{const b=state.funding.batches.find(x=>x.id===id),method=b.redeemMode==='balance'?'use':'cash';$('role').value='finance';return [[1,'C-001'],[160000,'OVER']].map(([amount,ref])=>{try{recordRedemption(b,amount,method,ref,'ORDER')}catch{return true}return false})},batch.id);assert.deepEqual(limits,[true,true]);
 await visitFunding(page,'pools');await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.close();console.log('PASS '+mode+'：按行计提、条件解锁、核定分流、限额与凭证、实际办理及刷新');
}assert.deepEqual(errors,[])}finally{await browser.close()}
