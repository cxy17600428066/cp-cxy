from pathlib import Path
p=Path('outputs/customer-bills.js')
s=p.read_text(encoding='utf-8')
s=s.replace("function confirmed(b){return b.orders.reduce((s,o)=>s+o.allocated,0)}", "function confirmed(b){return b.orders.reduce((s,o)=>s+(o.status==='已对账'?o.amount:0),0)}")
s=s.replace('已分配确认金额','已确认金额').replace('已分配确认','已确认金额').replace('待分配金额','待确认金额').replace('待分配','待确认').replace('查看详情 / 分配订单','查看账单详情').replace('账单金额','应确认金额')
s=s.replace('先选择订单，再分配本次确认金额；仅当订单累计确认金额等于订单金额时，才能标记为已对账。','核对该账期内的订单后，单笔或批量确认对账。已确认金额按已对账订单的金额自动汇总。')
s=s.replace('<button class="primary" id="allocateBtn" disabled onclick="openAllocate()">分配确认金额</button>','').replace('<button id="confirmBtn"','<button class="primary" id="confirmBtn"')
s=s.replace("['allocateBtn','confirmBtn','pendingBtn','abnormalBtn']","['confirmBtn','pendingBtn','abnormalBtn']")
s=s.replace('累计确认金额','已确认金额').replace('${fmt(o.allocated)}',"${fmt(o.status==='已对账'?o.amount:0)}").replace('${fmt(o.amount-o.allocated)}',"${fmt(o.status==='已对账'?0:o.amount)}")
s=s.replace("onclick=\"chosen=new Set(['${o.id}']);openAllocate()\">分配金额", "onclick=\"chosen=new Set(['${o.id}']);changeStatus('${o.status==='已对账'?'待对账':'已对账'}')\">${o.status==='已对账'?'撤销确认':'确认对账'}")
a=s.index('function openAllocate()');b=s.index('function changeStatus',a);s=s[:a]+s[b:]
a=s.index("if(s==='已对账'&&list.some");b=s.index("let note='';",a);s=s[:a]+s[b:]
s=s.replace('已分配金额将保留。','账单已确认和待确认金额将同步更新。')
s=s.replace('o.status=s;o.note=note;',"o.status=s;delete o.allocated;o.note=note;")
# Legacy partial monetary allocations are discarded; order status determines confirmation.
s=s.replace("let active=null", "bills.forEach(b=>b.orders.forEach(o=>{delete o.allocated;if(o.note==='已核对部分收款，剩余金额待确认。')o.note='订单待财务核对确认。'}));\nlet active=null")
# A concrete example: five unconfirmed October orders total exactly 10,000 yuan.
s=s.replace("let active=null", "let exampleDone=false;try{exampleDone=localStorage.getItem('bill-confirmation-example-v1')==='yes'}catch{}\nif(!exampleDone){const b=bills.find(b=>b.month==='2026-10'&&b.customer===customers[0]);if(b&&b.orders.every(o=>o.status==='待对账')){b.orders.forEach((o,i)=>o.amount=[120000,180000,250000,150000,300000][i]);}try{localStorage.setItem('customer-bills-demo-v2',JSON.stringify(bills));localStorage.setItem('bill-confirmation-example-v1','yes')}catch{}}\nlet active=null")
p.write_text(s,encoding='utf-8')
p=Path('outputs/财务对账.html');s=p.read_text(encoding='utf-8-sig');s=s.replace('在账单详情中分配并确认每笔订单','在账单详情中逐笔或批量确认订单是否已对账');a=s.index('<dialog id="allocation">');b=s.index('<script src=',a);s=s[:a]+s[b:];p.write_text(s,encoding='utf-8')
