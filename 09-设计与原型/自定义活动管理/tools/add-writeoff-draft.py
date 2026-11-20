from pathlib import Path
p=Path(__file__).resolve().parents[1]/'活动核销.html'
s=p.read_text(encoding='utf-8')
s=s.replace('<button type="submit" class="primary">提交核销</button>','<div class="row"><button type="button" id="save-writeoff-draft">保存草稿</button><button type="submit" class="primary">提交核销</button></div>')
s=s.replace('const adjustments=new Map();', '''const draftKey='custom-activity-writeoff-HD-DEMO-001-v1';let draft=null;try{draft=JSON.parse(localStorage.getItem(draftKey))}catch{}const adjustments=new Map(Array.isArray(draft?.adjustments)?draft.adjustments:[]);''')
anchor='window.syncWriteoff=sync;sync();'
assert anchor in s
s=s.replace(anchor,'''window.syncWriteoff=sync;sync();const summary=document.querySelector('textarea[form="writeoff"]'),note=q('#writeoff-note');if(draft){if(typeof draft.summary==='string')summary.value=draft.summary;if(typeof draft.note==='string')note.value=draft.note;}q('#save-writeoff-draft').onclick=()=>{try{document.querySelectorAll('#execution-rows tr').forEach(row=>{const input=row.querySelector('.adjustment');if(input)adjustments.set(row.cells[0].textContent,input.value)});localStorage.setItem(draftKey,JSON.stringify({adjustments:Array.from(adjustments),summary:summary.value,note:note.value}));q('#feedback').className='';q('#feedback').textContent='草稿已保存到当前浏览器，刷新后可恢复。附件需重新选择。'}catch{q('#feedback').className='error';q('#feedback').textContent='草稿保存失败，浏览器存储不可用。请保留页面并重试。'}};''')
p.write_text(s,encoding='utf-8')
