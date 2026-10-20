const fs=require('fs'),file=__dirname+'/prototype.js';let s=fs.readFileSync(file,'utf8'),from="card.append(form)}}}if(custom&&wizard.step===4)";
if(!s.includes(from))throw Error('自定义表单位置未找到');
s=s.replace(from,"card.append(form);let manual=$('manualTotal')?.closest('.card');if(manual){manual.className='section';manual.style.marginTop='16px';card.append(manual)}let first=$('modalBody').querySelector('.quote');if(first&&first!==card)first.before(card)}}}if(custom&&wizard.step===4)");
fs.writeFileSync(file,s);
let t=__dirname+'/test-planner-results.cjs',test=fs.readFileSync(t,'utf8').replace("assert.equal(await p.getByRole('radio').count(),3)","assert.equal(await p.getByRole('radio').count(),4)");fs.writeFileSync(t,test);
