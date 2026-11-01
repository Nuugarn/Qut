(function () {
  'use strict';
  const company = {
    th: { name: 'ช่างเกล้า Built-in', contact: '101/158 ซ.55 ถนนเลียบวารี แขวงโคกแฝก เขตหนองจอก กรุงเทพฯ 10530\nโทร.091-876-8157' },
    en: { name: 'Chang Klao Built-in', contact: '101/158 Soi 55, Liap Wari Road, Khok Faet, Nong Chok, Bangkok 10530\nTel. 091-876-8157' }
  };
  let storageFailed = false;
  function notice() {
    if (!storageFailed) return;
    let el = document.getElementById('session-warning');
    if (!el) {
      el = document.createElement('p'); el.id = 'session-warning'; el.className = 'session-warning no-print';
      el.setAttribute('role', 'status'); document.querySelector('.wrapper')?.prepend(el);
    }
    el.textContent = document.documentElement.lang === 'en'
      ? 'This browser cannot keep the draft. Print before switching sections or refreshing.'
      : 'เบราว์เซอร์นี้จำร่างไม่ได้ กรุณาพิมพ์ก่อนสลับ section หรือรีเฟรช';
  }
  function readDraft(key) {
    try {
      const raw = sessionStorage.getItem('qut-bill:v1:' + key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { storageFailed = true; notice(); return null; }
  }
  function saveDraft(key, value) {
    try { sessionStorage.setItem('qut-bill:v1:' + key, JSON.stringify(value)); }
    catch (_) { storageFailed = true; notice(); }
  }
  function clearDraft(key) {
    try { sessionStorage.removeItem('qut-bill:v1:' + key); }
    catch (_) { storageFailed = true; notice(); }
  }
  function clearPrint(root) {
    root.querySelectorAll('.print-value').forEach(el => el.remove());
    root.querySelectorAll('.print-source').forEach(el => el.classList.remove('print-source'));
  }
  function preparePrint(root) {
    clearPrint(root);
    root.querySelectorAll('input,textarea,select').forEach(input => {
      if (input.type === 'date' || input.type === 'checkbox' || input.closest('.no-print') || input.id === 'companyNote') return;
      const mirror = document.createElement('span'); mirror.className = 'print-value';
      mirror.textContent = input.tagName === 'SELECT' ? input.selectedOptions[0]?.textContent || '' : input.value;
      input.classList.add('print-source'); input.after(mirror);
    });
  }
  function updateNav() {
    const en = document.documentElement.lang === 'en';
    document.getElementById('nav-qut').textContent = en ? 'Quotation' : 'ใบเสนอราคา';
    document.getElementById('nav-bill').textContent = en ? 'Billing statement' : 'ใบวางบิล';
    document.querySelector('.section-toggle').setAttribute('aria-label', en ? 'Choose document type' : 'เลือกประเภทเอกสาร');
    notice();
  }
  document.addEventListener('DOMContentLoaded', () => {
    const current = document.body.dataset.section;
    const title = document.querySelector('.topbar-title, .topbar .brand');
    const picker = document.createElement('details'); picker.className = 'section-switch no-print';
    const toggle = document.createElement('summary'); toggle.className = 'section-toggle';
    const arrow = document.createElement('span'); arrow.className = 'section-arrow'; arrow.textContent = '▾'; arrow.setAttribute('aria-hidden','true');
    const nav = document.createElement('nav'); nav.className = 'section-menu'; nav.setAttribute('aria-label', 'QUT / BILL');
    nav.innerHTML = '<a id="nav-qut" href="../Qut/index.html">ใบเสนอราคา</a><a id="nav-bill" href="../Bill/index.html">ใบวางบิล</a>';
    nav.querySelector(current === 'qut' ? '#nav-qut' : '#nav-bill').setAttribute('aria-current', 'page');
    title.replaceWith(picker); toggle.append(title, arrow); picker.append(toggle, nav); updateNav();
    document.addEventListener('click', event => { if (!picker.contains(event.target)) picker.open = false; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && picker.open) { picker.open = false; toggle.focus(); }
    });
    new MutationObserver(updateNav).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  });
  window.Workspace = { company, readDraft, saveDraft, clearDraft, preparePrint, clearPrint };
})();
