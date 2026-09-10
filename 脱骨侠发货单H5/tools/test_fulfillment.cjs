const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const base=path.resolve(__dirname,'..'),F=require(path.join(base,'履约规则.js'));
for(const file of ['发货时效预警策略.html','履约节点配置.html','商品发货时效配置.html','客户到货时效配置.html']){
 const html=fs.readFileSync(path.join(base,file),'utf8');for(const [i,m] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries())new vm.Script(m[1],{filename:file+':'+i});
}
const t=s=>Date.parse('2026-09-10T'+s+':00+08:00');
const rules=['finance','accept','ship','pickup','sign','receipt'].map(id=>({id,value:24,warn:75,on:true}));
const order={id:'o1',type:'standard',stock:'stock',receiptRequired:true,rules,events:{submittedAt:t('08:00'),factoryAcceptedAt:t('09:00'),financeApprovedAt:null},lines:[{key:'1',qty:10,stock:24,noStock:72}]};
assert.equal(F.canSync(order.events),false);assert.equal(F.canSync({...order.events,financeApprovedAt:t('10:00')}),true);
assert.equal(F.stage(order,null,'ship',t('10:00')).start,t('09:00'));
assert.equal(F.stage({...order,stock:'noStock'},null,'ship',t('10:00')).deadline,t('09:00')+72*3600000);
assert.equal(F.normalize({wmsReceivedAt:t('10:00')}).shippedAt,null);
assert.equal(F.at(F.normalize({wmsReceivedAt:t('10:00'),trackingCreatedAt:t('11:00'),trackingNumber:'A'}).shippedAt),t('11:00'));
const s={id:'s1',lines:[{key:'1',qty:4,orderId:'o1'}],events:{wmsOutboundAt:t('12:00')}};
assert.equal(F.validateLinks(order,[s]),false);assert.throws(()=>F.validateLinks(order,[{...s,lines:[{key:'1',qty:11,orderId:'o1'}]}]));
const uploaded=F.upload(s,t('13:00'),{name:'a.pdf'}),again=F.upload({...uploaded,receiptReview:'已驳回'},t('15:00'),{name:'b.pdf'});
assert.equal(again.events.firstReceiptUploadedAt,t('13:00'));assert.equal(again.events.signedAt,t('13:00'));assert.equal(again.receiptReview,'待审核');
assert.equal(F.stage(order,again,'receipt',t('16:00')).state,'completed');
assert.equal(F.stage({...order,receiptRequired:false},s,'receipt').state,'skipped');
assert.throws(()=>F.upload({events:{}},t('13:00'),{name:'a.pdf'}));
assert.equal(F.normalize({signedAt:t('12:30'),receiptUploadedAt:t('13:00')}).signedAt,t('12:30'));
assert.equal(F.stage({...order,stock:''},null,'ship').state,'awaiting');
assert.equal(F.stage(order,null,'ship',t('09:00')+24*3600000).state,'overdue');
const both={...s,events:{wmsReceivedAt:t('10:00'),trackingCreatedAt:t('11:00'),trackingNumber:'A'}};
assert.equal(F.stage(order,both,'ship').state,'completed');
assert.equal(F.stage({...order,type:'system',arrival:t('18:00'),customerRule:{ship:2,warning:1,receipt:24}},both,'ship').deadline,t('16:00'));
console.log('PASS: four page scripts compile; 17 fulfillment boundary assertions pass');
