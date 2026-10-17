const fs=require('fs'),path=__dirname+'/prototype.js';let s=fs.readFileSync(path,'utf8');const marker="render();setInterval(";if(!s.includes(marker))throw Error('初始化位置未找到');s=s.replace(marker,fs.readFileSync(__dirname+'/shipping-status.js','utf8')+'\n'+marker);
s=s.replace("occupied:'已占用',processed:'已拆合'","occupied:'已占用',processed:'已拆合',shipped:'已发货'");
// 防止关闭旧表单后，发货冻结校验返回空对象仍继续打开详情。
s=s.replace("let p=persistPlan('published');detail(p.id);","let p=persistPlan('published');if(!p)return;detail(p.id);");
new Function(s);fs.writeFileSync(path,s);console.log('已增加发货状态、筛选、仓库发货登记与历史记录');
