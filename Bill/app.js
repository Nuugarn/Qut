let rowId = 0;
  let currentLang = 'th';

  const translations = {
    th: {
      pageTitle: 'ใบวางบิล',
      appTitle: '🧾 ใบ<span>วางบิล</span>',
      languageSelector: 'เลือกภาษา',
      savePdf: 'พิมพ์ / บันทึก PDF',
      switchLanguageText: 'EN', switchLanguageAria: 'Switch to English',
      companyButton: 'ข้อมูล',
      companySettingsTitle: 'เลือกข้อมูลผู้วางบิล',
      companyMenuTitle: 'ข้อมูลผู้วางบิล',
      companyPreset: 'ช่างเกล้า Built-in<br>101/138 ซ.55 ถนนเลียบวารี แขวงโคกแฝก เขตหนองจอก กรุงเทพฯ 10530<br>โทร.091-876-8157',
      companyNamePlaceholder: 'ชื่อบริษัท / ผู้รับเหมา',
      companyContactPlaceholder: 'ที่อยู่ / เบอร์โทร / อีเมล',
      documentTitle: 'ใบวางบิล',
      documentNumber: 'เลขที่เอกสาร',
      projectInfo: 'ข้อมูลโครงการ',
      projectName: 'ชื่อโครงการ / งาน',
      projectNamePlaceholder: 'กรอกชื่อโครงการหรืองาน',
      client: 'ผู้ว่าจ้าง / เจ้าของโครงการ',
      clientPlaceholder: 'ชื่อผู้ว่าจ้าง / บริษัท',
      billingItems: 'รายการวางบิลตามงวด',
      scrollHint: '← เลื่อนซ้าย-ขวาเพื่อดูตาราง →',
      installment: 'งวดที่',
      description: 'รายละเอียดงวด',
      percentage: 'เปอร์เซ็นต์',
      amount: 'จำนวนเงิน',
      totalThb: 'ราคารวม (฿)',
      addInstallment: 'เพิ่มงวด',
      grandTotal: 'ยอดรวมทั้งสิ้น',
      notes: 'หมายเหตุ',
      paymentMethod: 'ชำระโดยวิธี / บัญชีธนาคาร',
      paymentMethodPlaceholder: 'เช่น โอนเงิน กสิกรไทย 123-4-56789-0',
      paymentTerms: 'เงื่อนไขการชำระเงิน',
      paymentTermsPlaceholder: 'เช่น ชำระภายใน 30 วัน',
      additionalNotes: 'หมายเหตุเพิ่มเติม',
      additionalNotesPlaceholder: 'รายละเอียดเพิ่มเติม / ข้อสังเกต',
      signatures: 'ลายเซ็นผู้เกี่ยวข้อง',
      biller: 'ผู้วางบิล',
      approver: 'ผู้อนุมัติ',
      fullName: 'ชื่อ - นามสกุล',
      date: 'วันที่',
      printHint: 'กด <strong>บันทึก PDF</strong> ด้านบน เพื่อบันทึกหรือพิมพ์เอกสาร',
      rowPlaceholder: id => `รายละเอียดงวดที่ ${id}`,
      deleteRow: 'ลบงวดนี้'
    },
    en: {
      pageTitle: 'Billing Statement',
      appTitle: '🧾 Billing <span>Statement</span>',
      languageSelector: 'Select language',
      savePdf: 'Print / Save PDF',
      switchLanguageText: 'ไทย', switchLanguageAria: 'เปลี่ยนเป็นภาษาไทย',
      companyButton: 'Company',
      companySettingsTitle: 'Select biller information',
      companyMenuTitle: 'Biller Information',
      companyPreset: 'Chang Klao Built-in<br>101/138 Soi 55, Liap Wari Road, Khok Faet, Nong Chok, Bangkok 10530<br>Tel. 091-876-8157',
      companyNamePlaceholder: 'Company / Contractor name',
      companyContactPlaceholder: 'Address / Phone / Email',
      documentTitle: 'BILLING STATEMENT',
      documentNumber: 'Document No.',
      projectInfo: 'Project Information',
      projectName: 'Project / Job Name',
      projectNamePlaceholder: 'Enter the project or job name',
      client: 'Client / Project Owner',
      clientPlaceholder: 'Client or company name',
      billingItems: 'Progress Billing Items',
      scrollHint: '← Swipe horizontally to view the table →',
      installment: 'No.',
      description: 'Description',
      percentage: 'Percentage',
      amount: 'Amount',
      totalThb: 'Total (THB)',
      addInstallment: 'Add Installment',
      grandTotal: 'Grand Total',
      notes: 'Notes',
      paymentMethod: 'Payment Method / Bank Account',
      paymentMethodPlaceholder: 'e.g. Bank transfer, account 123-4-56789-0',
      paymentTerms: 'Payment Terms',
      paymentTermsPlaceholder: 'e.g. Payment due within 30 days',
      additionalNotes: 'Additional Notes',
      additionalNotesPlaceholder: 'Additional details or remarks',
      signatures: 'Authorised Signatures',
      biller: 'Prepared By',
      approver: 'Approved By',
      fullName: 'Full name',
      date: 'Date',
      printHint: 'Select <strong>Save PDF</strong> above to save or print this document.',
      rowPlaceholder: id => `Installment ${id} description`,
      deleteRow: 'Delete this installment'
    }
  };

  const MAX_AMOUNT_CENTS = 999999999999;
  Object.assign(translations.th, {
    referenceNumber: 'เลขอ้างอิงใบเสนอราคา / สัญญา', clientTax: 'เลขประจำตัวผู้เสียภาษีลูกค้า / สาขา', includeRow: 'เรียกเก็บ', noItems: 'กรุณาเลือกและกรอกอย่างน้อยหนึ่งรายการ', clientContact: 'ที่อยู่ / ข้อมูลติดต่อลูกค้า', paymentDueDate: 'วันครบกำหนดชำระ',
    incompleteTitle: 'ตรวจสอบข้อมูลก่อนพิมพ์',
    incompleteIntro: 'ข้อมูลต่อไปนี้ยังไม่ครบ คุณสามารถกลับไปแก้ไขหรือพิมพ์ต่อได้',
    backToEdit: 'กลับไปแก้', printAnyway: 'พิมพ์ต่อ', missingAmounts: 'จำนวนเงินของรายการที่กรอก',
    workspaceTitle: 'สร้างใบวางบิล', workspaceSubtitle: 'จัดทำเอกสารเรียกเก็บเงินตามงวด พร้อมพิมพ์เป็น PDF',
    localNotice: 'ข้อมูลอยู่ในหน้านี้เท่านั้น ปิดหรือรีเฟรชหน้าแล้วข้อมูลจะหาย',
    summaryCount: 'จำนวนงวด', summaryTotal: 'ยอดเรียกเก็บรวม', summaryPercent: 'เปอร์เซ็นต์รวม',
    amountHint: 'เปอร์เซ็นต์ใช้เป็นข้อมูลอ้างอิง ยอดรวมคำนวณจากจำนวนเงินที่กรอกเท่านั้น',
    issueDate: 'วันที่ออกเอกสาร', detailsHeading: 'ข้อมูลเอกสาร',
    billerInfo: 'ข้อมูลผู้วางบิล', documentInfo: 'ข้อมูลเอกสาร', paymentInfo: 'การชำระเงินและหมายเหตุ',
    amountError: 'กรอกจำนวนเงินตั้งแต่ 0 ถึง 9,999,999,999.99 โดยใช้ทศนิยมไม่เกิน 2 ตำแหน่ง',
    totalError: 'ยอดรวมต้องไม่เกิน 9,999,999,999.99 บาท', validationError: 'โปรดแก้ไขจำนวนเงินที่ไม่ถูกต้องก่อนพิมพ์',
    invalidTotal: 'ตรวจสอบจำนวนเงิน', actions: 'จัดการ', rowLabel: (label, n) => `${label} งวดที่ ${n}`,
    deleteRowLabel: n => `ลบงวดที่ ${n}`,
    splitInstallments: 'แบ่งงวด', plannerTotal: 'ยอดรวม (บาท)', plannerCount: 'จำนวนงวด',
    plannerCancel: 'ยกเลิก', plannerApply: 'ใช้กับตาราง',
    plannerRate: n => `งวดที่ ${n} (%)`,
    plannerRateTotal: n => `รวม ${n}% จาก 100%`,
    plannerInvalidTotal: 'กรอกยอดรวมมากกว่า 0 บาท ทศนิยมไม่เกิน 2 ตำแหน่ง',
    plannerInvalidCount: 'กรอกจำนวนงวดตั้งแต่ 1 ถึง 100',
    plannerInvalidRate: 'กรอกเปอร์เซ็นต์แต่ละงวดมากกว่า 0 และไม่เกิน 100 ทศนิยมไม่เกิน 2 ตำแหน่ง',
    plannerConfirm: 'นำเปอร์เซ็นต์และยอดเงินใหม่ไปใส่ในตาราง และลบงวดที่เกินจากจำนวนที่เลือกหรือไม่?'
  });
  Object.assign(translations.en, {
    referenceNumber: 'Quotation / contract reference', clientTax: 'Customer tax ID / branch', includeRow: 'Bill', noItems: 'Select and enter at least one item', clientContact: 'Customer address / Contact', paymentDueDate: 'Payment due date',
    incompleteTitle: 'Review before printing',
    incompleteIntro: 'The following information is missing. You can edit it or continue printing.',
    backToEdit: 'Back to edit', printAnyway: 'Print anyway', missingAmounts: 'Amounts for entered items',
    workspaceTitle: 'Create a billing statement', workspaceSubtitle: 'Prepare progress billing and print a PDF',
    localNotice: 'Information stays on this page only. Closing or refreshing clears it.',
    summaryCount: 'Installments', summaryTotal: 'Total billing', summaryPercent: 'Total percentage',
    amountHint: 'Percentages are for reference. Totals use only the amounts entered.', issueDate: 'Issue date',
    detailsHeading: 'Document details', billerInfo: 'Biller information', documentInfo: 'Document details', paymentInfo: 'Payment and notes',
    amountError: 'Enter an amount from 0 to 9,999,999,999.99 with no more than 2 decimal places.',
    totalError: 'The total must not exceed THB 9,999,999,999.99.', validationError: 'Correct the invalid amounts before printing.',
    invalidTotal: 'Check amounts', actions: 'Actions', rowLabel: (label, n) => `${label}, installment ${n}`,
    deleteRowLabel: n => `Delete installment ${n}`,
    splitInstallments: 'Split payments', plannerTotal: 'Total (THB)', plannerCount: 'Installments',
    plannerCancel: 'Cancel', plannerApply: 'Apply to table',
    plannerRate: n => `Installment ${n} (%)`,
    plannerRateTotal: n => `Total ${n}% of 100%`,
    plannerInvalidTotal: 'Enter a total greater than zero with up to 2 decimal places.',
    plannerInvalidCount: 'Enter between 1 and 100 installments.',
    plannerInvalidRate: 'Enter a percentage above 0 and at most 100 for each installment, with up to 2 decimal places.',
    plannerConfirm: 'Apply the new percentages and amounts, and remove any rows beyond the selected count?'
  });

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && el.textContent !== String(value)) el.textContent = value;
  }

  function formatDate(val) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return '';
    const [y, m, d] = val.split('-').map(Number);
    const date = new Date(0);
    date.setUTCFullYear(y, m - 1, d);
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return '';
    return new Intl.DateTimeFormat(currentLang === 'th' ? 'th-TH' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
    }).format(date);
  }

  function updateSigDate(inputId, dispId) {
    const input = document.getElementById(inputId);
    const value = input?.value || '';
    setText(dispId, formatDate(value));
    if (input?.classList.contains('sig-date-pk')) input.classList.toggle('is-empty', !value);
  }

  function fmt(n) {
    const value = n.toLocaleString(currentLang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currentLang === 'th' ? `${value} ฿` : `THB ${value}`;
  }

  // Convert decimal text to integer satang before any arithmetic.
  function parseAmountCents(value) {
    const text = String(value).trim();
    if (!text) return 0;
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
    const [whole, fraction = ''] = text.split('.');
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return Number.isSafeInteger(cents) && cents <= MAX_AMOUNT_CENTS ? cents : null;
  }

  function setCompanyWidget(open, restoreFocus = false) {
    document.getElementById('companyWidget')?.classList.toggle('show', open);
    document.getElementById('company-menu-button')?.setAttribute('aria-expanded', String(open));
    if (restoreFocus) document.getElementById('company-menu-button')?.focus();
  }

  function toggleCompanyWidget(event) {
    event?.stopPropagation();
    const open = !document.getElementById('companyWidget')?.classList.contains('show');
    setCompanyWidget(open);
    if (open) document.querySelector('.company-preset')?.focus();
  }

  function resizeTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function resizeCompanyContact() { resizeTextarea(document.getElementById('companyContact')); }

  function applyCompanyPreset() {
    const name = document.getElementById('companyName');
    const contact = document.getElementById('companyContact');
    if (!name || !contact) return;
    const preset = Workspace.company[currentLang];
    name.value = preset.name;
    contact.value = preset.contact;
    resizeCompanyContact();
    setCompanyWidget(false, true);
  }

  function updateControlLabels() {
    const t = translations[currentLang];
    document.querySelectorAll('.field').forEach((field, index) => {
      const label = field.querySelector('label');
      const control = field.querySelector('input, textarea, select');
      if (label && control) {
        if (!control.id) control.id = `field-${index}`;
        label.htmlFor = control.id;
      }
    });
    const names = { companyName: t.companyNamePlaceholder, companyContact: t.companyContactPlaceholder,
      'document-number': t.documentNumber, 'issue-date': t.issueDate,
      sigBillerDate: `${t.date} — ${t.biller}`, sigApproverDate: `${t.date} — ${t.approver}` };
    Object.entries(names).forEach(([id, label]) => document.getElementById(id)?.setAttribute('aria-label', label));
    document.querySelectorAll('.sig-col').forEach((col, i) => {
      col.querySelector('.sig-name-n')?.setAttribute('aria-label', `${t.fullName} — ${i === 0 ? t.biller : t.approver}`);
    });
  }

  function updateRowLabels() {
    const t = translations[currentLang];
    document.querySelectorAll('.item-row').forEach(row => {
      const n = row.dataset.rowId;
      row.querySelector('.row-num').textContent = n;
      const description = row.querySelector('.row-description');
      description.placeholder = t.rowPlaceholder(n);
      description.setAttribute('aria-label', t.rowLabel(t.description, n));
      row.querySelector('.pct-input').setAttribute('aria-label', t.rowLabel(t.percentage, n));
      row.querySelector('.amt-input').setAttribute('aria-label', t.rowLabel(t.amount, n));
      RowOrder.label(row, currentLang, n);
      const button = row.querySelector('.btn-del');
      button.title = t.deleteRowLabel(n);
      button.setAttribute('aria-label', t.deleteRowLabel(n));
      const keys = ['installment', 'description', 'percentage', 'amount', 'actions'];
      row.querySelectorAll('td').forEach((cell, i) => cell.dataset.label = t[keys[i]]);
    });
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    const t = translations[lang];
    document.documentElement.lang = lang;
    document.title = t.pageTitle;
    const bindings = [
      ['[data-i18n]', 'i18n', (el, value) => el.textContent = value],
      ['[data-i18n-html]', 'i18nHtml', (el, value) => el.innerHTML = value],
      ['[data-i18n-placeholder]', 'i18nPlaceholder', (el, value) => el.placeholder = value],
      ['[data-i18n-aria-label]', 'i18nAriaLabel', (el, value) => el.setAttribute('aria-label', value)],
      ['[data-i18n-title]', 'i18nTitle', (el, value) => el.title = value]
    ];
    bindings.forEach(([selector, key, apply]) => document.querySelectorAll(selector).forEach(el => {
      const value = t[el.dataset[key]];
      if (typeof value === 'string') apply(el, value);
    }));
    document.querySelectorAll('.lang-btn').forEach(button => {
      const active = button.dataset.lang === lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateControlLabels(); updateRowLabels();
    updateSigDate('sigBillerDate', 'sigBillerDisp'); updateSigDate('sigApproverDate', 'sigApproverDisp');
    updateSigDate('issue-date', 'issue-date-display'); calcAll();
    document.querySelectorAll('textarea').forEach(resizeTextarea);
  }

  document.addEventListener('click', event => { if (!event.target.closest('.header-menu')) setCompanyWidget(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('companyWidget')?.classList.contains('show')) setCompanyWidget(false, true);
  });
  window.addEventListener('resize', () => document.querySelectorAll('textarea').forEach(resizeTextarea));

  function addRow(desc = '', pct = '', amt = '', focusRow = true, installment = rowId + 1) {
    const id = installment;
    rowId = Math.max(rowId, id);
    const row = document.createElement('tr');
    row.className = 'item-row'; row.id = `row-${id}`; row.dataset.rowId = id;
    // Static skeleton; all user-provided content is assigned through .value below.
    row.innerHTML = `
      <td class="row-num"></td>
      <td class="description-cell"><textarea class="ii row-description" rows="1"></textarea></td>
      <td><input class="ii right pct-input" type="text" inputmode="decimal" placeholder="—"></td>
      <td><input class="ii right amt-input" type="text" inputmode="decimal" placeholder="0.00" aria-describedby="amount-hint validation-message"></td>
      <td class="no-print"><div class="row-actions"><button type="button" class="btn-move-row no-print" aria-label="ย้ายรายการ" title="ย้ายรายการ">↕</button><button class="btn-del" type="button"><svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M5 6l1 14h12l1-14M9 6V3h6v3M10 10v6M14 10v6"/></svg></button></div></td>`;
    const description = row.querySelector('.row-description');
    description.value = desc;
    row.querySelector('.pct-input').value = pct;
    row.querySelector('.amt-input').value = amt;
    description.addEventListener('input', () => resizeTextarea(description));
    row.querySelector('.pct-input').addEventListener('input', calcAll);
    row.querySelector('.amt-input').addEventListener('input', calcAll);
    row.querySelector('.amt-input').addEventListener('focus', event => { event.target.value = amountValue(event.target.value); event.target.select(); });
    row.querySelector('.amt-input').addEventListener('blur', () => { calcAll(); window.saveBillDraft?.(); });
    row.querySelector('.btn-del').addEventListener('click', event => {
      RowOrder.confirmDelete(event.currentTarget, () => delRow(id));
    });
    document.getElementById('tbl-body').appendChild(row);
    updateRowLabels(); calcAll(); resizeTextarea(description);
    if (focusRow) description.focus();
  }

  function amountValue(value) {
    const text = String(value).trim();
    return /^\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?$/.test(text) ? text.replaceAll(',', '') : text;
  }

  function updateRowTotal(id) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return null;
    const input = row.querySelector('.amt-input');
    const cents = parseAmountCents(amountValue(input.value));
    const invalid = cents === null;
    input.setCustomValidity(invalid ? translations[currentLang].amountError : '');
    input.setAttribute('aria-invalid', String(invalid));
    row.classList.toggle('has-error', invalid);
    if (!invalid && input.value.trim() && document.activeElement !== input) {
      input.value = (cents / 100).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
    }
    return cents;
  }

  RowOrder.attach(document.getElementById('tbl-body'), () => currentLang, () => window.saveBillDraft?.());

  function delRow(id) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;
    const nextFocus = row.nextElementSibling?.querySelector('.row-description') || row.previousElementSibling?.querySelector('.row-description') || document.querySelector('.btn-add-row');
    row.remove(); updateRowLabels(); calcAll(); nextFocus?.focus();
  }

  function calcAll() {
    let total = 0, invalid = false, percentage = 0, percentageValid = true;
    const rows = document.querySelectorAll('.item-row');
    rows.forEach(row => {
      const cents = updateRowTotal(row.dataset.rowId);
      if (cents === null) invalid = true;
      else total += cents;
      const rawPercentage = row.querySelector('.pct-input').value.trim();
      const pct = rawPercentage.replace(/%$/, '').trim();
      if (rawPercentage) {
        if (/^\d+(?:\.\d+)?$/.test(pct) && Number.isFinite(Number(pct))) percentage += Number(pct);
        else percentageValid = false;
      }
    });
    const overflow = !Number.isSafeInteger(total) || total > MAX_AMOUNT_CENTS;
    const t = translations[currentLang];
    const totalText = invalid || overflow ? t.invalidTotal : fmt(total / 100);
    setText('grand-total-footer', totalText); setText('summary-total', totalText); setText('summary-count', rows.length);
    setText('bill-amount-words', invalid || overflow ? '' : '(' + AmountWords.text(total, currentLang) + ')');
    setText('summary-percent', percentageValid && Number.isFinite(percentage) ? `${Number(percentage.toFixed(2))}%` : '—');
    setText('validation-message', invalid ? t.validationError + ' ' + t.amountError : overflow ? t.totalError : '');
    return !invalid && !overflow;
  }

  function printDocument(skipWarning = false) {
    if (!calcAll()) {
      const input = document.querySelector('.amt-input[aria-invalid="true"]');
      if (input) { input.focus(); input.reportValidity(); }
      else document.getElementById('validation-message')?.focus();
      return false;
    }
    const invalidField = Array.from(document.querySelectorAll('input, textarea')).find(input => !input.checkValidity());
    if (invalidField) { invalidField.focus(); invalidField.reportValidity(); return false; }
    if (!skipWarning) {
      const missing = [];
      const visible = input => !input.closest('.mode-hidden');
      const t = translations[currentLang];
      for (const [id,label] of [['companyName',t.biller],['client-name',t.client],['document-number',t.documentNumber],['issue-date',t.issueDate],['payment-due-date',t.paymentDueDate],['payment-method',t.paymentMethod]]) {
        const input = document.getElementById(id);
        if (visible(input) && !input.value.trim()) missing.push({ label, input });
      }
      const selected = Array.from(document.querySelectorAll('.item-row'));
      if (!selected.some(row => row.querySelector('.amt-input').value.trim())) missing.push({label:t.noItems,input:document.querySelector('.amt-input')});
      selected.forEach(row => {
        const amount = row.querySelector('.amt-input');
        const filled = row.querySelector('.row-description').value.trim() || row.querySelector('.pct-input').value.trim();
        if (filled && !amount.value.trim()) missing.push({label:`${t.amount} — ${t.installment} ${row.dataset.rowId}`,input:amount});
      });
      if (missing.length) { showPrintWarning(missing); return false; }
    }
    Workspace.printWithName('รายการชำระตามงวด', 'document-number');
    return true;
  }

  function showPrintWarning(missing) {
    document.getElementById('print-warning')?.remove();
    const t = translations[currentLang], dialog = document.createElement('dialog');
    dialog.id = 'print-warning'; dialog.className = 'print-warning no-print';
    dialog.setAttribute('aria-labelledby','print-warning-title');
    const title = document.createElement('h2'); title.id = 'print-warning-title'; title.textContent = t.incompleteTitle;
    const intro = document.createElement('p'); intro.textContent = t.incompleteIntro;
    const list = document.createElement('ul');
    missing.forEach(item => { const li = document.createElement('li'); li.textContent = item.label; list.append(li); });
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = t.backToEdit;
    edit.onclick = () => { dialog.close(); missing[0].input.focus(); };
    const proceed = document.createElement('button'); proceed.type = 'button'; proceed.textContent = t.printAnyway;
    proceed.onclick = () => { dialog.close(); printDocument(true); };
    dialog.append(title,intro,list,edit,proceed); document.body.append(dialog); dialog.showModal(); edit.focus();
  }

  function clearPrintMirrors() {
    document.querySelectorAll('.print-value').forEach(el => el.remove());
    document.querySelectorAll('.print-source').forEach(el => el.classList.remove('print-source'));
  }

  function preparePrintMirrors() {
    clearPrintMirrors(); calcAll();
    const signatureSection = document.querySelector('.footer-bottom-right');
    let hasSignature = false;
    signatureSection.querySelectorAll('.sig-col').forEach(column => {
      const name = column.querySelector('.sig-name-n');
      const date = column.querySelector('.sig-date-pk');
      updateSigDate(date.id, column.querySelector('.sig-date-disp').id);
      const hasName = Boolean(name.value.trim());
      const hasDate = Boolean(date.value);
      name.classList.toggle('is-empty', !hasName);
      column.classList.toggle('is-empty', !hasName && !hasDate);
      hasSignature ||= hasName || hasDate;
    });
    signatureSection.classList.toggle('is-empty', !hasSignature);
    document.querySelectorAll('.wrapper input, .wrapper textarea').forEach(input => {
      if (input.closest('.no-print') || input.matches('.sig-date-pk, .sig-name-n.is-empty, #issue-date')) return;
      const mirror = document.createElement('span');
      mirror.className = 'print-value';
      if (input.classList.contains('right')) mirror.classList.add('right');
      const cents = input.classList.contains('amt-input') ? parseAmountCents(amountValue(input.value)) : null;
      mirror.textContent = input.type === 'date' ? formatDate(input.value) : cents !== null && input.value.trim()
        ? (cents / 100).toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2}) : input.value;
      input.classList.add('print-source'); input.insertAdjacentElement('afterend', mirror);
    });
  }
  window.addEventListener('beforeprint', preparePrintMirrors);
  window.addEventListener('afterprint', clearPrintMirrors);

  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const issueDate = document.getElementById('issue-date');
  if (issueDate) {
    issueDate.value = localToday;
    issueDate.addEventListener('change', () => updateSigDate('issue-date', 'issue-date-display'));
  }
  document.querySelectorAll('textarea').forEach(textarea => textarea.addEventListener('input', () => resizeTextarea(textarea)));
  addRow('', '', '', false); addRow('', '', '', false); addRow('', '', '', false);
  setLanguage('th');
