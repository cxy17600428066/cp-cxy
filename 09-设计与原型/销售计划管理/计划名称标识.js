(function(){
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const business=p=>p.business==='online'?'线上':'线下';
 function name(p){if(p.planName?.trim())return p.planName.trim();const range=p.kind==='week'?(p.start||'未定')+'至'+(p.end||'未定'):(p.start||'未定').slice(0,7),scope=p.business==='online'?p.channel:[p.center,p.area,p.province].filter(Boolean).join('·');return [business(p),range,p.kind==='week'?'周度销售计划':'月度销售计划',scope].filter(Boolean).join(' · ');}
 function labels(xs){return [...new Set(xs.map(name))].map(E).join('<br>');}
 function annotate(root,a){const d=a.data();root.querySelectorAll('[data-sheet-detail],[data-action=detail],[data-task-detail]').forEach(b=>{const row=b.closest('tr'),cell=row?.firstElementChild;if(!cell||row.closest('.sheet-detail-table')||cell.querySelector('.plan-identity'))return;let p=d.plans.find(p=>p.id===(b.dataset.sheetDetail||b.dataset.id));if(!p&&b.hasAttribute('data-task-detail'))p=d.plans.find(p=>cell.textContent.trim()===p.id);if(!p)return;const label=document.createElement('div');label.className='plan-identity';label.innerHTML='<strong>'+E(name(p))+'</strong><span class="tag">'+business(p)+' / '+(p.kind==='week'?'周计划':'月计划')+'</span>';cell.prepend(label);});}
 function decorate(a){if(document.body.dataset.page==='screen')return;annotate(document.getElementById('content'),a);}
 window.PlanIdentity={name,business,labels,annotate,decorate};
})();
