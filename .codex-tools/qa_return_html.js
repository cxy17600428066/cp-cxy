const { chromium } = require('playwright');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL('E:/cxy/09-设计与原型/旺店通拆合单交互演示.html').href);
  await page.waitForSelector('text=售后影响');
  await page.getByRole('button', { name: /售后影响/ }).first().click();
  await page.waitForSelector('text=退货关联与售后影响');
  await page.getByRole('button', { name: '发货后退货' }).click();
  await page.waitForSelector('text=实际发货单明细');
  await page.screenshot({ path: 'E:/cxy/.codex-tools/qa-return-modal.png', fullPage: true });
  await page.getByRole('button', { name: '关闭' }).click();
  await page.getByRole('button', { name: /拆单/ }).filter({ hasText: '拆单' }).nth(1).click();
  await page.waitForSelector('#simulateAfterSaleChange');
  await page.locator('#simulateAfterSaleChange').check();
  await page.getByRole('button', { name: '确认拆单并生成子单' }).click();
  await page.waitForSelector('text=原订单售后数量已变化');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Interactive HTML QA OK');
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
