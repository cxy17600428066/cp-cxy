const {spawnSync}=require('child_process'),path=require('path');
const suites=['计划流程工作台-验收.cjs','历史销售查询-验收.cjs','月周预测复盘-验收.cjs','计划业务补充-验收.cjs','普通数量调整-验收.cjs','分级计划汇总-验收.cjs','计划开始前调整-验收.cjs','月周独立列表-验收.cjs','左右适配-验收.cjs'];
for(const suite of suites){const r=spawnSync(process.execPath,[path.join(__dirname,suite)],{stdio:'inherit'});if(r.status!==0){process.exitCode=r.status||1;break;}}
