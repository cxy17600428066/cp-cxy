from pathlib import Path
p=Path(__file__).resolve().parents[1]/'多次执行核销.html'
s=p.read_text(encoding='utf-8')
css='''#execution-modal{width:min(1120px,calc(100vw - 48px));max-height:calc(100vh - 48px);padding:0;border:1px solid #dce3ec;border-radius:8px;color:#263445;box-shadow:0 16px 64px #0003}#execution-modal::backdrop{background:#14253d66}#execution-modal #editor{border:0;margin:0;padding:24px}#execution-modal #editor>.row{position:sticky;top:-1px;background:white;z-index:2;padding:8px 0 16px;border-bottom:1px solid #dce3ec}#execution-modal #actions{position:sticky;bottom:-1px;background:white;padding:16px 0 8px;border-top:1px solid #dce3ec}#execution-modal #feedback{padding:0 24px 20px}@media(max-width:600px){#execution-modal{width:calc(100vw - 16px);max-height:calc(100dvh - 16px)}#execution-modal #editor{padding:16px}}
'''
s=s.replace('</style>',css+'</style>',1)
anchor="q('#title').textContent=isWriteoff?'活动核销记录':'活动执行记录';"
assert anchor in s
setup='''if(!isWriteoff){const editor=q('#editor'),dialog=document.createElement('dialog');dialog.id='execution-modal';dialog.setAttribute('aria-labelledby','editor-title');document.body.append(dialog);dialog.append(editor);const feedback=q('#feedback'),home=feedback.parentElement;const refreshModal=()=>{if(!editor.hidden){dialog.append(feedback);if(!dialog.open)dialog.showModal()}else{if(dialog.open)dialog.close();home.append(feedback)}};new MutationObserver(refreshModal).observe(editor,{attributes:true,attributeFilter:['hidden']});dialog.addEventListener('cancel',event=>{event.preventDefault();editor.hidden=true});dialog.addEventListener('close',()=>{editor.hidden=true});}'''
s=s.replace(anchor,setup+anchor)
p.write_text(s,encoding='utf-8')
