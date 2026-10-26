const fs=require('fs'),path=require('path'),p=path.resolve(__dirname,'..','履约方案管理.js');let s=fs.readFileSync(p,'utf8');
const old=`(r.id==='ship'?'<span>读取商品有货 / 无货时效</span><input type="hidden" name="hours'+i+'" value="'+r.value+'">':'<input aria-label="'+labels[r.id]+'时限" name="hours'+i+'" type="number" min="0.1" max="8760" step="0.1" required value="'+r.value+'">')`;
if(!s.includes(old))throw Error('missing timing cell');s=s.replace(old,'timingCell(r,i)');
const warning=`'<input name="warn'+i+'" aria-label="'+labels[r.id]+'预警比例" type="number" min="1" max="99" required value="'+r.warn+'">'`;
// The warning HTML is embedded in a longer literal in draw().
const embedded=`</td><td><input name="warn'+i+'" aria-label="'+labels[r.id]+'预警比例" type="number" min="1" max="99" required value="'+r.warn+'"></td><td>`;
if(!s.includes(embedded))throw Error('missing warning cell');s=s.replace(embedded,`</td><td>'+warningCell(r,i)+'</td><td>`);
s=s.replace('<th>处理时限（小时）</th><th>预警比例（%）</th>','<th>计时方式 / 时限</th><th>预警规则</th>');
s=s.replace('每行独立配置是否监控、时限、预警比例及责任角色。财务与接单并行；连续自然小时计时，多商品发货取最长时效。','系统客户：以要求到货时间为锚点，截止＝到货时间－提前量，预警＝截止－预警提前小时。非系统客户：按实际开始时间正向计时，多商品发货取最长时效。回执与售后节点始终按实际事件正向计时。财务与接单并行，全部按连续自然小时计算。');
s=s.replace("document.getElementById('schemeForm').onsubmit=submit}",`document.getElementById('schemeForm').onsubmit=submit;document.getElementById('schemeForm').elements.type.onchange=()=>{captureForm();draw()};if(edit.type!=='非系统客户'){const preview=document.createElement('section');preview.innerHTML='<h3>4. 系统客户倒排预览</h3><p class="scheme-note">仅用于演示计算，不改变任何订单。客户到货时间取订单所选收货地址的要求。</p><label>演示要求到货时间<input id="reverseAnchor" type="datetime-local" value="'+new Date(Date.now()+7*86400000-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)+'"></label><div id="reversePreview"></div>';document.querySelector('.scheme-footer').before(preview);document.getElementById('schemeForm').addEventListener('input',timingPreview);timingPreview()}}`);
s=s.replace("owner:d['owner'+i].value}))};delete p.originalId", "owner:d['owner'+i].value,leadHours:d['lead'+i]?+d['lead'+i].value:r.leadHours,warningHours:d['warningHours'+i]?+d['warningHours'+i].value:r.warningHours}))};p.timingBasis=p.type==='系统客户'?'arrival-backward':p.type==='全部客户'?'customer-adaptive':'event-forward';validateReverse(p);delete p.originalId");
fs.writeFileSync(p,s);
