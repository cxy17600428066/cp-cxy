const fs=require('fs'),file=__dirname+'/prototype.js';let s=fs.readFileSync(file,'utf8');const addition=`
const bulkStartBase=startPlan;
startPlan=function(){wizardOrderSearch='';bulkStartBase()};
const bulkEntryPlansBase=plansView;
plansView=function(){let host=document.createElement('div');host.innerHTML=bulkEntryPlansBase();if(planner()){let title=host.querySelector('.title'),primary=title.querySelector('button'),actions=document.createElement('div');actions.className='row';if(primary){primary.before(actions);actions.append(primary)}else title.append(actions);let batch=document.createElement('button');batch.textContent='批量选单建计划';batch.setAttribute('onclick',"go('orders')");actions.prepend(batch)}return host.innerHTML};
`;
s=s.replace('render();setInterval(',addition+'\nrender();setInterval(');new Function(s);fs.writeFileSync(file,s);
