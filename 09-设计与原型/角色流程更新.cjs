const fs=require('fs'),path='E:/cxy/09-设计与原型/计划发货管理-交互原型.html';
let html=fs.readFileSync(path,'utf8');
const start=html.indexOf('// 旺店通同步业务入口');const end=html.indexOf("$('modal').addEventListener('cancel'",start);if(start<0||end<0)throw Error('同步模块未找到');html=html.slice(0,start)+html.slice(end);
html=html.split(/\r?\n/).filter(line=>!/^function (plansView|detail|syncPlan|shipPlan|cancelAsk|cancelPlan|risk|render|submitPlan|editDraft)\(/.test(line)).join('\n');
html=html.replace("function saveDraft(){if(wizard.step===2&&!validateStep())return;let p=buildPlan('draft');persistPlan(p);toast('草稿已保存，订单已占用，可继续编辑')}function submitPlan()", "function saveDraft(){if(wizard.step===2&&!validateStep())return;let p=buildPlan('draft');persistPlan(p);toast('草稿已保存，订单已占用，可继续编辑')}function submitPlan()");
// saveDraft 与 submitPlan 在同一行，保留草稿函数并移除旧提交及编辑逻辑。
html=html.replace(/function saveDraft\(\)\{[^\n]*\}/, "function saveDraft(){if(!isPlanner())return;if(wizard.step===2&&!validateStep())return;let p=buildPlan('draft');persistPlan(p);toast('草稿已保存，仓库暂不可见')}");
html=html.replace("sync:'none',",'').replace("sync:'success',",'').replace("wdt:'WDT-DEMO-001',",'');
html=html.replaceAll('演示同步成功，等待旺店通出库','计划部发布计划，等待仓库查看').replaceAll('→ 旺店通出库发货','→ 仓库查看计划').replaceAll('先确定发货方案，再同步旺店通执行出库与发货。','计划部编制并发布计划，仓库查看商品、配送要求和时效。').replaceAll('确认后可同步旺店通。','确认后发布给仓库查看。').replaceAll('确认后锁定示例报价快照并占用订单。同步成功后在旺店通出库发货。当前原型不实际提交订单。','发布后仓库可查看计划，草稿仅计划部可见；商品和订单数量保留关联。').replaceAll('先拆合单 → 确认方案 → 同步旺店通','先拆合单 → 计划部新增 → 发布给仓库').replaceAll("wizard.step===4?'确认计划':'下一步'","wizard.step===4?'发布给仓库':'下一步'").replaceAll('最晚同步 =','最晚开始备货 =').replaceAll('⑥ 旺店通执行出库发货，已发货禁止取消。','⑥ 计划部维护计划，仓库只查看已发布计划。').replaceAll('同步成功','计划已发布');
html=html.replace('<header><span>','<header><span>').replace('<span class="chip">可交互原型 · 演示数据</span>',`<div class="bar"><span class="chip">本地原型 · 演示数据</span><label for="roleSelect" style="margin:0">当前角色</label><select id="roleSelect" style="width:145px" onchange="switchRole(this.value)"><option value="planner">计划部</option><option value="warehouse">仓库（只读）</option></select></div>`);
html=html.replace("$('modal').addEventListener('cancel'",fs.readFileSync('E:/cxy/09-设计与原型/角色流程逻辑.txt','utf8')+"\n$('modal').addEventListener('cancel'");
new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);fs.writeFileSync(path,html);console.log('角色流程原型已更新');
