const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'Bill', 'app.js'), 'utf8');

function loadCalculations(language = 'th') {
  // Load the actual production functions, without starting the browser UI.
  const startup = source.indexOf("\n  document.addEventListener(");
  assert.ok(startup > 0, 'Expected the UI event-registration boundary in app.js');
  const context = vm.createContext({ document: {}, window: {} });
  vm.runInContext(source.slice(0, startup), context, { filename: 'app.js' });
  vm.runInContext(`currentLang = ${JSON.stringify(language)}`, context);
  return context;
}

test('amounts become integer satang, including blank and maximum allowed amount', () => {
  const { parseAmountCents } = loadCalculations();
  const cases = [
    ['', 0], ['   ', 0], ['0', 0], ['0.00', 0], ['0.01', 1],
    ['0.1', 10], ['1234.56', 123456], [' 12.50 ', 1250],
    ['00012.50', 1250], ['9999999999.99', 999999999999]
  ];
  for (const [amount, expected] of cases) {
    assert.equal(parseAmountCents(amount), expected, JSON.stringify(amount));
  }
});

test('negative, malformed, non-finite and out-of-range amounts are rejected', () => {
  const { parseAmountCents } = loadCalculations();
  const invalid = [
    '-1', '-0.01', '+1', '1e3', 'Infinity', 'NaN', '1,000.00',
    '100บาท', '1.2.3', '10000000000', '9999999999.999',
    '999999999999999999999999999999999999999'
  ];
  for (const amount of invalid) {
    assert.equal(parseAmountCents(amount), null, amount);
  }
});

test('rejects sub-satang amounts that previously made displayed rows disagree with the total', () => {
  const { parseAmountCents } = loadCalculations();
  // Previously two 0.005 rows displayed 0.01 each while their total displayed 0.01.
  assert.equal(parseAmountCents('0.005'), null);
  assert.equal(parseAmountCents('1.005'), null);
  assert.equal(parseAmountCents('1.230'), null);
});

test('sums accepted amounts exactly in satang rather than binary fractions', () => {
  const { parseAmountCents } = loadCalculations();
  assert.equal(['0.10', '0.20'].map(parseAmountCents).reduce((a, b) => a + b, 0), 30);
  assert.equal(['199.99', '0.01'].map(parseAmountCents).reduce((a, b) => a + b, 0), 20000);
  assert.equal(Array.from({ length: 1000 }, () => parseAmountCents('0.01')).reduce((a, b) => a + b, 0), 1000);
});

test('formats leap-day dates in Thai Buddhist and English Gregorian calendars', () => {
  assert.equal(loadCalculations('th').formatDate('2024-02-29'), '29 ก.พ. 2567');
  assert.equal(loadCalculations('en').formatDate('2024-02-29'), '29 Feb 2024');
  assert.equal(loadCalculations('th').formatDate('2026-10-26'), '26 ต.ค. 2569');
  assert.equal(loadCalculations('en').formatDate('2026-10-26'), '26 Oct 2026');
});

test('rejects impossible dates instead of normalizing them into another month', () => {
  const { formatDate } = loadCalculations();
  for (const date of ['', '2023-02-29', '2024-02-30', '2026-04-31', '2026-13-01', '2026-00-01', '2026-01-00']) {
    assert.equal(formatDate(date), '', date);
  }
});

test('preserves years below 100 instead of treating them as years in the 1900s', () => {
  const { formatDate } = loadCalculations('en');
  assert.equal(formatDate('0001-01-01'), '1 Jan 1');
  assert.equal(formatDate('0099-12-31'), '31 Dec 99');
});
