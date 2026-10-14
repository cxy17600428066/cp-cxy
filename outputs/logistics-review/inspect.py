import json,sys
sys.stdout.reconfigure(encoding='utf-8')
d=json.load(open('E:/cxy/outputs/logistics-review/extracted.json',encoding='utf-8'))
for file,sheets in d.items():
    if not file.endswith('xlsx'):continue
    print('\nFILE:',file)
    for s in sheets:
        print('\nSHEET:',s['sheet'],'size',s['size'],'merges',s['merged'][:12])
        rows=s['rows']
        selected=rows if len(rows)<100 else rows[:14]+rows[-12:]
        for r in selected:print(' | '.join(c['cell']+'='+str(c['value']) for c in r))
        if len(rows)>=100:
            print('OTHER NOTE ROWS:')
            for r in rows[14:-12]:
                if any(isinstance(c['value'],str) and (len(c['value'])>35 or any(k in c['value'] for k in ['备注','计费','时效','折扣','续重','首重','优惠','公斤','元/','体积','重量','有效','日期','税'])) for c in r):print(' | '.join(c['cell']+'='+str(c['value']) for c in r))
