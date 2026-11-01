(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const bill = document.body.dataset.section === 'bill';
    const key = bill ? 'bill-mode' : 'qut-mode';
    const saved = Workspace.readDraft(key) || {};
    const state = { mode: ['simple','full','custom'].includes(saved.mode) ? saved.mode : 'full', custom: saved.custom || {} };
    const groups = {};
    const tag = (name, ...nodes) => { groups[name] = nodes.filter(Boolean); };
    const byId = id => document.getElementById(id);
    const field = id => byId(id)?.closest('.field');
    if (bill) {
      tag('people', document.querySelector('.company-fields'), field('client-name'), field('client-contact'));
      tag('project', field('project-name'));
      tag('document', ...document.querySelectorAll('.doc-badge > :not(.badge-title)'));
      tag('terms', field('payment-terms'));
      tag('bank', field('payment-method'));
      tag('notes', field('additional-notes'));
      tag('signatures', document.querySelector('.footer-bottom-right'));
      tag('due', field('payment-due-date'));
    } else {
      tag('people', byId('companyNote').parentElement);
      tag('project', byId('quote-project-field'));
      tag('document', document.querySelector('.doc-badge > div:not(.badge-title)'));
      tag('terms', byId('quote-terms-field'));
      tag('bank', byId('quote-bank-field'));
      tag('notes', byId('remarks').parentElement);
      tag('signatures', document.querySelector('.footer-bottom-right'));
    }
    const container = document.createElement('div');
    container.className = 'mode-controls no-print';
    container.innerHTML = '<details class="mode-settings"><summary id="format-label"></summary><div class="mode-panel"><label for="document-mode" id="mode-label"></label><select id="document-mode"></select><div id="custom-options"><div class="mode-options"></div></div><div id="amount-words-option"></div></div></details>';
    document.querySelector('.topbar-actions').prepend(container);
    const select = byId('document-mode'), details = container.querySelector('details');
    if (bill) {
      const label = document.createElement('label'), input = document.createElement('input'), span = document.createElement('span');
      input.type = 'checkbox'; input.id = 'show-amount-words'; input.checked = saved.amountWords !== false;
      label.append(input,span); byId('amount-words-option').append(label);
      input.addEventListener('change', () => { state.amountWords = input.checked; apply(); persist(); });
      state.amountWords = input.checked;
    }
    const labels = {
      th: { mode:'รูปแบบ', simple:'อย่างง่าย', full:'ข้อมูลเต็ม', custom:'กำหนดเอง', people:'ข้อมูลผู้จัดทำ / ลูกค้า', project:'ข้อมูลโครงการ', document:'เลขที่ / วันที่ / อ้างอิง', terms:'เงื่อนไขชำระเงิน', bank:'บัญชีธนาคาร', notes:'หมายเหตุ', signatures:'ลายเซ็น', due:'วันครบกำหนดชำระ' },
      en: { mode:'Layout', simple:'Simple', full:'Full', custom:'Custom', people:'Biller / Customer', project:'Project', document:'Number / Dates / Reference', terms:'Payment terms', bank:'Bank account', notes:'Notes', signatures:'Signatures', due:'Payment due date' }
    };
    for (const mode of ['simple','full','custom']) { const option = document.createElement('option'); option.value = mode; select.append(option); }
    for (const name of Object.keys(groups)) {
      const label = document.createElement('label'), input = document.createElement('input'), span = document.createElement('span');
      input.type = 'checkbox'; input.dataset.group = name; input.checked = state.custom[name] !== false;
      label.append(input, span); container.querySelector('.mode-options').append(label);
      input.addEventListener('change', () => { state.custom[name] = input.checked; apply(); persist(); });
    }
    function persist() { Workspace.saveDraft(key, state); }
    function apply() {
      const en = document.documentElement.lang === 'en', text = labels[en ? 'en' : 'th'];
      byId('mode-label').textContent = text.mode;
      for (const option of select.options) option.textContent = text[option.value];
      select.value = state.mode;
      byId('format-label').textContent = (en ? 'Document layout' : 'รูปแบบเอกสาร') + ' · ' + text[state.mode];
      document.querySelectorAll('[data-mode-th]').forEach(node => node.textContent = en ? node.dataset.modeEn : node.dataset.modeTh);
      byId('custom-options').hidden = state.mode !== 'custom';
      if (bill) {
        byId('show-amount-words').nextElementSibling.textContent = en ? 'Amount in words' : 'จำนวนเงินตัวอักษร';
        byId('bill-amount-words').classList.toggle('mode-hidden', !state.amountWords);
      }
      document.body.dataset.documentMode = state.mode;
      for (const [name,nodes] of Object.entries(groups)) {
        const visible = state.mode === 'full' || (state.mode === 'custom' && state.custom[name] !== false);
        nodes.forEach(node => node.classList.toggle('mode-hidden', !visible));
        const input = container.querySelector(`[data-group="${name}"]`);
        input.nextElementSibling.textContent = text[name];
      }
      const simple = state.mode === 'simple';
      document.querySelector('.badge-title').textContent = simple
        ? (bill ? (en ? 'Preliminary Payment Schedule' : 'รายการชำระเงินเบื้องต้น') : (en ? 'Preliminary Quotation' : 'ใบเสนอราคาเบื้องต้น'))
        : (bill ? (en ? 'BILLING STATEMENT' : 'ใบวางบิล') : (en ? 'QUOTATION' : 'ใบเสนอราคา'));
      if (bill) {
        const projectCard = byId('project-name').closest('.card');
        projectCard.classList.toggle('mode-hidden', !Array.from(projectCard.querySelectorAll('.field')).some(node => !node.classList.contains('mode-hidden')));
        const footer = document.querySelector('.footer-bottom-left');
        const showFooter = Array.from(footer.children).some(node => !node.classList.contains('mode-hidden'));
        footer.classList.toggle('mode-hidden', !showFooter);
        document.querySelector('.footer-top-left').classList.toggle('mode-hidden', !showFooter);
      }
      document.querySelectorAll('textarea').forEach(node => {
        if (node.getClientRects().length) { node.style.height = 'auto'; node.style.height = node.scrollHeight + 'px'; }
      });
    }
    select.addEventListener('change', () => { state.mode = select.value; apply(); persist(); });
    document.addEventListener('click', event => { if (!details.contains(event.target)) details.open = false; });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && details.open) { details.open = false; details.querySelector('summary').focus(); } });
    new MutationObserver(apply).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    window.DocumentModes = { apply };
    apply();
  });
})();
