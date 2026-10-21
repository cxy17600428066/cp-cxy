// 每个温层保存独立方案；旧冷运数据不推断冷藏或冷冻。
function temperatureFreightRows(p){
 const parts=p.estimate?.temperatureQuotes||p.temperatureQuotes;
 if(Array.isArray(parts)&&parts.length)return parts.map(r=>({temp:r.temp,name:r.name||r.quote?.name,total:r.total??r.quote?.total}));
 const q=activeQuote(p);
 return [{temp:p.temp==='normal'?'normal':p.temp==='chilled'?'chilled':p.temp==='frozen'?'frozen':'cold',name:q?.name,total:q?.total}];
}
function temperatureFreightHtml(p,expanded=false){
 const rows=temperatureFreightRows(p),labels={normal:'常温',chilled:'冷藏',frozen:'冷冻',cold:'冷运 · 温层待确认'};
 const complete=rows.every(r=>Number.isFinite(r.total)),sum=rows.reduce((n,r)=>n+(Number.isFinite(r.total)?r.total:0),0);
 return `<div class="temperature-freight">${expanded?'<h3>按温层分项的物流与费用</h3>':''}${rows.map(r=>`<div class="temperature-freight-row"><span>${badge(labels[r.temp]||'温层待确认')} <span>${esc(r.name||'待选择物流')}</span></span><strong>${Number.isFinite(r.total)?money(r.total):'待核价'}</strong></div>`).join('')}<div class="temperature-freight-total"><span>预估运费合计</span><strong>${complete?money(sum):'待确认'}</strong></div>${!complete?'<small>存在未核价分项，暂不生成完整合计</small>':''}${expanded?'<small>常温匹配常温物流；冷藏、冷冻分别匹配对应冷运方案并独立计费后相加。未配置的温层不参与合计。</small>':''}</div>`;
}
const temperatureBasePlansView=plansView;
plansView=function(){const host=document.createElement('div');host.innerHTML=temperatureBasePlansView();host.querySelectorAll('thead th').forEach(th=>{if(th.textContent.includes('预估费用'))th.textContent='温层 / 物流 / 分项运费'});host.querySelectorAll('tbody tr').forEach(tr=>{let b=tr.querySelector('button[onclick^="detail"]'),id=b?.getAttribute('onclick').match(/detail\('([^']+)'\)/)?.[1],p=state.plans.find(p=>p.id===id);if(!p)return;tr.children[3].innerHTML=temperatureFreightHtml(p);const cell=tr.children[1];cell.querySelectorAll('.badge').forEach(el=>el.remove());let tags=document.createElement('div');tags.className='row';tags.innerHTML=[...new Set(temperatureFreightRows(p).map(r=>r.temp))].map(t=>badge({normal:'常温',chilled:'冷藏',frozen:'冷冻',cold:'冷运（冷藏 / 冷冻待确认）'}[t]||'温层待确认')).join('');cell.append(tags)});return host.innerHTML};
const temperatureBaseDetail=detail;
detail=function(id){temperatureBaseDetail(id);const p=state.plans.find(p=>p.id===id);if(!p||!$('modal').open)return;const grid=[...$('modalBody').querySelectorAll('.grid')].find(el=>el.textContent.includes('最终物流方案'));if(grid){const section=document.createElement('div');section.className='card section';section.innerHTML=temperatureFreightHtml(p,true);grid.before(section);if(temperatureFreightRows(p).length>1)grid.remove()}};
