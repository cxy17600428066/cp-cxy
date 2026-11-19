from pathlib import Path
root = Path(__file__).parent
file = root / '原型.html'
html = file.read_text(encoding='utf-8')
layout_start, layout_end = '/* PAGE_LAYOUT_START */', '/* PAGE_LAYOUT_END */'
layout = (root / 'page-layout.css').read_text(encoding='utf-8')
if layout_start in html:
 a, rest = html.split(layout_start, 1)
 _, b = rest.split(layout_end, 1)
 html = a + layout_start + '\n' + layout + '\n' + layout_end + b
else:
 html = html.replace('</style>', layout_start + '\n' + layout + '\n' + layout_end + '\n</style>', 1)
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
navigation = '\n'.join([(root/'dealer-catalog.js').read_text(encoding='utf-8'),(root/'customer-ledger.js').read_text(encoding='utf-8'),controller,(root/'dealer-integration.js').read_text(encoding='utf-8'),(root/'fund-flow.js').read_text(encoding='utf-8'),(root/'funding-contracts.js').read_text(encoding='utf-8'),(root/'contract-views.js').read_text(encoding='utf-8'),(root/'funding-engine.js').read_text(encoding='utf-8'),(root/'funding-ui.js').read_text(encoding='utf-8'),(root/'funding-events.js').read_text(encoding='utf-8'),(root/'funding-links.js').read_text(encoding='utf-8'),(root/'period-controls.js').read_text(encoding='utf-8'),(root/'order-package.js').read_text(encoding='utf-8'),(root/'sector-funds.js').read_text(encoding='utf-8'),boot])
html=html.replace('ensureSchemes();\n','ensureSchemes();\n ensurePrograms();\n') if ' ensurePrograms();' not in html else html
import re
html=re.sub(r'(programs:programListView,)+','programs:programListView,',html)
html=re.sub(r'(funding:fundingView,)+','',html)
html=html.replace('ledger:ledgerView,policies:policyView,','ledger:ledgerView,funding:fundingView,policies:policyView,')
nav_start, nav_end = '// PAGE_NAV_START', '// PAGE_NAV_END'
if nav_start in html:
 a, rest = html.split(nav_start, 1)
 _, b = rest.split(nav_end, 1)
 html = a + nav_start + '\n' + navigation + '\n' + nav_end + b
else:
 html = html.replace('render();save();\n</script>', nav_start+'\n'+navigation+'\n'+nav_end+'\nrender();save();\n</script>')
file.write_text(html, encoding='utf-8')
print('Packed customer scheme lists into standalone HTML')
