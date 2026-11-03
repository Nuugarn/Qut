const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createServer} = require('../serve.cjs');
(async () => {
  const server = createServer(); await new Promise(r => server.listen(0,'127.0.0.1',r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
  const page = await browser.newPage({viewport:{width:1280,height:1000}});
  const errors = [], checks = []; page.on('pageerror',e=>errors.push(e.message));
  const out = path.resolve(__dirname,'../artifacts/modes'); fs.mkdirSync(out,{recursive:true});
  async function setMode(mode) { await page.locator('#format-label').click(); await page.locator('#document-mode').selectOption(mode); await page.keyboard.press('Escape'); }
  const check = (value,label) => { assert.ok(value,label); checks.push(label); };
  try {
    for (const app of ['Qut','Bill']) {
      const bill = app === 'Bill';
      await page.goto(`${base}/${app}/index.html`);
      check(await page.locator('#document-mode').inputValue() === 'full',`${app}: default full`);
      const person = bill ? '#client-name' : '#custName';
      await page.locator(person).fill('HIDDEN-CUSTOMER ทดสอบ');
      await page.locator(bill ? '#project-name' : '#quoteProject').fill('HIDDEN-PROJECT โครงการ');
      await page.locator(bill ? '#payment-terms' : '#quoteTerms').fill('HIDDEN-TERMS ชำระภายใน 30 วัน');
      await page.locator(bill ? '#payment-method' : '#quoteBank').fill('HIDDEN-BANK ธนาคาร');
      if (bill) {
        await page.locator('#client-contact').fill('HIDDEN-CONTACT ที่อยู่ลูกค้า');
        await page.locator('#payment-due-date').fill('2026-11-30');
        await page.locator('.row-description').first().fill('งานติดตั้งตามโครงการ');
        await page.locator('.pct-input').first().fill('50');
        await page.locator('.amt-input').first().fill('215000');
      } else {
        await page.locator('.item-name').first().fill('งานติดตั้งตามโครงการ');
        await page.locator('.qty-input').first().fill('2');
        await page.locator('.price-display').first().click();
        await page.locator('.price-input').first().fill('5000');
        await page.locator(person).click();
      }
      const total = bill ? '#grand-total-footer' : '#quoteTotalDisplay';
      const originalTotal = await page.locator(total).textContent();
      await setMode('simple');
      check(!await page.locator(person).isVisible(),`${app}: simple hides identity`);
      check(!await page.locator(bill ? '#project-name' : '#quoteProject').isVisible(),`${app}: simple hides project`);
      check(await page.locator(total).textContent() === originalTotal,`${app}: mode preserves total`);
      if (!bill) {
        await page.locator('[data-i18n=summaryButton]').click();
        await page.locator('#discountEnabled').check();
        await page.locator('#vatMode').selectOption('exclusive');
        await page.locator('[data-i18n=summaryButton]').click();
        await page.locator('#discountValue').fill('1000');
        await page.locator('#extraCost').fill('500');
        check((await page.locator(total).textContent()).includes('10,165.00'),'QUT simple discount + extra + VAT');
      }
      await page.reload();
      check(await page.locator('#document-mode').inputValue() === 'simple',`${app}: mode survives refresh`);
      check(await page.locator(person).inputValue() === 'HIDDEN-CUSTOMER ทดสอบ',`${app}: hidden data retained`);
      for (const mode of ['simple','custom','full']) {
        await setMode(mode);
        if (mode === 'custom') {
          await page.locator('#format-label').click();
          for (const input of await page.locator('.mode-options input').all()) await input.uncheck();
          check(!await page.locator(person).isVisible(),`${app}: custom hides identity`);
          await page.keyboard.press('Escape');
          await page.reload();
          check(await page.locator('#document-mode').inputValue() === 'custom',`${app}: custom mode restored`);
          await page.locator('#format-label').click();
          for (const input of await page.locator('.mode-options input').all()) {
            check(!await input.isChecked(),`${app}: custom option restored ${await input.getAttribute('data-group')}`);
            await input.check();
          }
          check(await page.locator(person).isVisible(),`${app}: custom reopens identity`);
          await page.keyboard.press('Escape');
        }
        for (const language of ['th','en']) {
          if (await page.locator('html').getAttribute('lang') !== language) await page.locator('#languageToggle').click();
          await page.evaluate(()=>document.fonts.ready);
          const title = await page.locator('.badge-title').innerText();
          check(title.includes(language === 'en' ? (mode === 'simple' ? 'Preliminary' : bill ? 'BILLING' : 'QUOTATION') : mode === 'simple' ? 'เบื้องต้น' : bill ? 'ใบวางบิล' : 'ใบเสนอราคา'),`${app}: ${mode} ${language} title`);
          await page.pdf({path:path.join(out,`${app}-${mode}-${language}.pdf`),format:'A4',printBackground:true});
          if (language === 'th' && mode !== 'custom') await page.screenshot({path:path.join(out,`${app}-${mode}.png`),fullPage:true});
        }
      }
      await setMode('simple');
      await page.setViewportSize({width:375,height:812});
      check(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`${app}: mobile width`);
      await page.setViewportSize({width:1280,height:1000});
      await page.goto(`${base}/${bill ? 'Qut' : 'Bill'}/index.html`);
      await page.goto(`${base}/${app}/index.html`);
      check(await page.locator('#document-mode').inputValue() === 'simple',`${app}: mode survives section switch`);
      await setMode('full');
      check(await page.locator(person).inputValue() === 'HIDDEN-CUSTOMER ทดสอบ',`${app}: full restores original data`);
      if (bill) {
        check(await page.locator('.row-total').count() === 0,'BILL has one editable money column');
        check(await page.locator('.amt-input').first().inputValue() === '215,000.00','BILL formats amount with separators');
        if (await page.locator('html').getAttribute('lang') !== 'th') await page.locator('#languageToggle').click();
        check((await page.locator('#bill-amount-words').textContent()).includes('สองแสนหนึ่งหมื่นห้าพันบาทถ้วน'),'BILL displays amount in Thai words');
        await page.locator('#format-label').click(); await page.locator('#show-amount-words').uncheck(); await page.keyboard.press('Escape');
        check(!await page.locator('#bill-amount-words').isVisible(),'BILL words can be hidden');
        await page.reload();
        check(!await page.locator('#bill-amount-words').isVisible(),'BILL word preference persists');
        await page.locator('#format-label').click(); await page.locator('#show-amount-words').check(); await page.keyboard.press('Escape');
        check(await page.locator('#client-contact').inputValue() === 'HIDDEN-CONTACT ที่อยู่ลูกค้า','BILL contact persisted');
        check(await page.locator('#payment-due-date').inputValue() === '2026-11-30','BILL due date persisted');
        await page.evaluate(()=>{window.printCalls=0;window.print=()=>window.printCalls++;});
        await page.locator('.btn-pdf').click();
        check(await page.locator('#print-warning').isVisible(),'BILL full warns incomplete fields');
        await page.locator('#print-warning button').first().click();
        check(await page.evaluate(()=>printCalls) === 0,'BILL back to edit does not print');
        await page.locator('.btn-pdf').click(); await page.locator('#print-warning button').last().click();
        check(await page.evaluate(()=>printCalls) === 1,'BILL print anyway works');
        await setMode('simple');
        await page.locator('.btn-pdf').click();
        check(await page.locator('#print-warning').isVisible(),'BILL simple warns when visible biller is missing');
        await page.locator('#print-warning button').last().click();
        check(await page.evaluate(()=>printCalls) === 2,'BILL simple can print after warning');
        await page.locator('.amt-input').first().fill(''); await page.locator('.btn-pdf').click();
        check(await page.locator('#print-warning').isVisible(),'BILL warns missing amount for described row');
        await page.keyboard.press('Escape');
        await page.locator('.amt-input').first().fill('-1'); await page.locator('.btn-pdf').click();
        check(await page.evaluate(()=>printCalls) === 2,'BILL malformed amount cannot bypass validation');
      }
    }
    check(errors.length === 0,'no page errors');
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:checks.length,checks,errors},null,2));
    console.log(JSON.stringify({passed:checks.length,errors}));
  } finally { await browser.close(); server.closeAllConnections(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1;});
