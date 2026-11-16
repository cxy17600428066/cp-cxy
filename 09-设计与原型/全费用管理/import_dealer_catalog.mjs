import fs from 'node:fs';import vm from 'node:vm';import {fileURLToPath} from 'node:url';
const source=fs.readFileSync('C:/Users/admin/Documents/New project/dealer-strategies.html','utf8');
function object(name){const start=source.indexOf('const '+name+'=');if(start<0)throw Error(name);const from=start+('const '+name+'=').length;const to=source.indexOf('\n};',from);return source.slice(from,to+2)}
const defaults=source.match(/const caseDefaults=(\{[^\n]+\});/)[1];
const data=vm.runInNewContext(`const d=${defaults};const b=${object('caseLibrary')};const e=${object('extraCases')};const n=${object('newBusinessTypes')};({d,b,e:{...e,...n}})`,{}, {timeout:1000});
const baseFields={
 '采购返利':[['threshold1','第一档门槛（元）',50000],['rate1','第一档比例 %',1],['threshold2','第二档门槛（元）',100000],['rate2','第二档比例 %',2],['threshold3','第三档门槛（元）',200000],['rate3','第三档比例 %',3],['mode','全额0 / 分段1',0],['cap','累计封顶（元）',20000]],
 '进货折扣':[['discount','折扣（折）',9.5],['minimum','起享金额（元）',10000],['cap','单笔封顶（元）',2000]],'回款奖励':[['rate','奖励比例 %',1],['days','至少提前天数',15],['cap','封顶（元）',5000]],'动销奖励':[['reward','每件奖励（元）',5],['cap','封顶（元）',3000]],'市场补贴':[['rate','补贴比例 %',50],['cap','封顶（元）',3000]]};
const baseInputs={'采购返利':[['amount','期间净采购额（元）',150000]],'进货折扣':[['amount','首次订单商品净额（元）',30000]],'回款奖励':[['amount','实际回款（元）',200000],['days','实际提前天数',15]],'动销奖励':[['quantity','凭证核验件数',800]],'市场补贴':[['amount','合规核销费用（元）',8000]]};
const baseCalc={
 '采购返利':`(p,v)=>{const t=[{min:p.threshold1,rate:p.rate1},{min:p.threshold2,rate:p.rate2},{min:p.threshold3,rate:p.rate3}];let n=0;if(!p.mode){n=v.amount*(t.filter(x=>v.amount>=x.min).at(-1)?.rate||0)/100}else t.forEach((x,i)=>n+=Math.max(0,Math.min(v.amount,t[i+1]?.min??v.amount)-x.min)*x.rate/100);return[Math.min(n,p.cap),'元','按全额或分段阶梯，扣除退货后核算；封顶控制']}`,
 '进货折扣':`(p,v)=>[v.amount>=p.minimum?Math.min(v.amount*(1-p.discount/10),p.cap):0,'元价格让利','仅首次有效采购订单，需核验首单资格']`,
 '回款奖励':`(p,v)=>[v.days>=p.days?Math.min(v.amount*p.rate/100,p.cap):0,'元','按实际回款及提前天数核验']`,
 '动销奖励':`(p,v)=>[Math.min(Math.floor(v.quantity)*p.reward,p.cap),'元','序列号和终端凭证核验后确认']`,
 '市场补贴':`(p,v)=>[Math.min(v.amount*p.rate/100,p.cap),'元','核销合规费用比例，受封顶控制']`};
const price=['进货折扣','满额减免','组合采购优惠','沉默经销商激活','新品试销支持'];const rebate=['采购返利','采购增长奖励','连续采购奖励','年度目标奖励','回款奖励','年返'];
const items=[...Object.entries(data.b),...Object.entries(data.e)].map(([kind,c],i)=>{const extra=!!data.e[kind],route=price.includes(kind)?'price':rebate.includes(kind)?'rebate':kind==='合同扣点'?'deduction':kind==='买赠 / 满赠'?'physical':'activity';return {id:'STR-'+String(i+1).padStart(3,'0'),kind,name:c.sName||c.name,rule:c.example||c.rule,note:c.sNote||c.note,route,stage:route==='price'?'订单定价':route==='rebate'?'期间达成核验':route==='deduction'?'合同结算扣款':route==='physical'?'领用出退库':'履约凭证核销',fields:extra?c.fields:baseFields[kind],inputs:extra?c.inputs:baseInputs[kind],params:Object.fromEntries((extra?c.fields:baseFields[kind]).map(f=>[f[0],f[2]])),values:Object.fromEntries((extra?c.inputs:baseInputs[kind]).map(f=>[f[0],f[2]])),sourceConfig:{...data.d,...(extra?{sNote:c.note}:c)},version:1,formula:extra?c.calc.toString():baseCalc[kind]}});
fs.writeFileSync(fileURLToPath(new URL('./dealer-catalog.js',import.meta.url)),`// 从用户指定页面提取的19类演示规则，保留类型、公式与口径。\nconst dealerCatalog=${JSON.stringify(items.map(({formula,...r})=>r),null,2)};\nconst dealerFormulas={${items.map(r=>JSON.stringify(r.id)+':'+r.formula).join(',\n')}};\n`);
console.log('Extracted '+items.length+' rule definitions; original file unchanged');
