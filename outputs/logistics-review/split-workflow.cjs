const fs=require('fs'),f=__dirname+'/prototype.js';let s=fs.readFileSync(f,'utf8');
const a=s.indexOf('function startPlan()'),b=s.indexOf('function optionField(',a);if(a<0||b<0)throw Error('未找到待拆分流程');s=s.slice(0,a)+s.slice(b);
s=s.split('\n').filter(l=>!/^function (go|render|plansView)\(/.test(l)).join('\n');
// 规则维护随物流估价一并交给仓库。
s=s.replaceAll('if(!planner())return;showModal(\'查询合作线路报价\'','if(!warehouse())return;showModal(\'查询合作线路报价\'');
s=s.replace('function saveConfig(e){e.preventDefault();if(!planner())return;','function saveConfig(e){e.preventDefault();if(!warehouse())return;');
s=s.replace('function resetAsk(){if(!planner())return;','function resetAsk(){if(!warehouse())return;').replace('function resetData(){if(!planner())return;','function resetData(){if(!warehouse())return;');
s=s.replaceAll('由计划部确认后再选择','由仓库确认后再选择');
s=s.replace("render();setInterval(",fs.readFileSync(__dirname+'/split-workflow.js','utf8')+'\nrender();setInterval(');
new Function(s);fs.writeFileSync(f,s);
const builder=__dirname+'/build-prototype.cjs';s=fs.readFileSync(builder,'utf8').replace('仓库（只读）','仓库（选物流 / 估价）').replace('计划部发布 · 仓库查看','计划部下达 · 仓库选物流估价').replace('Word计费口径版','职责分工版');fs.writeFileSync(builder,s);console.log('已拆分计划下达与仓库估价职责');
