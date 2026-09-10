"""Populate a preserved PRD package with the order SLA specification."""
from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile
import hashlib
import io
import json
import re
from lxml import etree as E
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(r'E:\cxy')
REF=ROOT/'04-需求管理/PRD-OMS发货单拆单与合单功能-v1.0.docx'
SOURCE=ROOT/'04-需求管理/PRD-OMS订单履约时效管理-v1.1.md'
OUTPUT=SOURCE.with_suffix('.docx')
QA=ROOT/'脱骨侠发货单H5/tools/prd-qa-20260910/template-rewrite'
EXPECTED='59bb9de4d3e5d42a01484ce3ea9300669903c3255a1642e2e7194bf2c839eb7c'
assert hashlib.sha256(REF.read_bytes()).hexdigest()==EXPECTED
assert (QA/'artifact.md').exists()
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS={'w':W,'wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
def q(n):return '{'+W+'}'+n
def el(n,**attrs):
    x=E.Element(q(n))
    for k,v in attrs.items():x.set(q(k),str(v))
    return x
def child(x,n):
    c=x.find(q(n))
    if c is None:c=el(n);x.insert(0,c)
    return c
def xml(x):return E.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)

with ZipFile(REF) as z:
    parts={i.filename:z.read(i.filename) for i in z.infolist()}
    infos=z.infolist()
doc=E.fromstring(parts['word/document.xml'])
body=doc.find(q('body'))
ps=body.findall(q('p'));ts=body.findall(q('tbl'))
sect=deepcopy(body.find(q('sectPr')))
editable={'word/document.xml','word/header1.xml','docProps/core.xml',*[f'word/media/image{i}.png' for i in (1,2,3)]}
inventory={n:{'size':len(b),'sha256':hashlib.sha256(b).hexdigest(),'mode':'editable' if n in editable else 'preserve-only'} for n,b in parts.items()}
(QA/'package-inventory.json').write_text(json.dumps({'reference':str(REF),'sha256':EXPECTED,'parts':inventory,'relationships':parts['word/_rels/document.xml.rels'].decode()},ensure_ascii=False,indent=2),encoding='utf-8')

def para(pattern,text,bold_prefix=False):
    p=deepcopy(pattern)
    first=next((r for r in p.findall(q('r')) if r.find(q('t')) is not None),None)
    # Use the last textual run for body style when source has a bold lead-in.
    textual=[r for r in p.findall(q('r')) if r.find(q('t')) is not None]
    base=deepcopy(textual[-1].find(q('rPr'))) if textual and textual[-1].find(q('rPr')) is not None else None
    for c in list(p):
        if c.tag!=q('pPr'):p.remove(c)
    chunks=[text]
    if bold_prefix and '：' in text:chunks=[text.split('：',1)[0]+'：',text.split('：',1)[1]]
    for i,t in enumerate(chunks):
        r=el('r')
        chosen=first.find(q('rPr')) if len(chunks)>1 and i==0 and first is not None else base
        if chosen is not None:r.append(deepcopy(chosen))
        if len(chunks)>1 and i==0:child(r,'rPr').append(el('b'))
        tx=el('t');tx.text=t;tx.set('{http://www.w3.org/XML/1998/namespace}space','preserve');r.append(tx);p.append(r)
    return p

def table(rows):
    heads=rows[0];n=len(heads)
    if n==2:pattern=ts[8];widths=[2200,7160]
    elif n==4:
        pattern=ts[15] if heads[0]=='协作方' else ts[4]
        widths=[1700,2200,4560,900] if heads[0]=='协作方' else [1300,2450,3350,2260]
        if heads[0]=='场景':widths=[2300,2350,2700,2010]
    else:
        pattern=ts[2];widths=[2000,3500,3860]
        if heads[0]=='优先级':pattern=ts[5];widths=[900,2700,5760]
        elif heads[0]=='用户角色':widths=[1500,3880,3980]
        elif heads[0]=='模块':widths=[1500,5200,2660]
        elif heads[0]=='异常场景':pattern=ts[13];widths=[2400,4300,2660]
        elif heads[0]=='编号':widths=[800,2850,5710]
        elif heads[0]=='事件或数据':widths=[2800,2350,4210]
    t=deepcopy(pattern);grid=t.find(q('tblGrid'))
    for c in list(grid):grid.remove(c)
    for w in widths:grid.append(el('gridCol',w=w))
    original=t.findall(q('tr'))
    for r in original:t.remove(r)
    for i,row in enumerate(rows):
        tr=deepcopy(original[0] if i==0 else original[1])
        trPr=child(tr,'trPr')
        for item in list(trPr):
            if item.tag in [q('trHeight'),q('tblHeader')]:trPr.remove(item)
        if trPr.find(q('cantSplit')) is None:trPr.append(el('cantSplit'))
        if i==0:trPr.append(el('tblHeader',val='true'))
        for j,(c,value,w) in enumerate(zip(tr.findall(q('tc')),row,widths)):
            child(child(c,'tcPr'),'tcW').set(q('w'),str(w))
            template_p=c.find(q('p'))
            for old in c.findall(q('p')):c.remove(old)
            p=para(template_p,value)
            pr=child(p,'pPr')
            for k in pr.findall(q('keepNext')):pr.remove(k)
            if i==0:pr.append(el('keepNext'))
            # Keep short identifiers centered; prose stays left as in reference.
            if heads[0] in ['优先级','编号'] and j==0:child(pr,'jc').set(q('val'),'center')
            c.append(p)
        t.append(tr)
    return t

def panel(color,title,text):
    t=deepcopy(ts[{'blue':0,'green':1,'orange':6}[color]])
    c=t.find('.//'+q('tc'));p=c.findall(q('p'))
    for old in p:c.remove(old)
    c.append(para(p[0],title));c.append(para(p[1],text))
    return t

# Three newly drawn flow figures, keeping the reference palette and inline image pattern.
FONT=Path(r'C:\Windows\Fonts\msyh.ttc');BOLD=Path(r'C:\Windows\Fonts\msyhbd.ttc')
def font(size,bold=False):return ImageFont.truetype(str(BOLD if bold else FONT),size)
def canvas(height):
    im=Image.new('RGB',(2000,height),'white');return im,ImageDraw.Draw(im)
def txt(d,x,y,text,size=32,color='#243447',bold=False,anchor='mm'):
    d.text((x,y),text,font=font(size,bold),fill=color,anchor=anchor)
def box(d,x,y,w,h,title,lines=(),tone='blue'):
    colors={'blue':('#E8F2FB','#75B4DF'),'green':('#EAF5EC','#80B48E'),'orange':('#FFF4E7','#E3AA61'),'gray':('#F4F6FA','#ADB8C4'),'purple':('#F0EAF9','#AF99D3')}
    fill,border=colors[tone];d.rounded_rectangle((x,y,x+w,y+h),18,fill=fill,outline=border,width=2)
    txt(d,x+w/2,y+43,title,38,bold=True)
    for i,line in enumerate(lines):txt(d,x+w/2,y+95+i*44,line,30,color='#556575')
def arrow(d,x1,y1,x2,y2,color='#6F8190'):
    d.line((x1,y1,x2,y2),fill=color,width=4)
    if x2==x1:d.polygon([(x2,y2),(x2-10,y2-16),(x2+10,y2-16)],fill=color)
    else:d.polygon([(x2,y2),(x2-16,y2-10),(x2-16,y2+10)],fill=color)
def pill(d,y,text):
    d.rounded_rectangle((60,y,1940,y+72),14,fill='#F4F6FA',outline='#D9E1E8',width=2)
    txt(d,1000,y+36,text,29,color='#556575')
def bytes_image(im,index):
    b=io.BytesIO();im.save(b,format='PNG');data=b.getvalue();(QA/f'figure-{index}.png').write_bytes(data);return data,im.size

im,d=canvas(940)
txt(d,60,40,'六节点计时关系',42,bold=True,anchor='lm')
box(d,60,160,340,150,'订单提交成功',['同时启动两项待办'])
box(d,570,100,520,140,'财务审核',['提交 → 审核通过'])
box(d,570,280,520,140,'工厂接单',['提交 → 接单完成'])
d.line((400,235,475,235,475,170),fill='#6F8190',width=4);arrow(d,475,170,570,170)
d.line((475,235,475,350),fill='#6F8190',width=4);arrow(d,475,350,570,350)
box(d,1220,175,720,160,'各自完成  各自停止',['接单不等待财务通过','同步旺店通的业务门槛待确认'],'gray')
txt(d,60,490,'后续按各自业务事件计时',34,bold=True,anchor='lm')
items=[('发货',['旺店通同步成功起算','WMS收单且生成单号结束'],'blue'),('揽收',['WMS收到ERP订单起算','WMS出库完成结束'],'orange'),('签收',['WMS出库完成起算','客户实际签收结束'],'blue'),('回执上传',['实际签收起算','回执上传成功结束'],'green')]
for i,(title,lines,tone) in enumerate(items):
    x=60+i*490;box(d,x,540,410,190,title,lines,tone)
    if i<3:arrow(d,x+420,635,x+480,635)
pill(d,800,'发货与揽收可短暂并存；“是否回执＝否”是否跳过回执任务，待业务确认。')
figures={1:bytes_image(im,1)}

im,d=canvas(940)
txt(d,60,40,'订单适用规则选择',42,bold=True,anchor='lm')
box(d,60,100,1880,135,'已有订单有有效规则快照时，优先使用快照',['无快照时再按客户类型选择；客户档案后续修改不无声覆盖原规则'],'gray')
box(d,60,300,420,160,'非系统客户',['使用普通客户规则'])
box(d,600,300,650,160,'特殊商品方案优先',['未命中方案时读取标准库双时效'])
box(d,1370,300,570,160,'商品与普通节点计时',['商品时效衔接方式待D01确认'],'orange')
arrow(d,490,380,590,380);arrow(d,1260,380,1360,380)
box(d,60,530,420,160,'系统客户',['填写要求到货时间'])
box(d,600,530,650,160,'客户专属规则优先',['无专属时继承系统客户默认规则'])
box(d,1370,530,570,160,'按客户交期倒排',['回执仍从实际签收后计算'],'green')
arrow(d,490,610,590,610);arrow(d,1260,610,1360,610)
pill(d,780,'系统客户缺交期或规则无效：提示待补充或待检查，不回退普通固定时效。')
figures[2]=bytes_image(im,2)

im,d=canvas(690)
txt(d,60,40,'履约总览查看路径',42,bold=True,anchor='lm')
for i,(title,lines,tone) in enumerate([
    ('客户范围',['全部订单','系统客户'],'gray'),
    ('总览指标',['超时  预警','交期风险'],'blue'),
    ('六节点卡片',['财务与接单并行','点击选择节点'],'blue'),
    ('下方订单明细',['完整订单资料','支持查询筛选'],'green')]):
    x=60+i*490;box(d,x,140,410,210,title,lines,tone)
    if i<3:arrow(d,x+420,245,x+480,245)
box(d,60,440,1080,145,'切换指标或节点，只更新下方订单',['列表关键词和日期查询不改变上方总览统计'],'gray')
box(d,1370,440,570,145,'单笔订单详情',['从所选节点定位待办'],'blue')
d.line((1755,360,1755,430),fill='#6F8190',width=4);arrow(d,1755,410,1755,440)
figures[3]=bytes_image(im,3)

for old in list(body):body.remove(old)
body.append(deepcopy(ps[0]))
metadata=3
lines=SOURCE.read_text(encoding='utf-8').splitlines();i=0;cover_end=False
while i<len(lines):
    line=lines[i].strip();i+=1
    if not line:continue
    if line.startswith('# '):
        p=para(ps[1],line[2:]);pr=child(p,'pPr');child(pr,'pStyle').set(q('val'),'Title')
        # The source cover title has no rule. Suppress the unused Title style's inherited border.
        borders=child(pr,'pBdr')
        for edge in ['top','left','bottom','right','between','bar']:borders.append(el(edge,val='nil'))
        body.append(p)
    elif line.startswith('@subtitle '):body.append(para(ps[2],line[10:]))
    elif line.startswith('@meta '):
        body.append(para(ps[metadata],line[6:],True));metadata+=1
    elif line.startswith('@panel '):
        _,color,title=line.split(' ',2)
        if not cover_end:body.append(deepcopy(ps[10]));cover_end=True
        content=lines[i].strip();i+=1
        body.append(panel(color,title,content))
    elif line.startswith('## '):body.append(para(ps[12],line[3:]))
    elif line.startswith('### '):body.append(para(ps[31],line[4:]))
    elif line.startswith('- '):body.append(para(ps[19],line[2:],True))
    elif re.match(r'^\d+\. ',line):body.append(para(ps[86],re.sub(r'^\d+\. ','',line)))
    elif line.startswith('@figure '):
        index=int(line.split()[1]);p=deepcopy(ps[{1:38,2:41,3:45}[index]])
        pr=child(p,'pPr');pr.append(el('keepNext'))
        data,(w,h)=figures[index];width=5897880;height=round(width*h/w)
        for extent in p.xpath('.//wp:extent | .//a:xfrm/a:ext',namespaces=NS):extent.set('cx',str(width));extent.set('cy',str(height))
        label={1:'六节点计时与并行审核关系',2:'普通客户与系统客户规则选择',3:'总览指标与订单明细联动'}[index]
        for prop in p.xpath('.//wp:docPr',namespaces=NS):prop.set('title',label);prop.set('descr',label)
        for prop in p.xpath('.//*[local-name()="cNvPr"]'):prop.set('name',f'sla-flow-{index}.png')
        parts[f'word/media/image{index}.png']=data;body.append(p)
    elif line.startswith('@caption '):body.append(para(ps[39],line[9:]))
    elif line.startswith('|'):
        rows=[];i-=1
        while i<len(lines) and lines[i].strip().startswith('|'):
            row=[c.strip() for c in lines[i].strip().strip('|').split('|')];i+=1
            if not all(re.fullmatch(':?-+:?',c) for c in row):rows.append(row)
        body.append(table(rows))
    else:body.append(para(ps[13],line))
# Word requires a paragraph after the final table; keep that structural paragraph tiny.
tail=el('p');tail_pr=el('pPr');tail_pr.append(el('spacing',before=0,after=0,line=20,lineRule='exact'))
tail_mark=el('rPr');tail_mark.append(el('sz',val=2));tail_pr.append(tail_mark);tail.append(tail_pr)
body.append(tail);body.append(sect)
parts['word/document.xml']=xml(doc)
header=E.fromstring(parts['word/header1.xml'])
for t in header.iter(q('t')):
    if t.text and 'OMS发货单拆单与合单' in t.text:t.text=t.text.replace('OMS发货单拆单与合单','OMS订单履约时效管理')
parts['word/header1.xml']=xml(header)
core=E.fromstring(parts['docProps/core.xml'])
for c in core:
    name=E.QName(c).localname
    if name=='title':c.text='OMS订单履约时效管理'
    elif name in ['creator','lastModifiedBy','subject','description','keywords']:c.text=''
    elif name in ['created','modified']:c.text='2026-09-10T00:00:00Z'
parts['docProps/core.xml']=xml(core)
with ZipFile(OUTPUT,'w') as z:
    for info in infos:z.writestr(info,parts[info.filename])
with ZipFile(OUTPUT) as z:
    preserve_ok=all(hashlib.sha256(z.read(n)).hexdigest()==v['sha256'] for n,v in inventory.items() if v['mode']=='preserve-only')
    assert preserve_ok
assert hashlib.sha256(REF.read_bytes()).hexdigest()==EXPECTED
assert E.tostring(doc.find('.//'+q('sectPr')))==E.tostring(sect)
h1=doc.xpath('//w:p[w:pPr/w:pStyle[@w:val="Heading1"]]',namespaces=NS)
assert len(h1)==9
text=''.join(doc.xpath('//w:t/text()',namespaces=NS))
for forbidden in ['陈薪宇','多级拆合重组','售后完成后向旺店通推送1条','最小可拆条件','旺店通拆合单交互演示']:
    assert forbidden not in text,forbidden
report={'output':str(OUTPUT),'bytes':OUTPUT.stat().st_size,'characters':len(text),'h1_count':len(h1),'table_count':len(body.findall(q('tbl'))),'image_count':len(figures),'preserve_only_parts_unchanged':preserve_ok,'reference_sha256':EXPECTED}
(QA/'build-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
