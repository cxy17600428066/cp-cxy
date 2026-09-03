const { chromium } = require('E:/cxy/node_modules/playwright');
const path = require('path');

async function main() {
  const pdfPath = 'E:/cxy/outputs/docx/supervision_workflow_leadership_with_charts.pdf';
  const outDir = 'E:/cxy/outputs/docx/pdf-with-charts-check';
  const executablePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1700 }, deviceScaleFactor: 1 });
  await page.goto(`file:///${pdfPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(outDir, 'page-initial.png'), fullPage: true });
  for (let i = 1; i <= 10; i++) {
    await page.keyboard.press('Home');
    for (let j = 1; j < i; j++) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(180);
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `page-${String(i).padStart(2, '0')}.png`), fullPage: false });
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
