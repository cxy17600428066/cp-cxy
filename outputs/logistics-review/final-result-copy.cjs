const fs=require('fs'),p=__dirname+'/prototype.js';let s=fs.readFileSync(p,'utf8');s=s.replaceAll('等待仓库登记发货','等待计划部登记发货');fs.writeFileSync(p,s);
