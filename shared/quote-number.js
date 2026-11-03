(function () {
  const bill = document.body.dataset.section === 'bill';
  const source = document.getElementById(bill ? 'document-number' : 'docNo');
  if (!source) return;
  const year = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Bangkok', year:'numeric'}).format(new Date());
  const kind = bill ? 'BL' : 'QT';
  const prefix = `${kind}-${year}-`;
  const previous = source.value;
  const match = previous.match(new RegExp('^' + kind + '-\\d{4}-(\\d{1,4})$', 'i'));
  // Retain a nonstandard old draft until the user edits the new number.
  const serial = match ? match[1].padStart(4,'0') : '0001';
  const wrap = document.createElement('span');
  wrap.className = 'document-number-editor';
  const screenPrefix = document.createElement('span'); screenPrefix.className = 'no-print'; screenPrefix.textContent = prefix;
  const input = document.createElement('input'); input.className = 'number-serial no-print'; input.type = 'text'; input.inputMode = 'numeric'; input.maxLength = 4; input.value = serial; input.setAttribute('aria-label','เลขที่เอกสาร 4 หลักท้าย');
  const printed = document.createElement('span'); printed.className = 'number-printed';
  source.classList.add('no-print'); source.hidden = true;
  source.insertAdjacentElement('afterend', wrap); wrap.append(screenPrefix,input,printed);
  function update(commit) {
    input.value = input.value.replace(/\D/g,'').slice(0,4);
    if (commit) input.value = (input.value || '0').padStart(4,'0');
    source.value = prefix + input.value;
    printed.textContent = source.value;
    source.dispatchEvent(new Event('input',{bubbles:true}));
  }
  if (!previous || match) update(true);
  else {
    printed.textContent = previous;
    const notice = document.createElement('span'); notice.className = 'no-print';
    notice.textContent = 'เลขเดิม: ' + previous + ' (แก้ 4 หลักเพื่อเปลี่ยน) ';
    wrap.insertBefore(notice, screenPrefix);
    input.addEventListener('input', () => notice.remove(), {once:true});
  }
  input.addEventListener('input',()=>update(false));
  input.addEventListener('blur',()=>update(true));
})();
