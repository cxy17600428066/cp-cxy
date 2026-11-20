from pathlib import Path
p=Path('E:/cxy/活动核销.html')
s=p.read_text(encoding='utf-8')
s=s.replace('<th>支付方式</th></tr>','<th>支付方式</th><th>调整费用（元）</th><th>最终核销费用（元）</th></tr>')
s=s.replace('执行费用和附件只读，需修改时返回“活动执行填报”。','实际费用和附件只读。调整费用默认0，正数调增、负数调减；最终核销费用＝实际费用＋调整费用，不得小于0。')
s=s.replace('本次核销金额（元）','最终核销金额合计（元）').replace('required id="amount"','readonly required id="amount"').replace('placeholder="填写本次核销金额"','placeholder="按各项最终核销费用及我司承担比例自动计算"')
s=s.replace('let available=null;','''let available=null;const adjustments=new Map();function calculateFinal(){let total=0,valid=true;document.querySelectorAll('#execution-rows tr').forEach(row=>{const actual=Number(row.dataset.actual),filled=row.dataset.filled==='true',input=row.querySelector('.adjustment'),delta=Number(input.value),final=Math.round((actual+delta)*100)/100;const ok=filled&&input.value!==''&&input.checkValidity()&&final>=0;row.querySelector('.final-cost').textContent=filled&&Number.isFinite(final)?final.toFixed(2):'待填写';input.setCustomValidity(filled&&final<0?'最终核销费用不得小于0':'');if(!ok)valid=false;else total+=Math.round(final*Number(row.dataset.share))/100});q('#amount').value=valid?total.toFixed(2):'';return valid}''')
s=s.replace("const tr=document.createElement('tr');Array.from(row.cells)","const tr=document.createElement('tr');const actualInput=row.querySelector('input');tr.dataset.actual=actualInput?.value||'0';tr.dataset.filled=String(actualInput?.value!==''&&!!actualInput?.checkValidity());tr.dataset.share=percentValue();Array.from(row.cells)")
# share must be available before source rows are iterated.
s=s.replace("const tb=q('#execution-rows');", "function percentValue(){return Number(app.querySelector('#company-percent').value)}const tb=q('#execution-rows');")
s=s.replace('tb.append(tr)});const percent=', '''const adjustmentCell=document.createElement('td'),input=document.createElement('input');input.type='number';input.step='0.01';input.required=true;input.className='adjustment';const key=row.cells[0].textContent;input.value=adjustments.get(key)??'0';input.setAttribute('aria-label',key+'调整费用');input.disabled=tr.dataset.filled!=='true';input.oninput=()=>{input.setCustomValidity('');adjustments.set(key,input.value);calculateFinal()};adjustmentCell.append(input);const finalCell=document.createElement('td');finalCell.className='final-cost';tr.append(adjustmentCell,finalCell);tb.append(tr)});calculateFinal();const percent=''')
s=s.replace("q('#feedback').textContent=available===null?", "q('#feedback').textContent=!calculateFinal()?'请完成实际费用填报，并确保各项最终核销费用不小于0。':available===null?")
s=s.replace("value>available?'本次核销金额不能超过我司实际承担费用。':",'')
# value read is unnecessary: the final amount is always calculated from rows.
p.write_text(s,encoding='utf-8')
