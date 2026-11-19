import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {visit,visitFunding} from './qa-workspace.mjs';
const {chromium}=createRequire(process.execPath)('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await browser.newPage(), errors=[];p.setDefaultTimeout(4200);p.on('pageerror',e=>errors.push(e.message));
const root=new URL('./原型.html',import.meta.url).href;
try{await p.goto(root);assert.deepEqual(await p.locator('#nav button span:last-child').allTextContents(),['客户台账','策略与方案','资金管理','活动与审批','结算与对账']);
 assert.equal(await p.locator('#ledgerCustomerRows [data-customer-ledger]').count(),await p.locator('#ledgerCustomerRows tbody tr').count());
 await p.goto(root+'#/pools');await p.waitForSelector('[data-funding-pool-new]');assert.match(p.url(),/funding\?tab=pools/);await p.getByText('按组织查看分配与占用',{exact:true}).click();assert.equal(await p.locator('details.inline-disclosure table tbody tr').count(),16);
 await p.goto(root+'#/pools/fundStrategy/STR-001');await p.waitForSelector('#dealerRuleForm');assert.match(p.url(),/programs\/strategy\/STR-001/);assert.equal(await p.locator('#ruleFundSource').count(),1);await p.reload();assert.equal(await p.locator('#ruleFundSource').count(),1);
 await p.goto(root+'#/funding?tab=bindings');await p.waitForSelector('#policyRows');assert.equal(await p.locator('[data-funding-binding="LINK-002"]').count(),1);
 // 通过实际销售、核验与审批生成 A 的应付，以测试 B 的结算范围。
 await p.evaluate(()=>{const f=state.funding;f.date='2026-12-31';const g=fundingGroups().find(g=>g.customer==='A'&&g.kind==='rebate'&&g.ready);const b=prepareFundingBatch(g.key);$('role').value='business';approveFundingBatch(b.id);$('role').value='finance';approveFundingBatch(b.id);save()});
 await visit(p,'ledger');await p.locator('[data-customer-ledger="B"]').first().click();await p.locator('[data-client-settlements="B"]').click();assert.match(p.url(),/customer=B/);assert.equal(await p.locator('[data-funding-batch]').count(),0);await p.reload();assert.match(await p.locator('h1').innerText(),/宁波/);assert.equal(await p.locator('[data-funding-batch]').count(),0);await p.locator('[data-settlements-all]').click();assert.ok(await p.locator('[data-funding-batch]').count()>0);await p.goBack();assert.equal(await p.locator('[data-funding-batch]').count(),0);
 await visit(p,'exceptions');assert.ok((await p.locator('#workspace').innerText()).includes('已对平'));assert.ok(!(await p.locator('#workspace').innerText()).includes('存在差异'));await visit(p,'approval');assert.equal(await p.locator('#workspace section.card').count(),1);
 await p.setViewportSize({width:390,height:844});for(const k of ['policies','programs','calculator','funding','activities','approval','settlement','exceptions','rules','ledger']){await visit(p,k);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),k)}assert.deepEqual(errors,[]);console.log('PASS: 五个主入口、旧链接、组织分配、策略详情、合同配置、客户结算隔离及刷新返回、对账、统一待审、手机布局');}finally{await browser.close()}
