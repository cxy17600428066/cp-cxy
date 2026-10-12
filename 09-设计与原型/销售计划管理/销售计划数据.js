(function(root){
  'use strict';
  const KEY='tgx_sales_planning_v3';
  const centers=['休食中心','餐饮中心','大客中心'];
  const areas={'华东区域':['上海','江苏','浙江'],'华南区域':['广东','广西','福建'],'华北区域':['北京','天津','河北'],'华西区域':['湖北','四川','重庆']};
  const channels=['天猫','京东','抖音'];
  const owners={'上海':'林可','江苏':'林可','浙江':'林可','广东':'周宁','广西':'周宁','福建':'周宁','北京':'王澄','天津':'王澄','河北':'王澄','湖北':'陈晨','四川':'陈晨','重庆':'陈晨'};
  const customers=[{name:'永辉华东大区',province:'上海'},{name:'盒马鲜生',province:'广东'},{name:'沃尔玛',province:'北京'},{name:'天虹到家',province:'湖北'},{name:'大润发华东',province:'江苏'}];
  const products=['川香红油','酸辣柠檬','麻辣藤椒','青椒脱脱','香辣泡椒'].map((name,i)=>({id:'SKU00'+(i+1),name:'脱骨侠'+name+'无骨鸡爪',enabled:true,scope:'全部',from:'2026-01-01',to:'',unit:'袋'}));
  const seedPlans=[
    {id:'PM001',kind:'month',business:'offline',center:'大客中心',area:'华东区域',province:'上海',customer:'',channel:'',product:'SKU001',start:'2026-10-01',end:'2026-10-31',qty:32000,owner:'林可',stage:3},
    {id:'PM002',kind:'month',business:'offline',center:'休食中心',area:'华南区域',province:'广东',customer:'',channel:'',product:'SKU002',start:'2026-10-01',end:'2026-10-31',qty:26000,owner:'周宁',stage:3},
    {id:'PW001',kind:'week',business:'offline',center:'大客中心',area:'华北区域',province:'北京',customer:'沃尔玛',channel:'',product:'SKU003',start:'2026-10-12',end:'2026-10-18',qty:6200,owner:'王澄',stage:0},
    {id:'PE001',kind:'month',business:'online',center:'',area:'',province:'',customer:'',channel:'天猫',product:'SKU001',start:'2026-10-01',end:'2026-10-31',qty:18000,owner:'线上运营',stage:1},
    {id:'PE002',kind:'week',business:'online',center:'',area:'',province:'',customer:'',channel:'抖音',product:'SKU004',start:'2026-10-12',end:'2026-10-18',qty:5000,owner:'线上运营',stage:-1}
  ].map(p=>({...p,unit:'袋',version:1,rejected:false,archived:false,history:[{at:'2026-10-01T08:00:00Z',action:'初始化演示计划',by:'演示数据',qty:p.qty}],versions:[{version:1,qty:p.qty,reason:'原始计划'}]}));
  const orders=[
    {id:'OMS1001',business:'offline',date:'2026-10-05',center:'大客中心',area:'华东区域',province:'上海',customer:'永辉华东大区',channel:'',product:'SKU001',qty:9800,unit:'袋',status:'有效',returned:0,source:'OMS'},
    {id:'OMS1002',business:'offline',date:'2026-10-08',center:'大客中心',area:'华东区域',province:'上海',customer:'永辉华东大区',channel:'',product:'SKU001',qty:12000,unit:'袋',status:'有效',returned:80,source:'OMS'},
    {id:'OMS1003',business:'offline',date:'2026-10-10',center:'休食中心',area:'华南区域',province:'广东',customer:'盒马鲜生',channel:'',product:'SKU002',qty:18000,unit:'袋',status:'有效',returned:680,source:'OMS'},
    {id:'OMS1004',business:'offline',date:'2026-10-13',center:'大客中心',area:'华北区域',province:'北京',customer:'沃尔玛',channel:'',product:'SKU003',qty:6200,unit:'袋',status:'有效',returned:0,source:'OMS'},
    {id:'WDT1001',business:'online',date:'2026-10-08',center:'',area:'',province:'',customer:'',channel:'天猫',product:'SKU001',qty:12000,unit:'袋',status:'有效',returned:100,source:'旺店通'},
    {id:'OMS1005',business:'offline',date:'2026-10-11',center:'餐饮中心',area:'华东区域',province:'江苏',customer:'大润发华东',channel:'',product:'SKU005',qty:1000,unit:'袋',status:'取消',returned:0,source:'OMS'}
  ];
  const seed=()=>({schema:3,plans:structuredClone(seedPlans),products:structuredClone(products),orders:structuredClone(orders),adjustments:[],productHistory:[],rules:{monthOpen:'',monthClose:'',weekClose:'',overlap:'pending',returns:'pending'},windows:{month:{open:'',close:''},week:{open:'',close:''}},manualLinks:{},demo:true});
  function load(){try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);if(d.schema!==3||!Array.isArray(d.plans))throw Error('数据格式不匹配');return d;}return seed();}catch(e){throw Error('无法读取计划数据，请检查浏览器存储权限。原有数据未覆盖。'+e.message);}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d));}
  function chain(p){return p.business==='online'?['丹总']:['大区审核','中心审核','严总'];}
  function match(p,o){return p.business===o.business&&p.product===o.product&&p.unit===o.unit&&o.date>=p.start&&o.date<=p.end&&(p.business==='online'?p.channel===o.channel:(p.center===o.center&&p.area===o.area&&p.province===o.province&&(p.kind==='month'||p.customer===o.customer)));}
  function linked(d,p){return d.orders.filter(o=>{const k=o.id+':'+p.kind;return Object.hasOwn(d.manualLinks,k)?d.manualLinks[k]===p.id:match(p,o);});}
  function actual(d,p){const list=linked(d,p);if(d.rules.overlap==='pending'||d.rules.returns==='pending'||list.some(o=>d.plans.filter(x=>x.kind===p.kind&&!x.rejected&&x.stage>=chain(x).length&&linked(d,x).some(v=>v.id===o.id)).length>1))return null;return list.reduce((s,o)=>s+(o.status==='取消'?0:o.qty)-(d.rules.returns==='net'&&o.status!=='取消'?o.returned:0),0);}
  function status(d,p){if(p.archived)return '已归档';if(p.rejected)return '已驳回';if(p.stage<0)return '草稿';return p.stage>=chain(p).length?'已确认':chain(p)[p.stage]+'中';}
  function windowState(d,kind,now=new Date()){const w=d.windows[kind];if(!w.open||!w.close)return '截止时间待配置';const n=now.getTime(),a=new Date(w.open).getTime(),b=new Date(w.close).getTime();if(n<a)return '未开始';if(n>b)return '已截止';return b-n<=86400000?'即将截止':'可填报';}
  root.SalesPlan={KEY,centers,areas,channels,owners,customers,seed,load,save,chain,match,linked,actual,status,windowState};
})(typeof window==='undefined'?globalThis:window);
