(function(){
 const state={open:false,scroll:{},last:{},handlers:{}};
 const reviewers=['大区审核','中心审核','严总','线上领导','丹总'];
 function capture(){const nav=document.getElementById('stableSidebar');if(!nav)return;state.scroll[nav.dataset.navRole||'']=nav.scrollTop;state.focus=nav.contains(document.activeElement)?document.activeElement.dataset.navKey:null;}
 function goKind(a,kind){delete a.filters().demoCase;const handler=state.handlers[kind];if(handler)return handler();a.filters().kind=kind;a.filters().cycle=kind==='month'?'2026-10':'2026-10-12';a.setView('plans');}
 function decorate(a){
 if(document.body.dataset.page==='screen')return;
 const nav=document.querySelector('nav'),role=a.role(),view=a.view(),planner=role==='计划部门',fill=['省区填报','线上运营'].includes(role),review=reviewers.includes(role);
 state.handlers={};nav.querySelectorAll('[data-plan-kind]').forEach(b=>state.handlers[b.dataset.planKind]=b.onclick);
 const groups=planner?[['home','首页',['home'],'home'],['confirmHub','计划任务',['demand','acceptance','adjustments'],'demand'],['analysis','计划达成',['analysis','monthRecap'],'analysis'],['salesHub','销售分析',['productSales','customerSales','salesHistory','orders','estimateRecords'],'productSales']]:fill?[['home','首页',['home'],'home'],['fillHub','计划填报',['plans','adjustments','progress'],'plans'],['salesHub','销售分析',['salesHistory','analysis','monthRecap'],'salesHistory']]:review?[['home','首页',['home'],'home'],['reviewHub','计划审核',['review','adjustments',...(['严总','中心审核'].includes(role)?['demand']:[])],'review'],['salesHub','销售分析',['salesHistory','analysis','monthRecap'],'salesHistory']]:[['home','首页',['home'],'home'],...(role==='商品管理员'?[['products','商品管理',['products'],'products']]:[['businessRules','规则与权限',['businessRules'],'businessRules'],['rules','填报规则',['rules'],'rules']])];
 nav.innerHTML='<div class="module-parent">生产管理</div><div class="module-current">计划管理</div>';nav.id='stableSidebar';nav.dataset.navRole=role;
 for(const [key,text,views,target] of groups){const current=views.includes(view);if(current)state.last[role+':'+key]=view;const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset.navKey=key;b.dataset.view=target;b.setAttribute('aria-current',String(current));b.onclick=()=>{capture();delete a.filters().demoCase;if(innerWidth<=800)state.open=false;a.setView(state.last[role+':'+key]||target);};nav.append(b);}
 nav.scrollTop=state.scroll[role]||0;if(state.focus)nav.querySelector('[data-nav-key="'+state.focus+'"]')?.focus({preventScroll:true});
 const header=document.querySelector('header');let toggle=document.getElementById('sidebarToggle');if(!toggle){toggle=document.createElement('button');toggle.id='sidebarToggle';toggle.textContent='菜单';toggle.setAttribute('aria-controls',nav.id);header.prepend(toggle);}const paint=()=>{nav.dataset.mobileOpen=String(state.open);toggle.setAttribute('aria-expanded',String(state.open));};toggle.onclick=()=>{state.open=!state.open;paint();};nav.addEventListener('keydown',e=>{if(e.key==='Escape'&&innerWidth<=800){state.open=false;paint();toggle.focus();}});paint();
 const measure=()=>document.documentElement.style.setProperty('--nav-top',header.getBoundingClientRect().height+'px');measure();if(window.ResizeObserver){const observer=new ResizeObserver(measure);observer.observe(header);}
 }
 window.StableSidebar={capture,decorate,goKind};
})();

