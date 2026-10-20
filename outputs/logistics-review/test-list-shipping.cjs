const fs=require('fs');
let base=fs.readFileSync(__dirname+'/test-oms-shipping.cjs','utf8');
let prefix=base.slice(0,base.indexOf("assert.equal(await p.getByRole"));
let checks=`
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
`;
fs.writeFileSync(__dirname+'/test-list-shipping-run.cjs',prefix+checks);
