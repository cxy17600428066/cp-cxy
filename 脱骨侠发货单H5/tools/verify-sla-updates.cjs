const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
let checks=0;
function test(name,run){run();checks++;console.log('PASS '+name)}
function page(file,initial={}){
 const html=fs.readFileSync(path.join(root,file),'utf8'),script=html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)[1];
 const elements=new Map(),storage={...initial},listeners={};
 function el(id){
  if(!elements.has(id))elements.set(id,{id,value:'',innerHTML:'',textContent:'',hidden:false,checked:false,open:false,options:[],dataset:{},style:{},elements:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(n,f){this[n]=f},querySelectorAll(){return []},focus(){},showModal(){this.open=true},close(){this.open=false},reset(){}});
  return elements.get(id);
 }
 el('productSource').value='all';
 const context={document:{getElementById:el,querySelector:el,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},window:{addEventListener:(k,f)=>(listeners[k]??=[]).push(f)},location:{hash:'#flow',replace(){}},crypto:require('node:crypto'),console,setTimeout(){},confirm:()=>true};
 vm.createContext(context);vm.runInContext(script,context,{filename:file});
 return {ctx:context,el,storage,html,run:code=>vm.runInContext(code,context)};
}
const o=page('发货时效预警策略.html'),rules={finance:72,accept:60,ship:48,pickup:36,warning:2,receipt:24,escalation:2};
const first=o.run("boardRows('all')[0].o[0]"),name=o.run("boardRows('all')[0].o[1]");
test('ordinary order count and original elapsed time unchanged',()=>{assert.equal(o.run("boardRows('all').length"),15);assert.equal(o.run("records('sign').find(x=>x.o[4]===97.2).o[4]"),97.2)});
test('ordinary clients do not require arrival dates',()=>assert.equal(o.run("boardRows('all').filter(x=>boardMatch(x,'missing')).length"),0));
test('ordinary severity counts preserved',()=>assert.deepEqual(JSON.parse(o.run("JSON.stringify(tally(boardRows('all')))")),{all:15,normal:6,warning:4,overdue:5,awaiting:0,paused:0}));
const customer={id:'test-client',name,code:'C-1',type:'system',mode:'default',systemName:'测试连锁'};
o.storage['shipping-customer-arrival-v1']=JSON.stringify({clients:[customer],defaultRule:rules});
test('missing arrival only counts system clients',()=>{assert.equal(o.run("boardRows('all').filter(x=>boardMatch(x,'missing')).length"),1);assert.equal(o.run("boardRows('system')[0].level"),'awaiting')});
test('system stage cards describe customer deadlines',()=>{o.run("customerView='system'");const h=o.ctx.boardOverview();assert(h.includes('按客户要求到货时间倒排'));assert(h.includes('签收后按客户规则计时'));assert(!h.includes('普通订单 2 小时'))});
const setProfile=code=>o.run("Object.assign(omsProfiles["+JSON.stringify(first)+"],"+code+")");
setProfile("{customerRequiredArrivalAt:'2026-09-12T10:00:00'}");
test('known deadline without completion evidence stays awaiting',()=>{const x=o.run("boardRows('system')[0]");assert.equal(x.sla.at,Date.parse('2026-09-09T10:00:00+08:00'));assert.equal(x.level,'awaiting');assert(o.ctx.nodeDeadlineInfo(x).includes('本节点最晚完成'))});
const now=Date.parse('2026-09-09T09:00:00+08:00');
const task=(id,profile,custom=rules)=>o.ctx.withCustomerDeadline({r:{id,value:2,warn:80,on:true},o:['test',name,'¥1','',1],client:customer,p:profile},{defaultRule:custom},now);
test('finance and factory deadlines remain independent',()=>{
 const p={customerRequiredArrivalAt:'2026-09-12T10:00:00',events:{submittedAt:'2026-09-09T07:00:00',financeApprovedAt:null,factoryAcceptedAt:null}};
 const a=task('finance',p),b=task('accept',p);assert.equal(a.level,'warning');assert.equal(b.level,'normal');assert.equal(b.sla.at-a.sla.at,12*3600000);
 const swapped={...rules,finance:50,accept:70};assert(task('finance',p,swapped).sla.at>task('accept',p,swapped).sla.at);
});
test('exact cutoff becomes overdue',()=>{const p={customerRequiredArrivalAt:'2026-09-12T09:00:00',events:{submittedAt:'2026-09-09T07:00:00',financeApprovedAt:null}};assert.equal(task('finance',p).level,'overdue')});
test('missing completion field never means overdue',()=>{const p={customerRequiredArrivalAt:'2026-09-10T09:00:00',events:{submittedAt:'2026-09-08T07:00:00'}};assert.equal(task('finance',p).level,'awaiting')});
test('receipt starts at actual signature and needs no arrival date',()=>{
 const p={events:{signedAt:'2026-09-09T08:00:00',receiptUploadedAt:null}},x=task('receipt',p);
 assert.equal(x.sla.at,Date.parse('2026-09-10T08:00:00+08:00'));assert.equal(x.level,'normal');
 const pending=task('receipt',{events:{signedAt:null,receiptUploadedAt:null}});assert.equal(pending.sla.at,null);assert.equal(pending.level,'awaiting');
});
test('future signature does not start receipt',()=>{assert.equal(task('receipt',{events:{signedAt:'2026-09-10T08:00:00',receiptUploadedAt:null}}).sla.at,null)});
test('invalid rule never falls back to generic hours',()=>{const x=task('ship',{customerRequiredArrivalAt:'2026-09-12T10:00:00'},{...rules,ship:1000});assert.equal(x.sla.at,null);assert.equal(x.level,'awaiting')});
test('order-owned snapshot takes priority over current client settings',()=>{const x=task('finance',{customerRequiredArrivalAt:'2026-09-12T10:00:00',ruleSnapshot:{type:'system',rule:{...rules,finance:80}}});assert.equal(x.sla.at,Date.parse('2026-09-09T02:00:00+08:00'));assert.equal(x.sla.ruleName,'按订单保存规则计算')});
test('parallel tasks count as one order',()=>{
 setProfile("{events:{submittedAt:'2026-09-01T21:39:42',financeApprovedAt:null,factoryAcceptedAt:null}}");
 const x=o.run("boardRows('system')[0]");assert.equal(x.tasks.length,2);assert.equal(o.run("boardRows('all').length"),15);assert.equal(new Set(x.tasks.map(t=>t.r.id)).size,2);
});
test('detail follows selected parallel node and customer rule',()=>{o.run("selectedNode='accept'");o.ctx.openOrder(first);const h=o.el('orderDetail').innerHTML;assert(h.includes('当前节点：<b>工厂接单</b>'));assert(h.includes('本节点最晚完成'));assert(!h.includes('节点时效：1 小时'))});
test('order lookup supports order number, customer and inclusive Shanghai dates',()=>{
 const x={o:['O123','连锁商超'],p:{createdAt:'2026-09-01T15:59:59Z'}},match=q=>o.ctx.orderMatchesSearch(x,{orderNo:'',customer:'',start:'',end:'',...q});
 assert(match({orderNo:'o12',customer:'连锁',start:'2026-09-01',end:'2026-09-01'}));assert(!match({end:'2026-08-31'}));assert(!match({customer:'不匹配'}));
 x.p.createdAt='2026-09-01T16:00:00Z';assert(!match({end:'2026-09-01'}));assert(match({start:'2026-09-02',end:'2026-09-02'}));
});
test('search applies to orders route and overview without changing top metrics',()=>{
 o.run("group='orders';selectedNode=null;orderSearch={orderNo:"+JSON.stringify(first)+",customer:'',start:'',end:''}");
 let h=o.ctx.nodeDetail();assert.equal((h.match(/<article class="oms-order">/g)||[]).length,1);assert(h.includes('当前查询'));
 o.run("group='flow';customerView='all'");assert.equal(o.run("boardRows('all').length"),15);assert.equal((o.ctx.nodeDetail().match(/<article class="oms-order">/g)||[]).length,1);
 o.ctx.resetOrderSearch();assert.equal((o.el('inlineOrderDetails').innerHTML.match(/<article class="oms-order">/g)||[]).length,15);
});
test('invalid range is rejected without replacing applied query',()=>{
 o.ctx.applyOrderSearch({preventDefault(){},currentTarget:{elements:{orderNo:{value:''},customer:{value:''},start:{value:'2026-09-03'},end:{value:'2026-09-01'}}}});
 assert(o.el('orderQueryError').textContent.includes('开始日期'));assert.equal(o.run('orderSearch.start'),'');
});
const p=page('商品发货时效配置.html');
test('original per-product defaults preserved',()=>{assert.equal(p.run('productRows().length'),16);assert(p.run('productRows().every(p=>p.stock===24&&p.noStock===72)'))});
test('picker opens with catalog and supports name/code search',()=>{
 p.ctx.openEditor();assert.equal((p.el('skuPickerResults').innerHTML.match(/class="sku-choice"/g)||[]).length,16);
 p.el('skuPickerQuery').value='2188';p.ctx.renderSkuPicker();assert.equal((p.el('skuPickerResults').innerHTML.match(/class="sku-choice"/g)||[]).length,1);assert(p.el('skuPickerResults').innerHTML.includes('388克'));
 p.el('skuPickerQuery').value='柠檬';p.ctx.renderSkuPicker();assert(p.el('skuPickerResults').innerHTML.includes('2283'));
});
test('checkbox selection persists across search and supports pasted unknown codes',()=>{
 p.ctx.togglePickerSku({dataset:{pickerSku:'2188'},checked:true});assert.equal(p.el('planSkus').value,'2188');
 p.el('planSkus').value+='，abc\nABC';p.ctx.renderSkuPicker();assert.equal(p.el('skuSelectionCount').textContent,'已选 2 / 200');
 p.el('skuPickerQuery').value='2188';p.ctx.renderSkuPicker();assert(p.el('skuPickerResults').innerHTML.includes('data-picker-sku="2188" checked'));
 p.ctx.togglePickerSku({dataset:{pickerSku:'2283'},checked:true});assert.equal(p.el('planSkus').value,'2188\nABC\n2283');
 p.ctx.removePickerSku(1);assert.equal(p.el('planSkus').value,'2188\n2283');
});
test('picker enforces the 200-code limit',()=>{
 p.el('planSkus').value=Array.from({length:200},(_,i)=>'X'+i).join('\n');
 const input={dataset:{pickerSku:'2188'},checked:true};p.ctx.togglePickerSku(input);assert.equal(input.checked,false);assert(p.el('planError').textContent.includes('200'));
});
test('save, reopen and cancel preserve existing plans',()=>{
 p.ctx.openEditor();p.el('planName').value='测试方案';p.el('planStock').value='12';p.el('planNoStock').value='48';p.el('planEnabled').checked=true;
 p.ctx.togglePickerSku({dataset:{pickerSku:'2188'},checked:true});p.ctx.savePlan();
 assert.equal(p.run('state.plans[0].skus[0]'),'2188');assert.equal(p.run("resolveScheme('2188').hours"),12);
 p.ctx.openEditor(0);assert(p.el('skuPickerResults').innerHTML.includes('data-picker-sku="2188" checked'));
 p.ctx.removePickerSku(0);p.ctx.closeEditor();assert.equal(p.run('state.plans[0].skus[0]'),'2188');
});
test('conflicting enabled plans remain blocked',()=>{
 p.ctx.openEditor();p.el('planName').value='重复商品';p.el('planStock').value='12';p.el('planNoStock').value='48';p.el('planEnabled').checked=true;p.el('planSkus').value='2188';
 assert.throws(()=>p.ctx.savePlan(),/已关联其他启用方案/);assert.equal(p.run('state.plans.length'),1);
});
test('empty picker, unknown query and HTML escaping',()=>{
 p.ctx.openEditor();p.el('skuPickerQuery').value='none';p.ctx.renderSkuPicker();assert(p.el('skuPickerResults').innerHTML.includes('没有匹配'));
 p.el('planName').value='无商品';assert.throws(()=>p.ctx.savePlan(),/1–200/);
 p.el('planSkus').value='<img onerror=bad>';p.ctx.renderSkuPicker();assert(!p.el('skuSelected').innerHTML.includes('<img'));
});
for(const file of ['履约节点配置.html','客户到货时效配置.html'])test(file+' initialization',()=>page(file));
console.log('\n'+checks+' checks passed.');
