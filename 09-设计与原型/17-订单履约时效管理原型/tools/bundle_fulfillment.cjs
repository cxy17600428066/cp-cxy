// Emit an apply_patch patch. Keep source modules editable and the preview portable.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),target=path.join(root,'发货时效预警策略.html');
const source=fs.readFileSync(target,'utf8');
const start='<!-- fulfillment-bundle:start -->',end='<!-- fulfillment-bundle:end -->';
const files=['履约规则.js','时效交互案例.js','履约业务交互.js','履约流程展示.js','订单接单.js','订单详情展示.js','回执单列表.js'];
const bundle=start+'\n<style>\n'+fs.readFileSync(path.join(root,'履约业务交互.css'),'utf8')+'\n</style>\n'+files.map(file=>'<script>\n/* source: '+file+' */\n'+fs.readFileSync(path.join(root,file),'utf8')+'\n</script>').join('\n')+'\n'+end;
const old=source.includes(start)?source.slice(source.indexOf(start),source.indexOf(end)+end.length):source.split(/\r?\n/).find(l=>l.includes('<script src="订单接单.js">'));
if(!old)throw Error('Bundle insertion target missing');
const replacement=source.includes(start)?bundle:bundle+'\n</body>';
console.log('*** Begin Patch\n*** Update File: '+target+'\n@@\n'+old.split(/\r?\n/).map(l=>'-'+l).join('\n')+'\n'+replacement.split(/\r?\n/).map(l=>'+'+l).join('\n')+'\n*** End Patch');
