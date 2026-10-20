from pathlib import Path
from zipfile import ZipFile
from lxml import etree
import re
import shutil

root = Path('E:/cxy')
doc = root/'04-需求管理/PRD-OMS订单履约时效管理-v1.0.docx'
md = doc.with_suffix('.md')
qa = root/'脱骨侠发货单H5/tools/prd-qa-20260910/remove-sections'
qa.mkdir(parents=True, exist_ok=True)
for p in (doc, md):
    backup = qa/p.name
    if not backup.exists(): shutil.copy2(p, backup)
ns = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
with ZipFile(doc) as z:
    infos = z.infolist()
    parts = {i.filename:z.read(i.filename) for i in infos}
xml = etree.fromstring(parts['word/document.xml'])
body = xml.find('w:body', ns)
removing = False
removed = 0
for el in list(body):
    text = ''.join(el.xpath('.//w:t/text()', namespaces=ns))
    if text == '4.3 本期边界': removing = True
    if text == '6. 原型或流程图': removing = False
    if removing:
        body.remove(el)
        removed += 1
assert removed > 0
for p in body.xpath('.//w:p', namespaces=ns):
    style = p.find('w:pPr/w:pStyle', ns)
    ts = p.findall('.//w:t', ns)
    if style is not None and style.get('{'+ns['w']+'}val') in ('Heading1','Heading2') and ts:
        ts[0].text = re.sub(r'^(10|[6-9])(?=\.)', lambda m:str(int(m[1])-1), ts[0].text or '')
for t in body.findall('.//w:t', ns):
    t.text = (t.text or '').replace('第10章','第9章').replace('第 10 章','第 9 章').replace('7.4节','6.4节').replace('7.4 节','6.4 节').replace('9.4节','8.4节').replace('9.4 节','8.4 节')
parts['word/document.xml'] = etree.tostring(xml, xml_declaration=True, encoding='UTF-8', standalone=True)
temp = qa/'updated.docx'
with ZipFile(temp, 'w') as z:
    for info in infos: z.writestr(info, parts[info.filename])
output = doc.with_name(doc.stem+'-精简版.docx')
shutil.copyfile(temp, output)
source = md.read_text(encoding='utf-8')
source = re.sub(r'### 4\.3 本期边界\n.*?(?=## 6\. 原型或流程图)', '', source, flags=re.S)
source = re.sub(r'^(#{2,3} )(10|[6-9])(?=\.)', lambda m:m[1]+str(int(m[2])-1), source, flags=re.M)
source = source.replace('第10章','第9章').replace('7.4节','6.4节').replace('9.4节','8.4节')
output.with_suffix('.md').write_text(source, encoding='utf-8')
assert '本期边界' not in source and '优先级说明' not in source
print('Removed blocks:', removed)
print('Updated:', output)
