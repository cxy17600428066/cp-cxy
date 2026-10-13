const {spawnSync}=require('child_process'),path=require('path');
const suites=['已确认页面兼容-验收.cjs','任务确认审批详情-验收.cjs','业务闭环规则-验收.cjs','完整汇总审核-验收.cjs','计划任务确认-验收.cjs','历史销售查询-验收.cjs','月周预测复盘-验收.cjs','月周独立列表-验收.cjs','固定侧边导航-验收.cjs','左右适配-验收.cjs','原型页面走查-验收.cjs'];
for(const suite of suites){const r=spawnSync(process.execPath,[path.join(__dirname,suite)],{stdio:'inherit'});if(r.status!==0){process.exitCode=r.status||1;break;}}
