from pathlib import Path
from html import escape
root=Path('E:/cxy')
application=(root/'自定义活动申请.html').read_text(encoding='utf-8')
execution=(root/'活动执行填报.html').read_text(encoding='utf-8')
# Keep the two independent forms alive while switching menus, preserving input.
shell='''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>活动管理</title><style>
*{box-sizing:border-box}body{margin:0;font:14px/1.6 "Microsoft YaHei",sans-serif;color:#263445;background:#f4f6f9}header{height:64px;display:flex;align-items:center;gap:32px;padding:0 24px;border-bottom:1px solid #dce3ec;background:#fff}header strong{font-size:18px}header span{color:#176bc5}.layout{display:grid;grid-template-columns:184px minmax(0,1fr);min-height:calc(100vh - 64px)}nav{background:#fff;border-right:1px solid #dce3ec;padding:24px 12px}nav p{margin:0 12px 16px;color:#586779}button{font:inherit}nav button{display:block;width:100%;padding:12px 16px;text-align:left;border:0;border-radius:4px;background:transparent;color:#263445;margin-bottom:8px;cursor:pointer}nav button[aria-current=page]{color:#176bc5;background:#edf5ff;font-weight:600}button:focus-visible{outline:2px solid #176bc5;outline-offset:2px}main{min-width:0}iframe{display:block;width:100%;height:calc(100vh - 64px);border:0;background:#f4f6f9}iframe[hidden]{display:none}.hint{padding:12px;font-size:12px;color:#586779}@media(max-width:640px){header{height:auto;min-height:64px;flex-wrap:wrap;gap:8px;padding:12px 16px}.layout{grid-template-columns:1fr}nav{padding:8px;display:flex;gap:8px;border-right:0;border-bottom:1px solid #dce3ec}nav p,.hint{display:none}nav button{width:auto;margin:0}iframe{height:calc(100vh - 125px)}}
</style></head><body><header><strong>卓希综合管理系统</strong><span>CRM系统 / 活动管理</span></header><div class="layout"><nav aria-label="活动管理菜单"><p>费用管理</p><button type="button" aria-current="page" aria-controls="application" data-page="application">活动申请</button><button type="button" aria-controls="execution" data-page="execution">活动执行填报</button><div class="hint">切换菜单保留本次页面填写内容。当前为独立演示页面。</div></nav><main><iframe id="application" title="活动申请" srcdoc="APPLICATION"></iframe><iframe id="execution" title="活动执行填报" hidden srcdoc="EXECUTION"></iframe></main></div><script>
document.querySelectorAll('nav button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('nav button').forEach(b=>b.removeAttribute('aria-current'));button.setAttribute('aria-current','page');document.querySelectorAll('main iframe').forEach(frame=>frame.hidden=frame.id!==button.dataset.page);document.title=button.textContent+' · 活动管理'}));
</script></body></html>'''
# Remove duplicate product navigation from embedded forms after they load.
cleanup='''<script>window.addEventListener('load',()=>{const app=document.getElementById('custom-activity');if(app){const header=app.querySelector('header');if(header)header.remove();const aside=app.querySelector('aside');if(aside)aside.remove();const shell=app.querySelector('.shell');if(shell)shell.style.gridTemplateColumns='minmax(0,1fr)'}});</script>'''
application=application.replace('</body>',cleanup+'</body>')
# Exported application uses an internal srcdoc frame; inject cleanup in its fragment instead.
source=Path('C:/Users/admin/.codex/visualizations/2026/10/07/01a113f3-1f33-7d40-bf39-7aaed264b0b9/custom-activity.html').read_text(encoding='utf-8')
application='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0">'+source+cleanup+'</body></html>'
execution=execution.replace('</body>',cleanup+'</body>').replace('body style="margin:16px"','body style="margin:0"')
shell=shell.replace('APPLICATION',escape(application,quote=True)).replace('EXECUTION',escape(execution,quote=True))
(root/'活动管理.html').write_text(shell,encoding='utf-8')
