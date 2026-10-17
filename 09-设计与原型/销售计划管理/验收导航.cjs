async function openView(page,key){
 const click=async selector=>{const button=page.locator(selector).first();await button.evaluate(e=>{const d=e.closest('details');if(d)d.open=true;});await button.click();};
 if(['urgentDemo','demoStates'].includes(key)){if(!await page.locator('#demoSceneMenu').count())await page.locator('#role').selectOption('计划部门');await click('#demoSceneMenu');return click(key==='urgentDemo'?'#readyUrgent':'#readyNodes');}
 if(key==='notifications')return click('#workspaceNotifications');
 if(key==='analysis'&&await page.locator('#role').inputValue()==='计划部门')return click('[data-nav-key=analysis]');
 if(['productSales','customerSales','salesHistory','analysis','monthRecap'].includes(key)){if(key==='salesHistory'&&await page.locator('#role').inputValue()==='计划部门'){await click('#demoSceneMenu');return click('#readySales');}await click('[data-nav-key=salesHub]');if(await page.locator('[data-workspace-tab="'+key+'"]').count())await click('[data-workspace-tab="'+key+'"]');return;}
 if(key==='review')return click('[data-nav-key=reviewHub]');
 if(key==='acceptance')return click('[data-nav-key=confirmHub],[data-nav-key=acceptance]');
 if(key==='adjustments'&&!await page.locator('[data-nav-key=adjustments]').count()){await click('[data-nav-key=confirmHub],[data-nav-key=reviewHub]');return click('[data-workspace-tab=adjustments]');}
 return click('[data-nav-key="'+key+'"]');
}
module.exports={openView};
