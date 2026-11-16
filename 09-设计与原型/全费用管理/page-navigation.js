// 独立业务页面和可恢复路由；轻量确认和清偿仍使用弹窗。
const baseRender=render,baseShowModal=showModal,baseCloseModal=closeModal;
const basePolicyEditor=policyEditor,baseNewActivity=newActivity,baseDetail=detail,baseVerify=verify,baseCalcView=calcView;
let detailPage=null,buildingPage=null,leaveAction=null,routeRestoring=false;
let listMemory={};
try{const savedContext=JSON.parse(sessionStorage.getItem('tgx-page-context')||'null');if(savedContext){listMemory=savedContext.lists||{};schemeFilters=savedContext.schemes||schemeFilters}}catch{}
function formSnapshot(){const form=$('workspace').querySelector('form')||$('workspace').querySelector('[data-full-page]');if(!form)return null;return Object.fromEntries([...form.querySelectorAll('input,select,textarea')].filter(x=>x.id).map(x=>[x.id,x.type==='checkbox'?x.checked:x.value]))}
function capturePage(){if(!detailPage||!$('workspace').querySelector('[data-full-page]'))return;const values=formSnapshot();if(values){detailPage.values=values;detailPage.dirty=JSON.stringify(values)!==detailPage.baseline}}
function rememberList(){if(!detailPage&&!routeRestoring){listMemory[page]={filter,statusFilter,scroll:window.scrollY};try{sessionStorage.setItem('tgx-page-context',JSON.stringify({lists:listMemory,schemes:schemeFilters}))}catch{}}}
function restoreList(module){page=module;const m=listMemory[module]||{};filter=m.filter||'';statusFilter=m.statusFilter||'all'}
function routeHash(){if(!detailPage)return '#/'+page;const r=detailPage.route,q=new URLSearchParams();if(r.copy)q.set('copy','1');if(r.policyId)q.set('policy',r.policyId);return '#/'+page+'/'+r.kind+'/'+encodeURIComponent(r.id||'new')+(q.size?'?'+q:'')}
function writeRoute(replace=false){if(routeRestoring)return;history[replace?'replaceState':'pushState']({},'',routeHash())}
function askLeave(next){capturePage();if(!detailPage?.dirty){next();return}leaveAction=next;baseShowModal('离开未保存页面',`<p>当前页面有未保存的更改。继续离开将放弃本次编辑，已保存的方案和账本不受影响。</p><div class="actions"><button data-keep-editing class="primary">继续编辑</button><button data-discard-page class="danger">放弃更改并离开</button></div>`)}
function beginPage(spec,title,body){rememberList();detailPage={route:spec,title,body,returnPage:spec.returnPage||page,values:null,baseline:null,dirty:false};page=['program','strategy','programApproval'].includes(spec.kind)?'programs':spec.kind==='customer'?'ledger':spec.kind==='policy'?'policies':spec.kind==='trial'?'calculator':spec.returnPage==='approval'?'approval':'activities';render();writeRoute();window.scrollTo(0,0);$('workspace').focus({preventScroll:true})}
function launchPage(spec,build){askLeave(()=>{buildingPage={...spec,returnPage:detailPage?.returnPage||page};build();buildingPage=null})}
showModal=function(title,body){if(buildingPage){beginPage(buildingPage,title,body);return}baseShowModal(title,body)};
closeModal=function(){if($('modal').open){baseCloseModal();return}if(detailPage)finishDetail();else baseCloseModal()};
function finishDetail(){const back=detailPage?.returnPage||page;detailPage=null;restoreList(back);render();writeRoute(true);window.scrollTo(0,listMemory[back]?.scroll||0);$('workspace').focus({preventScroll:true})}
navigate=function(next){askLeave(()=>{rememberList();detailPage=null;restoreList(next);render();writeRoute();window.scrollTo(0,listMemory[next]?.scroll||0);$('workspace').focus({preventScroll:true})})};
policyEditor=function(id,copy=false){launchPage({kind:'policy',id,copy},()=>basePolicyEditor(id,copy))};
newActivity=function(existing){launchPage({kind:'activity',id:existing?.id},()=>baseNewActivity(existing))};
detail=function(id){launchPage({kind:'review',id},()=>baseDetail(id))};
verify=function(id){launchPage({kind:'verify',id},()=>baseVerify(id))};
startTrial=function(policyId=null,trialId=null,copy=false){launchPage({kind:'trial',id:trialId,policyId,copy},()=>{if(trialId){const saved=state.trialSchemes.find(x=>x.id===trialId);if(!saved)return toast('该试算不存在，请返回列表选择。',true);workTrial=clone(saved);if(copy){delete workTrial.id;workTrial.name+=' 副本'}}else{const p=state.policySchemes.find(x=>x.id===policyId)||state.policySchemes[0];workTrial={name:customer(p.customer).name+'费用测算',customer:p.customer,policyId:p.id,snapshot:clone(p),base:100000,signed:100,returns:0,total:p.total,rebate:p.rebate,service:p.service,check:'valid'}}showModal(workTrial.id?'编辑试算 '+workTrial.id:copy?'复制试算方案':'新建试算方案',trialEditor())})};
// 试算列表仅保留列表，编辑表单由独立页面承载。
calcView=function(){const prior=workTrial;workTrial=null;const output=baseCalcView();workTrial=prior;return output};
render=function(){capturePage();baseRender();if(!detailPage)return;
 const d=detailPage,moduleName=pages.find(p=>p[0]===page)[2];
 const returnName=({calculator:'试算方案列表',policies:'政策方案列表',activities:'活动列表',approval:'审核工作台',ledger:'客户列表',programs:'活动方案与策略列表'})[d.returnPage]||'列表';
 $('workspace').innerHTML=`<div data-full-page><div class="flowline" style="margin-bottom:16px"><button class="small" data-return-list>← 返回${returnName}</button><span class="muted">/ ${esc(d.title)}</span></div>${d.route.kind==='customer'?'':heading('DETAIL & EDIT',esc(d.title),d.route.kind==='trial'?'保存客户与政策参数快照；试算不写入费用账本。':d.route.kind==='review'?'核对单据、来源、额度与审批路线后处理。':'完成当前单据后保存或提交，返回原列表。')}<div id="fullPageBody">${d.route.kind==='customer'?customerLedgerBody(d.route.id):d.route.kind==='trial'?trialEditor():d.body}</div></div>`;
 $('crumb').textContent=moduleName+' / '+d.title;
 const body=$('fullPageBody');
 if(d.route.kind==='trial'){body.querySelector('.heading')?.remove();const section=$('trialEditor');section.style.marginTop='0'}
 else if(d.route.kind!=='customer'){const wrapper=document.createElement('section');wrapper.className='card';body.parentNode.insertBefore(wrapper,body);wrapper.append(body);wrapper.style.maxWidth=d.route.kind==='review'?'1100px':'980px'}
 if(d.values){for(const [id,value]of Object.entries(d.values)){const input=$(id);if(input){if(input.type==='checkbox')input.checked=value;else input.value=value}}}
 if(d.route.kind==='trial'&&$('calcForm'))calculate();
 if(d.baseline===null)d.baseline=JSON.stringify(formSnapshot());
 if(d.values)d.dirty=JSON.stringify(formSnapshot())!==d.baseline;
};
function parsePageHash(){const [path,query='']=location.hash.slice(1).split('?'),parts=path.split('/').filter(Boolean);return{module:pages.some(x=>x[0]===parts[0])?parts[0]:'ledger',kind:parts[1],id:parts[2]&&parts[2]!=='new'?decodeURIComponent(parts[2]):undefined,copy:new URLSearchParams(query).get('copy')==='1',policyId:new URLSearchParams(query).get('policy')}}
function restorePageHash(){const target=parsePageHash();detailPage=null;restoreList(target.module);routeRestoring=true;try{render();if(target.kind==='program')openProgram(target.id);else if(target.kind==='strategy')openDealerRule(target.id);else if(target.kind==='programApproval')openProgramOA(target.id);else if(target.kind==='customer')openCustomerLedger(target.id);else if(target.kind==='trial')startTrial(target.policyId,target.id,target.copy);else if(target.kind==='policy')policyEditor(target.id,target.copy);else if(target.kind==='activity')newActivity(state.activities.find(x=>x.id===target.id));else if(target.kind==='review'&&state.activities.some(x=>x.id===target.id))detail(target.id);else if(target.kind==='verify'&&state.activities.some(x=>x.id===target.id))verify(target.id)}finally{routeRestoring=false}window.scrollTo(0,0)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-return-list')||b.hasAttribute('data-trial-close')||(b.hasAttribute('data-close')&&detailPage&&!$('modal').open)){e.preventDefault();e.stopImmediatePropagation();askLeave(finishDetail)}
 if(b.hasAttribute('data-keep-editing')){e.preventDefault();e.stopImmediatePropagation();leaveAction=null;baseCloseModal()}
 if(b.hasAttribute('data-discard-page')){e.preventDefault();e.stopImmediatePropagation();const action=leaveAction;leaveAction=null;baseCloseModal();if(detailPage)detailPage.dirty=false;action?.()}
},true);
// 已保存的浏览器路由可刷新及前后退；未保存更改离开前提示。
window.addEventListener('popstate',()=>{const target=location.hash,current=routeHash();capturePage();if(detailPage?.dirty){history.pushState({},'',current);askLeave(()=>{history.replaceState({},'',target);restorePageHash()})}else restorePageHash()});
window.addEventListener('beforeunload',e=>{capturePage();if(detailPage?.dirty){e.preventDefault();e.returnValue=''}});
if(location.hash)restorePageHash();else writeRoute(true);
