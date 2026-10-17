const fs=require('fs'),f=__dirname+'/prototype.js';let s=fs.readFileSync(f,'utf8');
s=s.replace("if(!route){support=false;pending.push('未找到该目的城市的合作报价，请人工询价')}","if(!route){pending.push('未找到该目的城市的合作报价，请人工询价')}");
s=s.replace("if(!$('modal').open)$('modal').showModal()}","if(!$('modal').open)$('modal').showModal();$('modalBody').scrollTop=0}");
fs.writeFileSync(f,s);
const t=__dirname+'/test-prototype.cjs';s=fs.readFileSync(t,'utf8').replace("engine.ready.filter(q=>q.support).every(q=>q.ready)","engine.ready.filter(q=>q.total!==null).every(q=>q.ready)").replace("engine.ready.filter(q=>q.support).length>=2","engine.ready.filter(q=>q.total!==null).length>=2");fs.writeFileSync(t,s);
