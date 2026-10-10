const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const file = path.resolve(__dirname, '发货时效预警策略.html').replace(/\\/g, '/');
  await page.goto('file:///' + file + '#orders');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.oms-order');
  const card = await page.locator('.oms-order').first().innerText();
  if (/订单状态：已发货/.test(card)) throw new Error('未发货订单仍显示“订单状态：已发货”');
  const compactCard = card.replace(/\s+/g, '');
  if (!/订单状态：(待审核|待接单|待发货)/.test(compactCard)) throw new Error('未发货订单缺少真实状态');
  await page.locator('.oms-order .orders-toggle').first().click();
  await page.waitForSelector('#orderDetail .od-document');
  const detail = await page.locator('#orderDetail').innerText();
  const compactDetail = detail.replace(/\s+/g, '');
  if (/订单状态：已发货/.test(compactDetail)) throw new Error('详情仍显示失真的已发货状态');
  if (!compactDetail.includes('实际发货完成：待完成')) throw new Error('详情未明确显示实际发货尚未完成');
  if (errors.length) throw new Error('页面脚本错误：' + errors.join(' | '));
  console.log(JSON.stringify({ cardStatus: compactCard.match(/订单状态：(待审核|待接单|待发货)/)?.[0], actualTime: '实际发货完成：待完成', pageErrors: errors.length }, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
