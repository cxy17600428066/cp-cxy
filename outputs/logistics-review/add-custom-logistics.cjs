const fs=require('fs'),file=__dirname+'/prototype.js';let s=fs.readFileSync(file,'utf8');
s=s.replaceAll('q.vol.toFixed(2)','formatWeight(q.vol)').replaceAll('q.bill.toFixed(2)','formatWeight(q.bill)').replaceAll('q.gross.toFixed(2)','formatWeight(q.gross)');
s=s.replaceAll('${q.divisor}','${q.divisor??\'不自动折算\'}');
// 编辑时从已保存的报价快照恢复自定义名称及服务确认，不依赖临时表单。
s=s.replace("product:e?.product||'',manualTotal:e?.manualTotal||''","product:e?.product||'',customCarrierName:e?.quote?.customCarrierName||'',customServiceConfirmed:!!e?.quote?.customServiceConfirmed,manualTotal:e?.manualTotal||''");
s=s.replace('render();setInterval(',fs.readFileSync(__dirname+'/custom-logistics.js','utf8')+'\nrender();setInterval(');new Function(s);fs.writeFileSync(file,s);console.log('已增加自定义物流名称与人工报价');
