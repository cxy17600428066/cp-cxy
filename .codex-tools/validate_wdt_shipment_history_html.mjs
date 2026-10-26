import fs from 'node:fs';

const path = 'E:/cxy/09-设计与原型/旺店通拆合单数据拉取交互演示.html';
const html = fs.readFileSync(path, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
if (scripts.length !== 1) throw new Error(`expected 1 script, got ${scripts.length}`);
new Function(scripts[0]);

const required = [
  '发货管理',
  '一条OMS发货单只在列表中展示一次',
  '查看拆合单记录',
  'OMS列表始终保留发货单',
  '以下内容是旺店通处理历史，不会生成新的OMS发货单',
  'OMS主记录</td><td>每张原始发货单在发货管理列表中只保留一条',
  '发货单仍为1条，拆合记录已刷新',
];
const missing = required.filter(x => !html.includes(x));
if (missing.length) throw new Error(`missing: ${missing.join(' | ')}`);

const forbidden = [
  '旺店通拆合单同步</div>',
  '全部记录</button><button class="tab" data-tab="split"',
  '按旺店通拆单结果建立两个结果发货单映射',
  '进入拆单或合单关系记录',
];
const found = forbidden.filter(x => html.includes(x));
if (found.length) throw new Error(`forbidden: ${found.join(' | ')}`);

const cardCount = (html.match(/<article class="shipment-card">/g) || []).length;
if (cardCount !== 1) throw new Error(`shipment card count: ${cardCount}`);
console.log('HTML_SHIPMENT_HISTORY_VALIDATION_OK');
console.log(`bytes=${Buffer.byteLength(html, 'utf8')} shipmentCards=${cardCount}`);
