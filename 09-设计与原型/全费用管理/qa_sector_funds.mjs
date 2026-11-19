import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {visit,visitFunding} from './qa-workspace.mjs';
const {chromium}=createRequire(process.execPath)('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const url=new URL('./原型.html',import.meta.url).href;
try{
  const context=await browser.newContext(),p=await context.newPage(),errors=[];
  p.setDefaultTimeout(4500);p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url);await visitFunding(p,'pools');
  assert.deepEqual(await p.locator('.sector-row summary > .sector-name').allTextContents(),['休食','餐饮','大客','私域']);
  assert.equal(await p.evaluate(()=>groupBalance()),0);
  await p.locator('[data-group-account=overview]').click();
  await p.locator('[data-group-account=deposit]').click();
  await p.locator('#groupAmount').fill('10000.01');await p.locator('#groupRef').fill('G-IN');
  await p.locator('#groupEntryForm button').click();
  assert.match(await p.locator('#fundingError').innerText(),/财务/);
  await p.locator('#role').selectOption('finance');await p.locator('#groupEntryForm button').click();
  await p.locator('[data-group-account=transfer]').waitFor();
  assert.equal(await p.evaluate(()=>groupBalance()),1000001);
  await p.locator('[data-group-account=transfer]').click();
  await p.locator('#groupTarget').selectOption('POOL-CATER');
  await p.locator('#groupLevel').selectOption('3');await p.locator('#groupAmount').fill('10001');
  await p.locator('#groupRef').fill('G-001');await p.locator('#groupEntryForm button').click();
  await p.getByRole('alert').filter({hasText:'集团余额不足'}).waitFor();
  await p.locator('#groupAmount').fill('3000.01');await p.locator('#groupEntryForm button').click();
  await p.locator('[data-group-account=transfer]').waitFor();await p.reload();
  assert.match(await p.locator('#workspace').innerText(),/江苏省区/);
  const position=await p.evaluate(()=>{
    const id=defaultSectorPool('C'),tot=fundingPoolTotals(id);
    return [groupBalance(),tot.source,tot.earned,tot.reserve,fundingOrgBalances(id).available,
      fundingPoolTotals(defaultSectorPool('B')).available,fundingPoolTotals(MAIN_POOL).available,
      state.funding.credits.length,state.funding.transfers.length,state.funding.groupJournal.length];
  });
  assert.deepEqual(position,[700000,300001,0,0,[0,0,0,300001],0,300000,0,0,2]);
  const invalid=await p.evaluate(async()=>{
    $('role').value='finance';const f=state.funding,id=defaultSectorPool('C');
    const request={kind:'transfer',amount:111,ref:'G-001',pool:id,level:1};
    const rejects=opts=>{try{buildGroupEntry({...request,...opts});return false}catch{return true}};
    const t=f.pools.find(x=>x.id===id);const cap=t.cap;t.cap=300001;
    const results=[rejects({}),rejects({ref:'CAP'}),rejects({ref:'WRONG',pool:'REBATE-X'}),rejects({ref:'LEVEL',level:0})];t.cap=cap;
    await commitGroupEntry({...request,ref:'G-002',level:2});await commitGroupEntry({...request,ref:'G-003',level:1});
    return [results,fundingOrgBalances(id).available,groupBalance(),state.funding.groupJournal.length];
  });
  assert.deepEqual(invalid,[[true,true,true,true],[0,111,111,300001],699778,4]);
  await visitFunding(p,'pools');await p.locator('.sector-row summary').filter({hasText:'餐饮'}).click();
  assert.match(await p.locator('details.sector-row[open]').innerText(),/江苏省区/);
  await visit(p,'activities');await p.locator('#role').selectOption('sales');await p.locator('[data-action=new]').click();
  await p.locator('#activitySourcePool').selectOption('POOL-CATER');
  assert.match(await p.locator('#apool option[value=province]').innerText(),/江苏/);
  await p.locator('#apool').selectOption('province');await p.locator('#aname').fill('餐饮试吃');
  await p.locator('#aamount').fill('3000');await p.locator('#apurpose').fill('使用餐饮江苏调拨额度');await p.locator('#arecipient').selectOption('苏州示例餐饮 C');
  await p.locator('#activityForm button[type=submit]').click();
  const id=await p.evaluate(()=>state.activities[0].id);await p.locator('#role').selectOption('pool3');
  await p.locator(`[data-detail="${id}"]`).click();await p.locator(`[data-approve="${id}"]`).click();
  assert.deepEqual(await p.evaluate(()=>fundingOrgBalances('POOL-CATER').available),[0,111,111,1]);
  const flows=await p.evaluate(()=>{
    const f=state.funding;
    return customers.map(c=>{
      const s=postFundingSale({customer:c.id,doc:'S-'+c.id,line:'1',kind:'sale',sku:'TEST',base:100000,qty:1,date:f.date});
      const r=postFundingSale({...s,doc:'R-'+c.id,kind:'return',original:s.id});
      return [s.rule.pool,r.rule.pool,fundingPoolTotals(s.rule.pool).earned];
    });
  });
  assert.deepEqual(flows,[['POOL-MAIN','POOL-MAIN',0],['POOL-KA','POOL-KA',0],['POOL-CATER','POOL-CATER',0],['POOL-PRIVATE','POOL-PRIVATE',0]]);
  await visit(p,'exceptions');assert.doesNotMatch(await p.locator('#workspace').innerText(),/存在差异/);
  await p.setViewportSize({width:375,height:820});
  for(const hash of ['#/funding?tab=pools','#/funding/groupAccount/overview','#/funding/groupAccount/transfer','#/funding?tab=flows']){
    await p.goto(url+hash);await p.waitForTimeout(80);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),hash);
  }
  const other=await p.context().newPage();await other.goto(url);
  const simultaneous=await Promise.all([p,other].map(tab=>tab.evaluate(async()=>{
    $('role').value='finance';
    try{await commitGroupEntry({kind:'transfer',pool:'POOL-PRIVATE',amount:550000,level:1,ref:'SIMULTANEOUS'});return true}catch{return false}
  })));
  assert.equal(simultaneous.filter(Boolean).length,1);await other.reload();
  assert.equal(await other.evaluate(()=>fundingPoolTotals('POOL-PRIVATE').incoming),550000);await other.close();
  const old=await browser.newPage();await old.goto(url);
  const migration=await old.evaluate(()=>{
    const f=state.funding,main=f.pools.find(p=>p.id===MAIN_POOL);
    f.pools=[main];main.name='全费用总资金池';delete main.sector;delete main.area;delete main.province;
    f.rules[0].pool=MAIN_POOL;for(const l of f.bindings)l.sourcePool=MAIN_POOL;
    const input={customer:'B',doc:'PRE',line:'1',kind:'sale',sku:'S',base:100000,qty:1,date:f.date};
    const previous=postFundingSale(input),snap=JSON.stringify(previous);
    delete f.sectorRevision;delete f.groupJournal;f.date='2026-11-18';initSectorFunds(f);ensureFunding();
    const signed=postFundingSale({...input,doc:'POST',date:f.date});
    const ret=postFundingSale({...input,doc:'RET',kind:'return',original:previous.id,date:f.date});
    return [f.pools.length,main.sector,previous.rule.pool,JSON.stringify(previous)===snap,signed.rule.pool,ret.rule.pool,groupBalance()];
  });
  assert.deepEqual(migration,[5,undefined,'POOL-MAIN',true,'POOL-KA','POOL-MAIN',0]);
  assert.deepEqual(errors,[]);
  console.log('PASS 四板块归属、集团入账与定向调拨、权限/余额/凭证/上限、活动占用、签收退货、历史版本与手机宽度');
}finally{await browser.close()}
