(() => {
  const dialog = document.getElementById('installment-planner');
  const totalInput = document.getElementById('planner-total');
  const countInput = document.getElementById('planner-count');
  const ratesContainer = document.getElementById('planner-rates');
  const status = document.getElementById('planner-status');
  const tableBody = document.getElementById('tbl-body');

  function renderRates(values) {
    const count = countInput.valueAsNumber;
    if (!Number.isInteger(count) || !countInput.validity.valid || count < 1) return;
    const t = translations[currentLang];
    const fields = Array.from({ length: count }, (_, index) => {
      const field = document.createElement('div');
      field.className = 'planner-installment';
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.id = 'planner-rate-' + (index + 1);
      input.type = 'text';
      input.inputMode = 'decimal';
      input.value = values[index] || '';
      label.htmlFor = input.id;
      label.textContent = t.plannerRate(index + 1);
      field.append(label, input, document.createElement('output'));
      return field;
    });
    ratesContainer.replaceChildren(...fields);
  }

  function plan() {
    const t = translations[currentLang];
    const total = parseAmountCents(amountValue(totalInput.value));
    const controls = Array.from(ratesContainer.querySelectorAll('input'));
    const rates = controls.map(input => Money.decimal(input.value, 2, 10000));
    const rateTotal = rates.reduce((sum, rate) => sum + rate, 0);
    const ratePending = rates.some(rate => rate === 0);
    const rateInvalid = rates.includes(null);
    const countValid = Number.isInteger(countInput.valueAsNumber) && countInput.validity.valid;
    // Round cumulative totals so every satang is assigned and the sum is exact.
    let accumulated = 0;
    let previous = 0;
    const amounts = total && countValid && !ratePending && !rateInvalid && rateTotal === 10000
      ? rates.map(rate => {
        accumulated += rate;
        const rounded = Money.roundRatio(total, accumulated, 10000);
        const amount = rounded - previous;
        previous = rounded;
        return amount;
      }) : null;
    ratesContainer.querySelectorAll('output').forEach((output, index) => {
      output.value = amounts ? fmt(amounts[index] / 100) : '';
    });
    status.textContent = !countValid ? t.plannerInvalidCount
      : rateInvalid ? t.plannerInvalidRate : t.plannerRateTotal(rateTotal / 100);
    return { amounts, controls, total, countValid, ratePending };
  }

  document.getElementById('split-installments').addEventListener('click', () => {
    const rows = Array.from(tableBody.rows);
    const amounts = rows.map(row => parseAmountCents(amountValue(row.querySelector('.amt-input').value)));
    const sum = amounts.reduce((total, amount) => total + amount, 0);
    totalInput.value = amounts.includes(null) || !sum || sum > MAX_AMOUNT_CENTS ? '' : (sum / 100).toFixed(2);
    countInput.value = Math.min(Number(countInput.max), rows.length || 3);
    renderRates(rows.map(row => row.querySelector('.pct-input').value.trim().replace(/%$/, '').trim()));
    plan();
    dialog.showModal();
  });

  countInput.addEventListener('input', () => {
    renderRates(Array.from(ratesContainer.querySelectorAll('input'), input => input.value));
  });
  dialog.addEventListener('input', plan);
  document.getElementById('planner-cancel').addEventListener('click', () => dialog.close());
  dialog.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const result = plan();
    const t = translations[currentLang];
    if (!result.countValid) { countInput.focus(); return; }
    if (!result.total) { status.textContent = t.plannerInvalidTotal; totalInput.focus(); return; }
    if (!result.amounts) {
      if (result.ratePending) status.textContent = t.plannerInvalidRate;
      result.controls.find(input => !Money.decimal(input.value, 2, 10000))?.focus();
      return;
    }

    const rows = Array.from(tableBody.rows);
    const descriptions = rows.map(row => row.querySelector('.row-description').value);
    const replacesValues = rows.some(row => Array.from(row.querySelectorAll('.pct-input, .amt-input')).some(input => input.value.trim()));
    const removesDescriptions = descriptions.slice(result.amounts.length).some(description => description.trim());
    if ((replacesValues || removesDescriptions) && !window.confirm(t.plannerConfirm)) return;

    tableBody.replaceChildren();
    rowId = 0;
    result.amounts.forEach((amount, index) => {
      addRow(descriptions[index], result.controls[index].value.trim(), (amount / 100).toFixed(2), false);
    });
    dialog.close();
    tableBody.querySelector('.row-description')?.focus();
  });
})();
