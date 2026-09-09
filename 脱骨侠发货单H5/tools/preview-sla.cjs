const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = new Set(['发货时效预警策略.html', '商品发货时效配置.html', '客户到货时效配置.html', '履约节点配置.html']);
http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).slice(1) || '发货时效预警策略.html'; }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  if (!files.has(name)) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(path.join(root, name), (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'});
    res.end(req.method === 'HEAD' ? undefined : content);
  });
}).listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173/'));
