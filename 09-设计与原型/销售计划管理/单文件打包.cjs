const fs=require('fs'),path=require('path');
const dir=__dirname,read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const safeScript=s=>s.replace(/<\/script/gi,'<\\/script');
let flow=read('17-计划管理详细流程图.html');
flow=flow.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
flow=flow.replace('</body>',`<script>document.querySelectorAll('[data-chapter]').forEach((b,index)=>{b.onclick=()=>document.querySelectorAll('[data-chapter]').forEach((x,i)=>{x.setAttribute('aria-selected',String(i===index));document.getElementById('flowPanel'+i).hidden=i!==index;});b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?6:(index+(e.key==='ArrowRight'?1:-1)+7)%7;const x=document.getElementById('flowTab'+n);x.click();x.focus();}};});document.getElementById('printFlows').onclick=()=>window.print();<\/script><script>${safeScript(read('计划管理泳道图.js'))}<\/script></body>`);
// Swimlanes are native SVG and do not need the separate Mermaid runtime.
flow=flow.replace('</body>',`<script>document.getElementById('showOrdinary')?.remove();document.querySelectorAll('.drawing,section details').forEach(x=>x.hidden=true);<\/script></body>`);
let html=read('14-销售仓库协同数字驾驶舱.html');
html=html.replace('<title>脱骨侠生产管理 计划管理</title>','<title>脱骨侠生产管理 · 计划管理演示版</title>');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,name)=>'<style>'+read(name)+'\n.standalone-flow-frame{display:block;width:100%;height:calc(100vh - 48px);border:0}.standalone-flow-return{display:block;background:white;padding:8px 24px}</style>');
const bootstrap=`const standaloneMode=new URLSearchParams(location.search).get('page')||'manage';if(standaloneMode==='screen'){document.body.dataset.page='screen';document.body.className='screen';}else if(standaloneMode==='salesHistory')document.body.dataset.initialView='salesHistory';else if(standaloneMode==='urgentDemo')document.body.dataset.initialView='urgentDemo';else if(standaloneMode==='flow'){document.body.dataset.page='flow';document.getElementById('root').innerHTML='<a class="standalone-flow-return" href="?page=manage">返回计划管理</a><iframe class="standalone-flow-frame" title="计划管理泳道图"></iframe>';document.querySelector('iframe').srcdoc=JSON.parse(document.getElementById('standaloneFlowSource').textContent);}`;
html=html.replace('<div id="root"></div>','<div id="root"></div><script type="application/json" id="standaloneFlowSource">'+safeScript(JSON.stringify(flow))+'</script><script>'+bootstrap+'</script>');
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,name)=>{
 let source=read(name).replaceAll('tgx_sales_planning_v3','tgx_sales_planning_standalone_20261014').replaceAll('tgx_plan_filters','tgx_standalone_plan_filters').replaceAll('tgx_form_draft_','tgx_standalone_form_draft_').replaceAll('tgx_plan_draft_','tgx_standalone_plan_draft_');
 source=source.replaceAll('14-销售仓库协同数字驾驶舱.html','?page=manage').replaceAll('15-销售仓库协同可视化大屏.html','?page=screen').replaceAll('16-历史销售查询.html?business=','?page=salesHistory&business=').replaceAll('16-历史销售查询.html','?page=salesHistory');
 if(name==='销售计划管理.js')source=source.replace("role='省区填报'", "role=standaloneMode==='salesHistory'&&new URLSearchParams(location.search).get('business')==='online'?'线上运营':'省区填报'").replace("<a href=\"${screen?", "<a href=\"?page=flow\">流程图</a><a href=\"${screen?");
 return '<script>if(standaloneMode!=="flow"){\n'+safeScript(source)+'\n}</script>';
});
if(/<script[^>]+src=|<link[^>]+href=|(?:src|href)="(?!\?|#|data:|blob:)[^"]+\.(?:js|css|html)/i.test(html))throw Error('单文件仍存在外部资源引用');
process.stdout.write(html);
