/* Simulate GitHub Pages serving the repository beneath /Qut/. */
const http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {createServer} = require('../serve.cjs');
(async () => {
  const app = createServer();
  const server = http.createServer((req,res) => {
    if (!req.url.startsWith('/Qut/')) { res.writeHead(404).end(); return; }
    req.url = req.url.slice('/Qut'.length);
    app.emit('request',req,res);
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
  try {
    const page = await browser.newPage(); const errors = [], missing = [];
    page.on('pageerror',error => errors.push(error.message));
    page.on('response',response => { if (response.url().startsWith(base) && response.status() >= 400) missing.push(response.url()); });
    await page.goto(base + '/Qut/'); await page.waitForURL('**/Qut/Qut/index.html');
    assert.equal(await page.locator('#document-mode').inputValue(),'full');
    await page.locator('#custName').fill('PAGES-CUSTOMER');
    await page.locator('.section-toggle').click(); await page.locator('#nav-bill').click();
    assert.equal(new URL(page.url()).pathname,'/Qut/Bill/index.html');
    await page.locator('.amt-input').first().fill('430000'); await page.locator('.badge-title').click();
    assert.equal(await page.locator('.amt-input').first().inputValue(),'430,000.00');
    assert.equal(await page.locator('#bill-amount-words').textContent(),'(สี่แสนสามหมื่นบาทถ้วน)');
    await page.locator('#format-label').click(); await page.locator('#document-mode').selectOption('simple'); await page.keyboard.press('Escape');
    assert.equal(await page.locator('.badge-title').textContent(),'รายการชำระเงินเบื้องต้น');
    await page.reload(); assert.equal(await page.locator('#document-mode').inputValue(),'simple');
    await page.locator('.section-toggle').click(); await page.locator('#nav-qut').click();
    assert.equal(await page.locator('#custName').inputValue(),'PAGES-CUSTOMER');
    assert.deepEqual(errors,[]); assert.deepEqual(missing,[]);
    console.log('GitHub Pages /Qut/: entry redirect, assets, both editors, document switch, money formatting, modes and drafts passed');
  } finally { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
