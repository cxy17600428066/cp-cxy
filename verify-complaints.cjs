const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('E:/cxy/客诉质量分析平台.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
scripts.forEach(s=>new Function(s));
const nodes=new Map();
function element(){return {value:'全部',textContent:'',innerHTML:'',style:{},dataset:{},children:[],classList:{toggle(){}},append(){},before(){},prepend(){},insertBefore(){},setAttribute(){},querySelectorAll(){return []},insertAdjacentHTML(){},showModal(){},close(){}}}
const document={querySelector(s){if(!nodes.has(s))nodes.set(s,element());return nodes.get(s)},querySelectorAll(){return []},createElement:element};
document.querySelector('#search').value='';
const context=vm.createContext({document,localStorage:{getItem(){return null},setItem(){}},console,setTimeout,Blob,URL});
scripts.forEach(s=>vm.runInContext(s,context));
function check(code){if(!vm.runInContext(code,context))throw Error(code)}
check('filtered().length===12');
check('meta[data[5][0]].batch===meta[data[1][0]].batch');
check('Object.values(meta).filter(x=>x.loss===null).length===3');
check('Object.values(meta).reduce((s,x)=>s+(x.loss||0),0)===1447');
check('Object.values(meta).filter(x=>x.unit==="袋").reduce((s,x)=>s+x.qty,0)===48');
check('Object.values(meta).filter(x=>x.unit==="千克").reduce((s,x)=>s+x.qty,0)===18');
vm.runInContext('channel="线上";render()',context);check('filtered().length===6');
vm.runInContext('channel="全部";document.querySelector("#batch").value="LM1002";render()',context);check('filtered().length===2');
vm.runInContext('document.querySelector("#batch").value="全部";document.querySelector("#search").value="不存在";render()',context);check('filtered().length===0');
document.querySelector('#reset').onclick();check('filtered().length===12');
console.log('PASS: syntax, initialization, counts, amounts, units, channel/batch filters, empty state and reset');
