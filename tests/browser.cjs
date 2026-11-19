/* Optional verification tool; no browser dependency is shipped with the app. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('../serve.cjs');
const out = path.join(__dirname, '../artifacts');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {}) });
  const errors = [], checks = [];
  const context = await browser.newContext({ viewport: {width:1440,height:1100}, locale:'th-TH', timezoneId:'Asia/Bangkok' });
  const p = await context.newPage(); p.on('pageerror', e => errors.push(e.message));
  const check = (condition, label) => { assert.ok(condition, label); checks.push(label); };
  const value = selector => p.locator(selector).inputValue();
  const content = selector => p.locator(selector).textContent();
  async function switchSection(section) {
    await p.locator('.section-toggle').click();
    await p.locator('#nav-' + section).click();
    await p.waitForURL(section === 'qut' ? '**/Qut/index.html' : '**/Bill/index.html', { waitUntil: 'domcontentloaded' });
  }
  async function pdf(name) { await p.evaluate(() => document.fonts.ready); await p.pdf({path:path.join(out,name+'.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true}); }
  try {
    for (const [section, field, title, address] of [
      ['Qut', '.item-name', 'รายการเสนอราคา', '#companyNote'],
      ['Bill', '.row-description', 'รายการชำระตามงวด', '#companyContact']
    ]) {
      await p.goto(base + '/' + section + '/');
      if (section === 'Bill') {
        await p.locator('#company-menu-button').click();
        await p.locator('.company-preset').click();
      }
      check((await value(address)).includes('101/138'), section + ' uses the new preset address');
      await p.locator(field).last().fill('DRAG-TEST');
      await p.locator('.btn-move-row').last().scrollIntoViewIfNeeded();
      const handle = await p.locator('.btn-move-row').last().boundingBox();
      const top = await p.locator('.item-row').first().boundingBox();
      await p.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
      await p.mouse.down();
      await p.mouse.move(handle.x + handle.width / 2, top.y + top.height / 3, { steps: 12 });
      check(await p.locator('.is-dragging-row').count() === 1, section + ' picks up the row while pressed');
      await p.mouse.up();
      check(await value(field + ' >> nth=0') === 'DRAG-TEST', section + ' drops the row at the destination');
      await p.reload();
      check(await value(field + ' >> nth=0') === 'DRAG-TEST', section + ' restores the dragged order');
      await p.locator('.number-serial').fill('0254');
      const originalTitle = await p.title();
      await p.evaluate(() => {
        window.print = () => {
          window.printName = document.title;
          window.dispatchEvent(new Event('afterprint'));
        };
      });
      await p.locator(section === 'Qut' ? '#pdfBtn' : '.btn-pdf').click();
      if (section === 'Bill') await p.locator('#print-warning button').last().click();
      check(await p.evaluate(() => window.printName) === title + ' (0254)', section + ' suggests the requested PDF filename');
      check(await p.title() === originalTitle, section + ' restores its tab title after printing');
      const remove = p.locator('.btn-del').first();
      await remove.click();
      check(await p.locator('.item-row').count() === 3 && await remove.getAttribute('aria-pressed') === 'true',
        section + ' only arms deletion on first click');
      await remove.click();
      check(await p.locator('.item-row').count() === 2, section + ' deletes on the second click');
      await p.evaluate(() => sessionStorage.clear());
    }
    await p.goto(base + '/Bill/');
    const signatureSection = p.locator('.footer-bottom-right');
    const signatureDate = p.locator('#sigApproverDate');
    check(await signatureDate.evaluate(input => getComputedStyle(input).color === 'rgb(120, 135, 128)'),
      'empty signature date uses muted text');
    await signatureDate.fill('2026-11-19');
    check(await signatureDate.evaluate(input => !input.classList.contains('is-empty')),
      'filled signature date uses normal text');
    await p.emulateMedia({ media: 'print' });
    const preparePrint = () => p.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await preparePrint();
    check(!await p.locator('.sig-col').first().isVisible() && await p.locator('.sig-col').last().isVisible(),
      'printing a date-only signature hides the unused signer');
    check(!await p.locator('#approver-name').isVisible() && (await content('#sigApproverDisp')).trim(),
      'printing a date-only signature shows the date without an empty name');
    await p.emulateMedia({ media: 'screen' });
    await signatureDate.fill('');
    await p.locator('#biller-name').fill('SIGNER NAME ONLY');
    await p.emulateMedia({ media: 'print' });
    await preparePrint();
    check(await p.locator('#biller-name + .print-value').textContent() === 'SIGNER NAME ONLY'
      && !await p.locator('.sig-date-lbl').first().isVisible(), 'printing a name-only signature hides the empty date');
    await p.emulateMedia({ media: 'screen' });
    await p.locator('#biller-name').fill(' ');
    await p.emulateMedia({ media: 'print' });
    await preparePrint();
    check(!await signatureSection.isVisible(), 'printing with both signatures empty hides the signature section');
    await pdf('bill-no-signatures');
    await p.emulateMedia({ media: 'screen' });
    check(await signatureSection.isVisible(), 'signature fields stay available on screen');
    await p.evaluate(() => sessionStorage.clear());

    const plannerPage = await context.newPage();
    try {
      await plannerPage.goto(base + '/Bill/');
      const dialog = plannerPage.locator('#installment-planner');
      const apply = dialog.locator('button[type="submit"]');
      await plannerPage.locator('.row-description').first().fill('INSTALLMENT DESCRIPTION');
      await plannerPage.locator('#split-installments').click();
      await dialog.locator('#planner-total').fill('10,000.01');
      await dialog.locator('#planner-count').fill('2');
      check(await dialog.locator('.planner-installment').count() === 2, 'planner adds one percentage field per installment');
      await dialog.locator('#planner-rate-1').fill('50');
      await dialog.locator('#planner-rate-2').fill('49');
      await apply.click();
      check(await dialog.isVisible() && await plannerPage.locator('.item-row').count() === 3,
        'planner cannot replace the rows until percentages total 100%');
      await dialog.locator('#planner-rate-2').fill('50');
      check((await dialog.locator('output').allTextContents()).join('|').includes('5,000.01'),
        'planner previews the rounded installments');
      await apply.click();
      check(!await dialog.isVisible() && await plannerPage.locator('.item-row').count() === 2,
        'applying the planner fills the selected number of installments');
      check(await plannerPage.locator('.amt-input').first().inputValue() === '5,000.01' &&
        await plannerPage.locator('.amt-input').last().inputValue() === '5,000.00',
        'rounded installments sum to the exact original total');
      await plannerPage.reload();
      check((await plannerPage.locator('#grand-total-footer').textContent()).includes('10,000.01') &&
        await plannerPage.locator('.row-description').first().inputValue() === 'INSTALLMENT DESCRIPTION',
        'calculated amounts and existing descriptions survive reload');
      await plannerPage.locator('#split-installments').click();
      await dialog.locator('#planner-total').fill('500');
      plannerPage.once('dialog', prompt => prompt.dismiss());
      await apply.click();
      check(await dialog.isVisible() && await plannerPage.locator('.amt-input').first().inputValue() === '5,000.01',
        'canceling replacement keeps existing amounts');
    } finally {
      await plannerPage.close();
    }

    const touchContext = await browser.newContext({ viewport: { width: 390, height: 850 }, hasTouch: true, isMobile: true });
    try {
      const touchPage = await touchContext.newPage();
      await touchPage.goto(base + '/Bill/');
      await touchPage.locator('.row-description').nth(1).fill('TOUCH-DRAG');
      const handle = touchPage.locator('.btn-move-row').nth(1);
      await handle.scrollIntoViewIfNeeded();
      const start = await handle.boundingBox();
      const target = await touchPage.locator('.item-row').first().boundingBox();
      const cdp = await touchContext.newCDPSession(touchPage);
      const x = Math.round(start.x + start.width / 2);
      const startY = Math.round(start.y + start.height / 2);
      const endY = Math.round(target.y + target.height / 3);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY }] });
      for (let step = 1; step <= 8; step++) {
        const y = Math.round(startY + (endY - startY) * step / 8);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      check(await touchPage.locator('.row-description').first().inputValue() === 'TOUCH-DRAG', 'touch drag works on the narrow BILL layout');
    } finally {
      await touchContext.close();
    }
    await p.goto(base); await p.waitForURL('**/Qut/index.html');
    check(await p.locator('.section-nav,.draft-notice').count() === 0,'standalone nav and quotation draft notice are removed');
    check(await p.locator('.section-menu').isVisible() === false,'document menu is closed initially');
    check(await p.locator('.topbar .section-toggle').count() === 1,'document picker is inside original title position');
    await p.locator('.section-toggle').click(); check(await p.locator('#nav-bill').isVisible(),'click title opens document choices');
    await p.locator('#custName').click(); check(await p.locator('.section-switch').getAttribute('open') === null,'outside click closes document menu');
    await p.locator('.section-toggle').focus(); await p.keyboard.press('Enter');
    check(await p.locator('#nav-bill').isVisible(),'document choices are keyboard accessible');
    await p.keyboard.press('Escape'); check(await p.locator('.section-switch').getAttribute('open') === null,'Escape closes document choices');
    check((await value('#companyNote')).includes('ช่างเกล้า'), 'shared preset fills initial quotation');
    await p.locator('.qty-input').first().fill('10');
    await p.locator('.price-display').first().click(); await p.locator('.price-input').first().fill('500');
    await p.locator('#custName').fill('ลูกค้าทดสอบ QUT — QUOTE-CUSTOMER');
    await p.locator('.item-name').first().fill('งานติดตั้งตู้ / Installation');
    check(await value('.item-total >> nth=0') === '5,000.00', 'quotation line computes quantity × price');
    check(await p.locator('.item-total').first().getAttribute('readonly') !== null, 'row totals cannot be overridden');
    await p.locator('[data-i18n=summaryButton]').click();
    await p.locator('#vatMode').selectOption('exclusive');
    check((await content('#quoteTotalDisplay')).includes('5,350.00'), 'exclusive VAT updates total');
    await p.locator('#discountEnabled').check(); await p.locator('[data-i18n=summaryButton]').click();
    await p.locator('#discountMode').selectOption('percent'); await p.locator('#discountValue').fill('10');
    check((await content('#quoteTotalDisplay')).includes('4,815.00'), 'optional percentage discount precedes VAT');
    await p.locator('#companyNote').fill('บริษัทเฉพาะใบ QUT');
    await p.reload();
    check(await value('#custName') === 'ลูกค้าทดสอบ QUT — QUOTE-CUSTOMER', 'quotation survives refresh');
    check(await p.locator('#discountEnabled').isChecked(), 'discount flag survives refresh');
    check((await content('#quoteTotalDisplay')).includes('4,815.00'), 'reloaded quotation calculation is stable');
    await p.locator('[data-i18n=summaryButton]').click(); await p.locator('#discountEnabled').uncheck();
    check((await content('#quoteTotalDisplay')).includes('5,350.00'), 'disabled discount does not affect total');
    await p.locator('#vatMode').selectOption('inclusive'); await p.locator('[data-i18n=summaryButton]').click();
    await p.locator('.price-display').first().click(); await p.locator('.price-input').first().fill('1070');
    await p.locator('#custName').click();
    check((await content('#baseDisplay')) === '10,000.00', 'included VAT is extracted from price');
    check((await content('#vatDisplay')) === '700.00', 'included VAT is shown correctly');
    await p.evaluate(() => { window.printCalls=0; window.print=()=>window.printCalls++; });
    await p.locator('#pdfBtn').click(); check(await p.evaluate(()=>printCalls) === 1, 'QUT print button invokes browser printing');
    await p.locator('.qty-input').first().fill('-1'); await p.locator('#pdfBtn').click();
    check(await p.evaluate(()=>printCalls) === 1, 'invalid quotation numbers block printing');
    await p.locator('.qty-input').first().fill('10');
    await p.evaluate(()=>scrollTo(0,0)); await p.screenshot({path:path.join(out,'qut-desktop.png'),fullPage:true});
    await pdf('qut-th-short');
    await switchSection('bill');
    check(await p.locator('#contract-total,.mode-input,#allocation-warning,[data-i18n=newDocument],.local-notice').count() === 0,'BILL keeps the main editor free of extra calculation fields');
    check(await value('#companyName') === '', 'BILL keeps original blank company until preset is chosen');
    await p.locator('#company-menu-button').click(); await p.locator('.company-preset').click();
    check((await value('#companyName')).includes('ช่างเกล้า'),'BILL preset still fills from original company button');
    await p.locator('#project-name').fill('งานทดสอบ BILL — BILL-PROJECT');
    await p.locator('#client-name').fill('ลูกค้าใบวางบิล');
    await p.locator('.row-description').first().fill('งวดแรก เริ่มงาน');
    await p.locator('.pct-input').nth(0).fill('30');
    check(await value('.amt-input >> nth=0') === '', 'percentage is reference only and does not derive amount');
    await p.locator('.amt-input').nth(0).fill('10000.10');
    await p.locator('.amt-input').nth(1).fill('20000.20');
    await p.locator('.amt-input').nth(2).fill('30000.30');
    check((await content('#grand-total-footer')).includes('60,000.60'),'BILL sums manually entered amounts exactly');
    await p.locator('.pct-input').nth(0).fill('99');
    check(await value('.amt-input >> nth=0') === '10,000.10','editing percentage preserves manual amount');
    await p.evaluate(() => { window.printCalls=0; window.print=()=>window.printCalls++; });
    await p.locator('.btn-pdf').click();
    check(await p.locator('#print-warning').isVisible(),'BILL warns about missing document number');
    await p.locator('#print-warning button').last().click();
    check(await p.evaluate(()=>printCalls) === 1,'BILL print anyway invokes browser printing');
    await p.locator('.amt-input').first().fill('-1'); await p.locator('.btn-pdf').click();
    check(await p.evaluate(()=>printCalls) === 1,'invalid BILL amount still blocks printing');
    await p.locator('.amt-input').first().fill('10000.10');
    await p.locator('#biller-name').fill('ผู้วางบิลทดสอบ');
    await p.reload();
    check(await value('.amt-input >> nth=0') === '10,000.10', 'manual amount survives refresh');
    check(await value('.pct-input >> nth=0') === '99', 'independent percentage survives refresh');
    check(await value('#biller-name') === 'ผู้วางบิลทดสอบ','signature name survives refresh');
    await p.evaluate(()=>scrollTo(0,0)); await p.screenshot({path:path.join(out,'bill-desktop.png'),fullPage:true}); await pdf('bill-th-short');
    await switchSection('qut');
    check((await value('#custName')).includes('QUOTE-CUSTOMER'), 'section switching preserves independent QUT draft');
    check(await value('#companyNote') === 'บริษัทเฉพาะใบ QUT', 'document company override is scoped to its draft');
    await p.locator('#languageToggle').click();
    await p.evaluate(() => {
      document.getElementById('remarks').value='QUOTE-END-NOTES';
      for(let i=0;i<45;i++){addRow();const row=document.getElementById('row-'+rowCount);row.querySelector('.item-name').value='QUOTE-ITEM-'+i+' งานติดตั้งและตรวจสอบ';row.querySelector('.item-detail').value='รายละเอียดงานที่ต้องพิมพ์ให้ครบ / Long description for pagination. '.repeat(3);row.querySelector('.price-input').value='100';}
      calcTotal();saveData();
    });
    await pdf('qut-en-long');
    check(await p.locator('.print-value').count() === 0, 'printing cleans quotation mirrors');
    await p.locator('#languageToggle').click(); await pdf('qut-th-long');
    await switchSection('bill'); await p.locator('#languageToggle').click();
    await p.evaluate(() => {document.getElementById('additional-notes').value='BILL-END-NOTES';for(let i=0;i<45;i++)addRow('BILL-ITEM-'+i+' งานติดตั้ง / Detailed installation work. '.repeat(3),'','100',false);saveBillDraft();});
    await pdf('bill-en-long');
    await p.locator('#languageToggle').click(); await pdf('bill-th-long');
    await p.setViewportSize({width:375,height:812});
    await p.screenshot({path:path.join(out,'bill-mobile.png'),fullPage:true});
    check(await p.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), 'BILL fits narrow viewport');
    await switchSection('qut'); await p.screenshot({path:path.join(out,'qut-mobile.png'),fullPage:true});
    check(await p.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), 'QUT fits narrow viewport (table scrolls inside)');
    const fresh = await context.newPage(); await fresh.goto(base+'/Qut/');
    check(await fresh.locator('#custName').inputValue() === '', 'new tab begins without previous customer draft');
    check((await fresh.locator('#companyNote').inputValue()).includes('ช่างเกล้า'), 'new tab gets fixed company preset');
    await fresh.evaluate(()=>{document.querySelectorAll('.item-row').forEach(r=>r.remove());saveData();}); await fresh.reload();
    check(await fresh.locator('.item-row').count() === 0,'an intentionally empty quotation stays empty after refresh');
    await fresh.close();
    const qutReset = p.locator('[data-i18n=reset]'); p.once('dialog',d=>d.accept()); await qutReset.click(); await p.waitForLoadState('load');
    check(await p.locator('.item-row').count() === 3, 'quotation reset restores blank rows');
    await switchSection('bill'); check((await value('#project-name')).includes('BILL-PROJECT'), 'QUT reset leaves BILL draft intact');
    check(await value('.amt-input >> nth=0') === '10,000.10','manual BILL amount remains after section switches');
    const legacy = await context.newPage(); await legacy.goto(base+'/Bill/');
    await legacy.evaluate(()=>sessionStorage.setItem('qut-bill:v1:bill',JSON.stringify({language:'en',fields:{'project-name':'PREVIOUS-DRAFT','biller-name':'Saved signer'},rows:[{description:'Saved percent row',mode:'percent',percentage:'30',amount:'36000.00'}]})));
    await legacy.reload();
    check(await legacy.locator('.amt-input').inputValue() === '36,000.00','previous combined BILL draft restores displayed amount without recalculation');
    check(await legacy.locator('.pct-input').inputValue() === '30','previous combined BILL draft retains reference percentage');
    check(await legacy.locator('#project-name').inputValue() === 'PREVIOUS-DRAFT','previous BILL fields survive restoration');
    await legacy.locator('#languageToggle').click(); await legacy.reload();
    check(await legacy.locator('html').getAttribute('lang') === 'th','BILL language change is saved');
    await legacy.locator('.btn-del').click();
    check(await legacy.locator('.btn-del.is-armed').count() === 1, 'first delete click arms the row');
    await legacy.locator('.btn-del').click(); await legacy.reload();
    check(await legacy.locator('.item-row').count() === 0,'empty BILL stays empty after refresh');
    await legacy.close();
    const restricted = await browser.newContext();
    await restricted.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Storage blocked','SecurityError')};});
    const blocked = await restricted.newPage(); await blocked.goto(base+'/Qut/'); await blocked.locator('#custName').fill('not stored');
    check(await blocked.locator('#session-warning').isVisible(),'storage failure is visible rather than claiming the draft is saved');
    await restricted.close();
    check(errors.length === 0,'no JavaScript page errors');
    fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({checks,errors},null,2));
    console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));
  } catch(e) {
    await p.screenshot({path:path.join(out,'failure.png'),fullPage:true});
    console.error(JSON.stringify({completed:checks,errors},null,2)); throw e;
  } finally { await browser.close(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1;});
