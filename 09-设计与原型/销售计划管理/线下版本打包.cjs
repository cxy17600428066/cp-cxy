const fs=require('fs'),path=require('path');
let html=fs.readFileSync(path.join(__dirname,'脱骨侠-生产管理-计划管理-单文件演示版.html'),'utf8');
html=html.replaceAll('tgx_sales_planning_standalone_20261014','tgx_sales_planning_offline_v1_20261028').replaceAll('tgx_standalone_','tgx_offline_v1_');
html=html.replace('<title>脱骨侠生产管理 · 计划管理演示版</title>','<title>脱骨侠生产管理 线下计划管理 V1</title>');
// Independent release: strip embedded legacy flow document and replace with a scoped flow.
html=html.replace(/(<script type="application\/json" id="standaloneFlowSource">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>body{font:16px Microsoft YaHei;padding:32px;color:#173154}li{margin:20px 0;line-height:1.8}</style><h1>线下计划管理流程</h1><ol><li>省区销售按客户填写多个商品，月度与周计划独立保存、提交。</li><li>大区审核省区汇总，中心审核大区汇总，严总审核中心汇总。可下钻客户商品；当前待审节点可修改数量并填写原因，保存后仍待审核。</li><li>驳回记录返回销售修改并重新提交，保留原审批历史。</li><li>计划部门按月度或周度周期查看汇总及全部前置审批，确认后生效。</li><li>生效计划普通或加急数量调整由销售在原计划发起，计划部门确认后生效。加急只提高处理优先级。</li><li>开始前内容调整走原销售审核链和计划部门确认。原执行版本在新版本确认前保留。</li><li>OMS按下单时间提供实际销售，按权限展示计划达成、客户商品销量及月周对比。</li></ol></html>')+b);
const hook=`
window.OfflineEdition={clean(d){
 const keep=new Set(d.plans.filter(p=>p.business==='offline').map(p=>p.id));
 d.plans=d.plans.filter(p=>keep.has(p.id));d.orders=d.orders.filter(o=>o.business==='offline');
 for(const k of ['adjustments','taskConfirmations','reviewEdits'])if(Array.isArray(d[k]))d[k]=d[k].filter(x=>keep.has(x.plan));
 for(const k of ['submissionBatches','closedLoopExamples','demoScenarios'])if(Array.isArray(d[k]))d[k]=d[k].filter(x=>x.business!=='online'&&!['线上运营','线上领导','丹总'].includes(x.role));
 d.edition='offline-v1';return d;
},decorate(){
 document.querySelectorAll('[data-business="online"],option[value="online"],#role option').forEach(e=>{if(e.dataset.business==='online'||e.value==='online'||['线上运营','线上领导','丹总'].includes(e.value))e.remove();});
 document.querySelectorAll('[data-filter="business"],[data-filter="channel"]').forEach(e=>e.closest('label')?.remove());
 document.querySelectorAll('.business-switch').forEach(e=>e.remove());
 document.querySelectorAll('select[name="business"] option').forEach(e=>{if(e.value!=='offline'&&e.textContent!=='线下')e.remove();});
 document.querySelectorAll('header .muted').forEach(e=>e.textContent='第一版 · 线下计划管理');
}};
`;
html=html.replace('(() => {\n',hook+'\n(() => {\n');
// Main module is CRLF in some source checkouts.
if(!html.includes('window.OfflineEdition='))html=html.replace('(() => {\r\n',hook+'\n(() => {\r\n');
if(!html.includes('window.OfflineEdition='))throw Error('main hook missing');
html=html.replace('PlanBusiness.initialize(d);','OfflineEdition.clean(d);PlanBusiness.initialize(d);');
html=html.replace('function render(){window.InteractionPolish','function render(){OfflineEdition.clean(d);filters.business="offline";if(["线上运营","线上领导","丹总"].includes(role))role="省区填报";window.InteractionPolish');
html=html.replace('OrderPolicy.end(d);','OrderPolicy.end(d);OfflineEdition.decorate();');
html=html.replace("['省区填报','线上运营','大区审核','中心审核','严总','线上领导','丹总','计划部门','商品管理员','规则管理员']","['省区填报','大区审核','中心审核','严总','计划部门','商品管理员','规则管理员']");
// Clean before every persistence, including initial sample generation.
html=html.replace('M.save(d);storageBaseline','OfflineEdition.clean(d);M.save(d);storageBaseline');
html=html.replaceAll('汇集线上、线下需求计划，为后续生产安排提供已确认的计划依据。线下月、周计划统一按省区、客户、商品填报，线上按渠道填报。','按省区、客户、商品提报月度和周计划，逐级审核后由计划部门确认生效。');
html=html.replaceAll('交互演示数据 · OMS、旺店通及 OA 未接入真实系统。','线下计划管理 · 使用本地测试数据，OMS 尚未接入。');
html=html.replaceAll('!d.orderPolicies.offline.version||!d.orderPolicies.online.version','!d.orderPolicies.offline.version');
html=html.replaceAll('客户/渠道','客户').replaceAll('客户 / 渠道','客户').replaceAll('客户／渠道','客户');
html=html.replace(/<option value="online">[^<]*<\/option>/g,'').replaceAll("['offline','online']","['offline']").replaceAll("['全部','线上','线下']","['线下']");
html=html.replaceAll('线下来源OMS，线上来源旺店通。','数据来源 OMS。').replaceAll('线下OMS订单、线上旺店通接口订单','OMS销售订单');
process.stdout.write(html);
