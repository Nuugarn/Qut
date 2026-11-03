/* Keep the original BILL editor/calculation unchanged; add only a tab draft. */
(function () {
  let restoring = true;
  const fields = ['companyName','companyContact','document-number','issue-date','project-name','client-name',
    'payment-method','payment-terms','additional-notes','biller-name','approver-name','sigBillerDate','sigApproverDate',
    'client-contact','payment-due-date','reference-number','client-tax'];
  function save() {
    if (restoring) return;
    Workspace.saveDraft('bill', {
      language:currentLang,
      fields:Object.fromEntries(fields.map(id => [id,document.getElementById(id).value])),
      rows:Array.from(document.querySelectorAll('.item-row'),row => ({
        description:row.querySelector('.row-description').value,
        percentage:row.querySelector('.pct-input').value,
        amount:amountValue(row.querySelector('.amt-input').value)
      }))
    });
  }
  // These actions change values without an input/change event.
  ['setLanguage','applyCompanyPreset','addRow','delRow'].forEach(name => {
    const original = window[name];
    window[name] = function (...args) { const result = original.apply(this,args); save(); return result; };
  });
  const draft = Workspace.readDraft('bill');
  if (draft && draft.fields && Array.isArray(draft.rows)) {
    fields.forEach(id => { if (typeof draft.fields[id] === 'string') document.getElementById(id).value = draft.fields[id]; });
    document.getElementById('tbl-body').replaceChildren(); rowId = 0;
    // Also accepts the previous combined version's draft: keep its displayed %
    // and amount as independent inputs, without recalculating saved amounts.
    draft.rows.forEach(row => addRow(row.description || '',row.percentage || '',row.amount || '',false));
    setLanguage(draft.language === 'en' ? 'en' : 'th');
  }
  restoring = false;
  document.addEventListener('input', save);
  document.addEventListener('change', save);
  window.saveBillDraft = save;
})();
