from pathlib import Path
root = Path(__file__).parent
file = root / '原型.html'
html = file.read_text(encoding='utf-8')
html = html.replace("if(page==='calculator')calculate();", "if(page==='calculator'&&$('calcForm'))calculate();")
html = html.replace("function render(){\n", "function render(){\n ensureSchemes();\n", 1) if ' ensureSchemes();' not in html else html
extension = (root / 'customer-schemes.js').read_text(encoding='utf-8')
start, end = '// CUSTOMER_SCHEMES_START', '// CUSTOMER_SCHEMES_END'
if start in html:
 a, rest = html.split(start, 1)
 _, b = rest.split(end, 1)
 html = a + start + '\n' + extension + '\n' + end + b
else:
 html = html.replace('render();save();\n</script>', start + '\n' + extension + '\n' + end + '\nrender();save();\n</script>')
controller=(root / 'page-navigation.js').read_text(encoding='utf-8')
boot='if(location.hash)restorePageHash();else writeRoute(true);'
controller=controller.replace(boot,'')
navigation = '\n'.join([(root/'dealer-catalog.js').read_text(encoding='utf-8'),(root/'customer-ledger.js').read_text(encoding='utf-8'),controller,(root/'dealer-integration.js').read_text(encoding='utf-8'),(root/'fund-flow.js').read_text(encoding='utf-8'),boot])
html=html.replace('ensureSchemes();\n','ensureSchemes();\n ensurePrograms();\n') if ' ensurePrograms();' not in html else html
html=html.replace('ledger:ledgerView,policies:policyView,','ledger:ledgerView,policies:policyView,programs:programListView,')
nav_start, nav_end = '// PAGE_NAV_START', '// PAGE_NAV_END'
if nav_start in html:
 a, rest = html.split(nav_start, 1)
 _, b = rest.split(nav_end, 1)
 html = a + nav_start + '\n' + navigation + '\n' + nav_end + b
else:
 html = html.replace('render();save();\n</script>', nav_start+'\n'+navigation+'\n'+nav_end+'\nrender();save();\n</script>')
file.write_text(html, encoding='utf-8')
print('Packed customer scheme lists into standalone HTML')
