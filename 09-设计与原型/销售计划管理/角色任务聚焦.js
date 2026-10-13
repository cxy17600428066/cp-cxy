(function(){
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const roles={
 '省区填报':{name:'省区销售填报',goal:'按客户填报商品需求，核对全部客户后整单提交；审批与确认进度随原计划跟踪。',home:'填写月度 / 周计划',scope:'客户 → 商品'},
 '线上运营':{name:'线上销售填报',goal:'按渠道填报商品需求，整单提交丹总审核；计划部门确认后生效。',home:'填写月度 / 周计划',scope:'渠道 → 商品'},
 '大区审核':{name:'大区计划审核',goal:'核对各省区完整填报，查看客户与商品来源后审核整份省区计划。',home:'审核省区计划',scope:'省区 → 客户 → 商品'},
 '中心审核':{name:'中心计划审核',goal:'核对各大区汇总需求，逐层查看省区与客户明细，再审核完整大区汇总。',home:'审核大区计划',scope:'大区 → 省区 → 客户'},
 '严总':{name:'中心计划审核',goal:'审核各中心的完整需求，可下钻大区、省区与客户；通过后交计划部门确认。',home:'审核中心计划',scope:'中心 → 大区 → 省区'},
 '丹总':{name:'线上计划审核',goal:'审核各渠道商品需求，核对依据后通过或驳回；仅处理线上计划。',home:'审核渠道计划',scope:'渠道 → 商品'},
 '计划部门':{name:'计划任务确认',goal:'查看销售需求和前置审批，确认接收后生效；不审核或驳回销售需求。',home:'确认销售计划任务',scope:'新计划 / 调整任务'},
 '商品管理员':{name:'商品维护',goal:'维护可填报鸡爪商品的名称、适用业务、启用状态和有效期；不参与计划审批。',home:'维护可填报商品',scope:'商品及有效期'},
 '规则管理员':{name:'填报规则管理',goal:'配置填报窗口、应填清单、客户归属和销量统计口径；不代替销售填报或审批。',home:'配置本期填报规则',scope:'清单 / 窗口 / 权限'}
 };
 function decorate(a){if(document.body.dataset.page==='screen')return;const role=a.role(),view=a.view(),config=roles[role],content=document.getElementById('content'),nav=document.getElementById('stableSidebar');if(!config)return;const fill=['省区填报','线上运营'].includes(role),review=['大区审核','中心审核','严总','丹总'].includes(role),support=nav?.querySelector('.nav-more');
 if(support){support.querySelector('summary').textContent=['商品管理员','规则管理员'].includes(role)?'查询与配置':'查询与支持';
 const move=key=>{const button=nav.querySelector('[data-nav-key="'+key+'"]');if(button)support.append(button);return button;};
 if(fill||review){const task=move('acceptance');if(task)task.textContent='计划确认进度';move('monthRecap');}
 if(role==='计划部门'){const demand=nav.querySelector('[data-nav-key=demand]');if(demand)nav.insertBefore(demand,support);nav.querySelector('[data-nav-key=acceptance]').textContent='任务确认';}
 if(role!=='商品管理员')nav.querySelector('[data-nav-key=products]')?.remove();
 if(['商品管理员','规则管理员'].includes(role)){['monthRecap','salesHistory','analysis','demand','orders'].forEach(key=>nav.querySelector('[data-nav-key="'+key+'"]')?.remove());const primary=role==='商品管理员'?'products':'businessRules',b=nav.querySelector('[data-nav-key="'+primary+'"]');if(b)nav.insertBefore(b,support);}
 }
 const primaryView=fill?view==='plans':review?view==='review':role==='计划部门'?view==='acceptance':role==='商品管理员'?view==='products':['rules','businessRules'].includes(view);
 let hero=content.querySelector('.task-context');if(primaryView){if(!hero){hero=document.createElement('section');hero.className='task-context';content.prepend(hero);}const mainAction=content.querySelector('[data-action=new]');hero.innerHTML='<div><div class="task-eyebrow">'+E(config.name)+'</div><h1>'+E(fill?'填报'+(a.kind()==='month'?'月度':'周')+'计划':config.home)+'</h1><p>'+E(config.goal)+'</p></div><div class="task-context-meta"><span>'+E(a.filters().business==='online'?'线上':'线下')+'</span><span>'+E(config.scope)+'</span><span>周期：'+E(a.filters().cycle||'未选择')+'</span></div>';if(mainAction){hero.append(mainAction);mainAction.textContent='新增'+(a.kind()==='month'?'月度':'周')+'计划';mainAction.setAttribute('aria-label','新增计划');}}
 const singleBusiness=fill||review;if(singleBusiness&&['plans','review','acceptance','adjustments'].includes(view))content.querySelector('.business-switch')?.setAttribute('hidden','');
 if(primaryView){content.querySelectorAll(':scope>.task-window').forEach(el=>{const state=PlanBusiness.periodState(a.data(),a.kind(),a.kind()==='month'?a.filters().cycle+'-01':a.filters().cycle);el.textContent='当前周期：'+a.filters().cycle+' · '+state+(state==='本期填报窗口待配置'?' · 可保存草稿，提交前请联系规则管理员配置。':'');});}
 // Keep testing controls available, but remove them from the normal task surface.
 const demo=document.createElement('details');demo.className='role-demo-tools';demo.innerHTML='<summary>原型演示工具</summary>';
 const sample=document.getElementById('showAchievementDemo');if(sample)demo.append(sample);
 const urgent=document.getElementById('addUrgentAdjustmentDemo')?.closest('section');if(urgent&&view!=='demoStates')demo.append(urgent);
 if(demo.children.length>1)content.append(demo);if(a.filters().achievementDemo){demo.open=true;const notice=[...content.querySelectorAll('.notice')].find(el=>el.textContent.startsWith('纯模拟达成数据'));if(notice){if(hero)hero.after(notice);else content.prepend(notice);}}
 if(nav){const active=nav.querySelector('button[aria-current=true]');const parent=active?.closest('details');if(parent)parent.open=true;}
 }
 window.RoleFocus={roles,decorate};
})();
