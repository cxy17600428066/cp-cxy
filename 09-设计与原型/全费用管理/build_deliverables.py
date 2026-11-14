from pathlib import Path
import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).parent
DOCUMENT_PATH = ROOT.parents[1] / '05-产品方案' / '脱骨侠全费用管理规则建议稿V1.docx'
RULES = [
{'id':'R01','title':'有效销售与计提节点','lead':'下单测算，签收计提。','items':[
'订单确认后展示预计贡献、预计返利和预计服务费，不增加正式可用额度。以 OMS 有效签收事件作为费用管理计提节点，部分签收按已签收部分计算。',
'取消订单不计提。退货和折让引用原销售记录及原规则，通过反向或调整记录处理。',
'回款作为回款奖励、结算或特殊政策的条件，默认不作为所有销售贡献的计提前提。',
'订单确认时锁定价格和适用政策版本，签收计算引用锁定版本。保留销售明细、事件版本和计算快照，支持复算。',
'示例：订单金额 100,000 元，已签收 60,000 元，只对已签收部分正式计提，其余保持预计。这里的计提是管理台账动作，财务收入和凭证按财务口径执行。']},
{'id':'R02','title':'总费用包边界','lead':'费用归属随政策版本固定，余额不足不得临时变更归属。','table':[
['项目','默认归属','处理方式'],['合同价 折扣 临时特价','成交价格','在成交额体现，不重复扣包'],['年返 季返 增量返 回款奖励','包内','按批准条件预留和确认'],['托盘及客户专属日常服务','包内','按合同预留和确认'],['陈列 试吃 地推 新品推广','包内','活动额度先占用后核销'],['营销赠品 样品 物料','包内','按成本管理，关联促销或活动'],['已含在产品或履约成本的支出','原成本项目','可展示分析，不重复扣包'],['总部战略 公共品牌 跨中心专项','独立专项','单列预算来源和受益对象']],
'items':['仓储配送按事项区分：属于正常履约成本的不再扣包，额外购买的客户专项服务可经批准纳入包内。已有合同约定优先。','同一服务事项只确认一次。服务商执行试吃属于活动执行费，不因收款方是服务商再计托盘费。现金、抵扣及实物交付不是新增费用。','没有订单的公共活动或固定服务费关联项目、期间、批准预算或分摊依据，不虚构订单。']},
{'id':'R03','title':'金额与税口径','lead':'统一管理计费基数，支付与费用保留税额桥接。','items':[
'默认销售计费基数为实际成交的不含税销售金额，扣除有效退货和销售折让。合同约定其他基数时单独配置并保留差异。',
'保存原始含税金额、不含税金额、税额、币种及计费基数。费用占用和确认使用同一管理成本口径，支付与费用之间保留税额及其他差异明细。',
'后续返利单独计算，不自动反向扣减自身计费基数。经营分析若已引用扣除返利后的财务收入，不再重复扣返利。',
'管理费用分类不直接决定会计分类，应付客户对价可能涉及冲减交易价格，系统应保留财务映射能力。',
'最终入账金额保留两位小数，中间计算保留更高精度。分摊先按分计算，尾差补到金额最大明细；相同金额按稳定明细编号顺序处理。拆分合计必须等于原金额。']},
{'id':'R04','title':'阶梯价格','lead':'首期优先支持单次订单，周期累计价格独立配置。','items':[
'普通价格优先支持客户、SKU、单次订单数量的阶梯。合同未约定组合计量时，不合并不同 SKU 数量。',
'全量享价与超量部分享价必须明确二选一。周期累计价格单列累计周期、SKU 范围和补差方式。',
'订单确认后锁定成交价和政策版本。后续改价走审批调整，不直接覆盖历史。',
'单次阶梯退货后按有效数量重新判断，是否追补价差依合同；累计阶梯重新计算累计有效数量，历史价差通过调整单处理。',
'合同未约定退货补差时，进入人工处理，不自动向客户追加应收。']},
{'id':'R05','title':'返利预留与动态复核','lead':'年度预测与正式预留分开，已发生销售触发正式计算。','items':[
'预测返利根据年度预测销售测算，仅用于分析；正式预留根据实际有效销售和批准政策计算，影响费用额度。',
'默认按实际累计销售已达到档位计算正式预留，全额达档与分段返利采用不同算法。',
'有效销售、退货、折让或批准调整后，重算累计应预留。差额与未确认预留及累计已确认金额比较；已支付金额仍包含在累计已确认中。',
'累计应预留增加则补提，减少则释放可释放预留；已确认不可退义务不能自动取消，差额进入例外处理。预留转确认不再扣额度。',
'跨档补提不足时登记缺口，暂停相关新活动额度释放，不压低返利义务。未到起返门槛默认正式预留为零，并展示预测风险；批准预估政策要求提前预留时从其规定。',
'返利确认和结算前校验达成条件、期间和审批材料。示例：100 万元按 1% 已预留 1 万元，累计 200 万元适用全额 2% 时，应预留 4 万元，补提 3 万元。']},
{'id':'R06','title':'额度释放与组织分配','lead':'先预留，再解锁，再分池，不允许账户透支。','items':[
'有效签收形成贡献，扣除包内客户预留后，校验政策及缺口。默认剩余额度全部解锁，再按组织比例分配。',
'年度目标默认用于经营评估，不自动作为解锁门槛。合同或政策明确要求目标门槛时，未达部分进入待解锁。',
'政策缺失、冲突、计算异常或超包缺口，暂停相关新额度释放，不自动收回已批准占用，不取消已成立合同义务。',
'试算比例建议总部 10%、中心 20%、大区 20%、省区 50%，按中心和有效期配置，合计必须为 100%。这不是已批准正式比例。',
'默认进入组织统筹池并保留来源客户。合同专属额度单独限制用途。允许批准后支持其他客户，记录实际受益客户。',
'跨中心、跨法人和跨专项来源不得自动调拨。缺口独立记录，补足后才能新增占用。多池承担分别授权，最终占用作为一个整体提交。']},
{'id':'R07','title':'政策匹配与叠加','lead':'同类政策唯一匹配，不同类型显式配置叠加关系。','items':[
'先校验法人、业务模式、客户或集团，再校验合同项目、SKU、区域、有效期、适用及排除条件。',
'同类优先级为已批准项目专项、客户专项、集团政策、中心通用政策。同优先级仍有多条匹配时报冲突，不按创建时间或金额自动选择。',
'基础价和数量阶梯价形成一个最终成交价。特价与额外折扣默认不叠加，年返与增量或结构返利默认不叠加，经政策批准可开放。',
'返利与真实独立服务可并存；同一服务与活动不得重复确认；同一活动可多池承担，分别授权且总额受控。',
'明确批准不返利或无服务商的，可按零费用处理。政策未知或未维护不得擅自按零。新版本不覆盖历史，追溯变更需审批并生成调整记录。']},
{'id':'R08','title':'实物费用成本与调整','lead':'预算使用批准成本，实际确认关联库存成本。','items':[
'申请阶段按批准的标准或预计成本占用预算，出库关联库存系统实际出库成本。接口未具备时受控导入并标记成本待核对。',
'核销确认一次费用，出库和供应商付款不新增第二笔费用。预算与实际成本差额通过追加或释放处理。',
'退库关联原出库，按原成本或库存系统确认的冲回成本调整。报损需审批，不作为正常使用核销。',
'随单赠品与活动领用分开识别，均绑定促销或活动编号；退库、报损和取消领用保留原记录关联。']},
{'id':'R09','title':'审批与岗位授权','lead':'常规事项按金额授权，特殊事项强制升级，禁止自批。','table':[
['单笔申请或项目累计金额','试点建议审批路径'],['不超过 10,000 元','各承担池负责人'],['超过 10,000 元且不超过 50,000 元','各承担池负责人及中心负责人'],['超过 50,000 元','各承担池负责人 中心负责人 总部授权负责人']],
'items':[
'以上金额为原型和试点建议，现行授权制度优先，所有档位必须可配置。政策发布、确认、核销、结算按事项加入业务审核和财务复核。',
'多池由各池分别授权。超预算、跨中心、跨法人、追溯改政策和缺口补足，无论金额均升级。收款主体或账户变更独立财务审核。',
'申请人不得审批本人申请，负责人发起时转上级。同项目追加按累计金额判断权限，防止拆单绕过审批。付款按财务支付授权执行。',
'全部审批完成时正式占用额度，最终提交中校验并锁定余额。待审仅展示预计影响，不保证额度；不足时保留单据和已审记录，转待补足，不留部分占用。',
'驳回保留意见和输入。核销经执行确认与财务复核后转使用，结项释放差额；付款不再次扣费用池。']},
{'id':'R10','title':'期初与历史迁移','lead':'首期采用切换日期初加未结业务，不默认重算全部历史。','items':[
'分别导入活动可用、待解锁、活动占用、未确认预留、已确认待结算、已结算未清偿。未结业务保留合同、政策、单据和来源关联。',
'历史明细以查询或归档保留，确需重算另行专项处理。期初由业务与财务签认，迁移批次及核对结果可追溯。',
'切换前业务不得再次生成贡献。历史订单切换后退货，关联原订单及已迁移余额后调整；未完成映射先进入异常，不自动冲减新账户。',
'已关账不覆盖，调整记当前开放期并保留原业务期间。上线后差错通过调整单修正，不直接改历史余额。']},
{'id':'R11','title':'接口对账与恢复','lead':'核心计算事件优先自动化，外围接口允许受控导入。','table':[
['接口','首期建议'],['SKU 组织 客户关系 政策版本','受控同步，保证编码和版本一致'],['签收 退货 折让 取消','优先自动对接，支持去重 补拉 重放'],['库存出库和退库','自动回写或受控导入'],['结算 支付 抵扣 退款','自动回写或财务复核导入'],['回款状态','启用回款奖励或解锁政策前具备']],
'items':[
'按来源、单据行、事件类型和版本识别唯一事件，同一事件只入账一次。更正走新版本或调整事件。',
'贡献、预留及分池同批整体成功或失败。导入与重试记录来源、操作人、批次和结果。未收到支付或交付结果不标记完成。',
'每日核对销售完整性、计算拆分、分池、流水余额、返利跨档、核销、实物及清偿。差异生成工单，明确责任与处理期限，月结前未解释差异为零。',
'严重错误暂停相关新额度释放和申请，保留业务事件，修复后幂等重放。已确认、核销、结算或支付业务通过调整单恢复。']}
]
(ROOT/'rules.json').write_text(json.dumps(RULES,ensure_ascii=False,indent=2),encoding='utf-8')
doc=Document()
sec=doc.sections[0]
sec.page_height=Cm(29.7);sec.page_width=Cm(21);sec.top_margin=Cm(1.8);sec.bottom_margin=Cm(1.7);sec.left_margin=Cm(2);sec.right_margin=Cm(2)
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2']:
 s=doc.styles[name];s.font.name='Microsoft YaHei';s.font.color.rgb=RGBColor(0,0,0);s.element.rPr.rFonts.set(qn('w:eastAsia'),'Microsoft YaHei')
normal=doc.styles['Normal'];normal.font.size=Pt(10.5);normal.paragraph_format.space_after=Pt(5);normal.paragraph_format.line_spacing=1.12
doc.styles['Title'].font.size=Pt(24);doc.styles['Title'].paragraph_format.space_after=Pt(12)
doc.styles['Heading 1'].font.size=Pt(15);doc.styles['Heading 1'].paragraph_format.space_before=Pt(10);doc.styles['Heading 1'].paragraph_format.space_after=Pt(6)
doc.styles['Heading 2'].font.size=Pt(11.5)
def p(t,bold=False):
 x=doc.add_paragraph();x.add_run(t).bold=bold;return x
def table(rows):
 t=doc.add_table(rows=0, cols=len(rows[0]));t.autofit=False
 widths=[5,3,9] if len(rows[0])==3 else [7,10]
 for col,w in zip(t.columns,widths):col.width=Cm(w)
 for ri,row in enumerate(rows):
  cells=t.add_row().cells
  for ci,txt in enumerate(row):
   cells[ci].text=txt
   tcPr=cells[ci]._tc.get_or_add_tcPr()
   sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'E8EEF4' if ri==0 else ('F7F9FB' if ri%2==0 else 'FFFFFF'));tcPr.append(sh)
   bd=OxmlElement('w:tcBorders')
   for side in ['top','left','bottom','right']:
    e=OxmlElement('w:'+side);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');bd.append(e)
   tcPr.append(bd)
   margins=OxmlElement('w:tcMar')
   for side in ['top','left','bottom','right']:
    e=OxmlElement('w:'+side);e.set(qn('w:w'),'90');e.set(qn('w:type'),'dxa');margins.append(e)
   tcPr.append(margins)
   va=OxmlElement('w:vAlign');va.set(qn('w:val'),'center');tcPr.append(va)
   for para in cells[ci].paragraphs:
    para.paragraph_format.space_after=Pt(2);para.paragraph_format.line_spacing=1.1
    for run in para.runs:run.font.size=Pt(9);run.bold=ri==0
  cant=OxmlElement('w:cantSplit');t.rows[-1]._tr.get_or_add_trPr().append(cant)
  if ri==0:t.rows[-1]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
 return t
def rule(idx):
 r=RULES[idx];doc.add_heading(r['id']+' '+r['title'],1);p(r['lead'],True)
 if 'table' in r:table(r['table'])
 for i,txt in enumerate(r['items'],1):p(str(i)+'．'+txt)

doc.add_heading('脱骨侠全费用管理规则建议稿',0)
p('产品评审版  V1.0  2026年11月14日',True)
p('本规则用于客户策略与全费用管理的首轮需求评审、原型走查和试点设计。统一管理客户政策、销售贡献、费用预留、组织分配、执行核销、结算与清偿，覆盖大客、休食、餐饮、私域四个中心。')
p('新增口径、组织比例及审批档位为产品建议，已签合同和现行授权制度优先。政策和参数经业务、财务及授权负责人批准后方可正式启用。')
p('职责边界：CRM 维护客户政策；OMS 确定成交价并输出有效销售事件；费用模块维护计算、账户、流水和单据；财务及库存系统回写清偿和交付结果。各入口共享同一账本，不另建余额。')
rule(0)
doc.add_page_break();rule(1);rule(2)
doc.add_page_break();rule(3);rule(4)
doc.add_page_break();rule(5);rule(6)
doc.add_page_break();rule(7);rule(8)
doc.add_page_break();rule(9);rule(10)
doc.add_page_break();doc.add_heading('计算与对平口径',1)
p('总贡献 Ti＝有效计费基数 Bi × SKU 总费率 ri。客户预留 Ci＝返利 Ri＋服务 Si＋其他包内费用 Oi。活动剩余额度 Ui＝Ti－Ci。多 SKU 按行计算后求和，不平均费率。')
p('活动可用＝期初＋已解锁入池＋调入和专项补充－冲回－调出－累计净核销－未核销占用。付款不再扣池。')
p('未确认预留＝累计有效预留及调整－已转确认－批准释放。已确认待结算＝累计净确认－已转结算。已结算未清偿＝累计有效结算－现金支付－货款抵扣及其他有效清偿。')
p('示例：总贡献 10,000 元＝未确认预留 3,000 元＋已确认投入 3,500 元＋活动占用 500 元＋活动可用 3,000 元。已付和未付是确认投入的后续清偿状态，不重复加入贡献对平。待解锁、专项、调拨和冲回须单列。')
doc.add_heading('原型范围与走查方式',1)
p('配套 HTML 为离线交互原型，全部客户、合同、单据、金额和角色均为演示数据，不连接 CRM、OMS、财务或库存系统。浏览器内保存模拟操作，可随时重置。规则试算不自动写入演示账本。')
p('主要路径：客户总台账查看金额与来源 → 计算试算验证贡献和预留 → 费用池查看组织余额 → 发起活动 → 切换模拟审批角色逐项批准 → 提交核销并完成业务与财务复核 → 结项释放余款 → 在结算清偿中登记现金和抵扣。')
p('复杂阶梯定价、跨期迁移、真实合同匹配、实物库存、预算追加和缺口补足的自动化不在本原型交互范围，规则已保留供后续详细设计。原型中的模拟角色切换不构成生产权限控制。')
doc.add_heading('验收重点',1)
for t in ['真实合同及手工计算结果作为对照，覆盖经销与托盘、多 SKU、阶梯跨档、部分签收及退货。','活动多池分别授权，批准时原子校验余额；自批、越权、重复提交和并发超用不得形成错误余额。','预留转确认、核销、支付及实物交付不重复扣减，核销余款释放和组合清偿金额准确。','来源客户、受益客户、承担组织和收款主体分别保留；可追溯政策、合同、销售行、审批和调整链。','上线前来源交易与流水余额无未解释差异，期初签认，切换日明确，关键金额与权限场景全部通过。']:p('• '+t)
doc.add_heading('依据',1)
p('业务依据：脱骨侠客户策略与全费用管理可行性方案 V4.0，2026年11月11日。产品补充规则依据本次需求讨论。')
p('财务映射参考：财政部 企业会计准则第14号 收入。https://kjs.mof.gov.cn/zt/kjzzss/kuaijizhunzeshishi/201709/t20170907_2694006.htm')
footer=sec.footer.paragraphs[0];footer.alignment=2
run=footer.add_run('脱骨侠全费用管理  ·  ');run.font.size=Pt(8)
fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');footer._p.append(fld)
for element in [doc.styles.element,doc.element]:
 for border in element.xpath('.//w:pBdr'):
  border.getparent().remove(border)
doc.save(DOCUMENT_PATH)
htmlpath=ROOT/'原型.html'
html=htmlpath.read_text(encoding='utf-8')
if '__RULES__' in html:
 htmlpath.write_text(html.replace('__RULES__',json.dumps(RULES,ensure_ascii=False).replace('</','<\\/')),encoding='utf-8')
print('Created DOCX and rule data')
