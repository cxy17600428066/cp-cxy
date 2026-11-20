from pathlib import Path
p=Path('E:/cxy/09-设计与原型/自定义活动管理/活动执行填报.html')
s=p.read_text(encoding='utf-8')
s=s.replace('<h2>关联活动申请</h2>','<h2>申请信息（自动带入，不可修改）</h2>')
s=s.replace('<label>活动名称<input readonly value="连锁系统团购专项支持"></label>','<label>活动类型<input readonly value="自定义活动"></label>')
anchor='<label>计划执行日期<input readonly value="2026-10-01 至 2026-11-30"></label>'
extra='''<label>特殊事项分类<input readonly value="团购 / 增量奖励"></label><label>产品属性<input readonly value="常温休食"></label><label>事业中心<input readonly value="大客"></label><label>渠道类型<input readonly value="超市卤味档口"></label><label>我司承担比例<input readonly value="100%"></label><label>经销商承担比例<input readonly value="0%"></label><label>支付方式<input readonly value="对公付款"></label><label>预计费用总额（元）<input readonly value="1746.88"></label><label>我司申请承担（元）<input readonly value="1746.88"></label><label>经销商申请承担（元）<input readonly value="0.00"></label><label class="wide">申请事由与活动目标<textarea readonly>配合系统团购活动，申请专项奖励及第三方结算费用支持。</textarea></label><label class="wide">申请执行方案 / 奖励规则<textarea readonly>以审核确认的团购订单为依据，按约定档位计算奖励；预估奖励预算1600元。仅适用于本次活动，实际奖励不得超过审批上限。</textarea></label><label class="wide">申请费用说明<input readonly value="示例团购奖励及第三方服务、税费"></label>'''
assert anchor in s
s=s.replace(anchor,anchor+extra)
s=s.replace('独立演示页面，关联信息需在正式系统中由已审批申请自动带入。','申请信息及费用预算仅供查看。以下实际执行数据由填报人填写；当前关联数据为演示，正式系统须按申请单号带入审批通过版本。')
s=s.replace('<h2>实际执行情况</h2>','<h2>实际执行情况（需要填写）</h2>').replace('<h2>实际费用与承担</h2>','<h2>实际费用与承担（仅填实际数据）</h2>')
# Do not restore stale browser drafts into immutable application data.
s=s.replace("if(data[i]!=null)e.value=data[i]","if(data[i]!=null&&!e.readOnly&&!e.disabled)e.value=data[i]")
s=s.replace('</style>','#custom-activity input[readonly],#custom-activity textarea[readonly]{background:var(--p-bg);color:var(--p-sub)}#custom-activity input[readonly]{cursor:default}</style>',1)
p.write_text(s,encoding='utf-8')
