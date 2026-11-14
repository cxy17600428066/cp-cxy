import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-611-0_26.1112.611.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const p=await browser.newPage();await p.goto('http://127.0.0.1:8768/'+encodeURIComponent('原型.html'));
 await p.locator('[data-action="new"]').click();await p.locator('#aname').fill('四池联合支持测试');await p.locator('#apool').selectOption('multi');await p.locator('#arecipient').selectOption('宁波示例连锁 B');await p.locator('#aamount').fill('800.03');await p.locator('#apurpose').fill('客户A贡献统筹支持客户B，四池共同承担');await p.locator('#activityForm button[type="submit"]').click();
 const get=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('tgx-expense-prototype-v1')));
 let a=(await get()).activities[0];if(a.shares.reduce((a,b)=>a+b,0)!==80003)throw Error('分摊尾差未对平');
 for(const role of ['pool0','pool1','pool2','pool3']){await p.locator('#role').selectOption(role);await p.locator(`[data-detail="${a.id}"]`).click();await p.locator(`[data-approve="${a.id}"]`).click();a=(await get()).activities[0];if(role!=='pool3'&&a.status!=='pending')throw Error('未全部审批就占用')}
 if(a.status!=='approved')throw Error('四池审批完成未占用');
 await p.locator('#role').selectOption('sales');await p.locator('[data-nav="activities"]').first().click();await p.locator(`[data-verify="${a.id}"]`).click();await p.locator('#vamount').fill('600.01');await p.locator('#vevidence').fill('四池联合活动执行和验收记录');await p.locator('#verifyForm button').click();
 for(const role of ['business','finance']){await p.locator('#role').selectOption(role);await p.locator(`[data-detail="${a.id}"]`).click();await p.locator(`[data-approve="${a.id}"]`).click()}
 await p.locator('[data-nav="ledger"]').first().click();if(!(await p.locator('#workspace').innerText()).includes('2,399.99'))throw Error('多池核销未对平');
 console.log('PASS 四池独立授权、尾差分摊、跨客户受益、核销和结项对平');
 await p.goto(new URL('./原型.html',import.meta.url).href);if(!(await p.locator('h1').innerText()).includes('客户费用总台账'))throw Error('离线文件不能打开');console.log('PASS 独立HTML本地直接打开');
} finally { await browser.close() }
