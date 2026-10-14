import json,sys,collections
sys.stdout.reconfigure(encoding='utf-8');d=json.load(open('E:/cxy/outputs/logistics-review/extracted.json',encoding='utf-8'))
def rowdict(r):return {''.join(x for x in c['cell'] if x.isalpha()):c['value'] for c in r}
for filename,sheets in d.items():
 if not filename.endswith('.xlsx'):continue
 print('\nFILE',filename)
 for s in sheets:
  rows=[rowdict(r) for r in s['rows']];print('SHEET',s['sheet'])
  if filename=='顺丰冷运.xlsx' and s['sheet'] in ['大件标快','大件到港']:
   data=[r for r in rows if r.get('L')=='阶梯累计计价'];cut=200 if s['sheet']=='大件标快' else 1000;second=500 if cut==200 else 3000
   issues=[]
   for r in data:
    try:
     expected1=cut*(r['G']-r['H']);expected2=cut*r['G']+(second-cut)*r['H']-second*r['I']
     if abs(expected1-r['J'])>.001 or abs(expected2-r['K'])>.001:issues.append((r['D'],r['J'],expected1,r['K'],expected2))
    except:issues.append((r.get('D'),'missing'))
   cities=collections.Counter(r['D'] for r in data)
   print('routes',len(data),'origins',set(r['B'] for r in data),'coefficient mismatches',issues[:12],'duplicate cities',[k for k,v in cities.items() if v>1])
  if filename=='顺丰冷运.xlsx' and s['sheet']=='大件到港 提送货':
   data=[r for r in rows if isinstance(r.get('D'),(int,float))];print('delivery N',[(r.get('B'),r.get('C')) for r in data if r.get('I')=='N'][:12]);print('missing numeric fields',[(r.get('B'),r.get('C')) for r in data if any(not isinstance(r.get(k),(int,float)) for k in ['D','E','F','G'])][:12])
  if filename=='顺丰常温.xlsx':
   data=[r for r in rows if r.get('D')=='对段加首重'];print('rows',len(data),'first price / first kg rate',[round(r['E']/r['F'],5) for r in data[:4]],'unique startweights',set(r.get('K') for r in data))
  if filename=='中通冷链.xlsx':
   data=[r for r in rows if isinstance(r.get('D'),(int,float))];print('rows',len(data),'zeros',[r for r in data if r['D']==0][:3]);print('Shanghai',[r for r in data if r.get('B')=='上海市'][:4])
print('\nTIME NOTES')
for f,sheets in d.items():
 if not f.endswith('.xlsx'):continue
 for s in sheets:
  for r in s['rows']:
   for c in r:
    v=c['value']
    if isinstance(v,str) and any(k in v for k in ['时效','执行日期','2025','2026','有效期']): print(f,s['sheet'],c['cell'],v[:160])
