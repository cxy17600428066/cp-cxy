const{chromium}=require('E:/cxy/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'}),p=await b.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///E:/cxy/09-设计与原型/计划发货管理-交互原型.html');await p.evaluate(()=>{state=seed();migrateWorkflow();migratePlannerResults();migrateOmsShipping();let a=state.orders[0],w={...a,orderIds:['SO-001','SO-002'],weight:20,boxes:10,length:50,width:40,height:30,product:'kyNext',manualTotal:350,manualHours:48,manualSource:'OMS演示测试用方案',due:now()+96*H};let q=quoteProducts(w).find(q=>q.id==='kyNext');state.plans=[{...w,id:'PL-OMS-TEST',status:'published',version:1,createdBy:'计划部 · 张敏',created:now()-H,publishedAt:now()-H,estimate:{status:'confirmed',planVersion:1,quote:q,createdBy:'计划部 · 张敏',updatedAt:now(),package:{weight:20,boxes:10,length:50,width:40,height:30},configSnapshot:JSON.parse(JSON.stringify(state.config))},logs:['计划部下达演示方案']}];state.orders.filter(o=>w.orderIds.includes(o.id)).forEach(o=>o.status='occupied');save();render()});

for(const role of ['planner','warehouse']){
 await p.locator('#role').selectOption(role);
 assert.equal(await p.locator('button[onclick^="shipmentDetail"],button[onclick^="registerShipment"]').count(),0);
 assert.match(await p.locator('tbody tr').first().locator('td').nth(5).innerText(),/未发货/);
 await p.getByRole('button',{name:role==='warehouse'?'查看结果':'查看详情',exact:true}).click();
 assert.equal(await p.locator('#modalBody h3').filter({hasText:/发货状态/}).count(),0);
 await p.getByRole('button',{name:'关闭弹窗',exact:true}).click();
}
await p.evaluate(()=>applyOmsOrderUpdates([{orderId:'SO-001',shippingStatus:'shipped',updatedAt:now()+1000,source:'demo'}]));
assert.match(await p.locator('tbody tr').first().locator('td').nth(5).innerText(),/部分发货/);
await p.locator('select[aria-label="筛选发货状态"]').selectOption('shipped');
assert.equal(await p.evaluate(()=>displayedPlans().length),0);
await p.locator('select[aria-label="筛选发货状态"]').selectOption('partial');
assert.equal(await p.evaluate(()=>displayedPlans().length),1);
const [download]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'导出 Excel',exact:true}).click()]);
assert.match(download.suggestedFilename(),/xlsx$/);
await p.screenshot({path:__dirname+'/列表发货状态-验收.png',fullPage:true});
assert.deepEqual(errors,[]);
await b.close();console.log('PASS: 两角色无发货操作；列表OMS状态与筛选正常；详情无发货区；导出正常；无脚本错误');
})().catch(e=>{console.error(e);process.exit(1)});
