/* All amounts are integer satang. Decimal quantities/rates allow four places. */
(function (root) {
  'use strict';
  const MAX_CENTS = 999999999999;
  function decimal(value, places = 2, max = MAX_CENTS) {
    const text = String(value ?? '').trim();
    if (!text) return 0;
    if (!new RegExp('^\\d+(?:\\.\\d{1,' + places + '})?$').test(text)) return null;
    const [whole, fraction = ''] = text.split('.');
    const scaled = Number(whole) * 10 ** places + Number(fraction.padEnd(places, '0'));
    return Number.isSafeInteger(scaled) && scaled <= max ? scaled : null;
  }
  function roundRatio(value, numerator, denominator) {
    const result = (BigInt(value) * BigInt(numerator) + BigInt(denominator) / 2n) / BigInt(denominator);
    return result <= BigInt(MAX_CENTS) ? Number(result) : null;
  }
  const cents = value => decimal(value);
  const rate = value => decimal(value, 4, 1000000); // 0–100 percent
  function line(quantity, price) {
    const q = decimal(quantity, 4, 999999999999);
    const p = cents(price);
    return q === null || p === null ? null : roundRatio(p, q, 10000);
  }
  function quote({ subtotal, extra = 0, discountEnabled = false, discountMode = 'amount', discountValue = '', vatMode = 'none', whtRate = '' }) {
    if (![subtotal, extra].every(v => Number.isSafeInteger(v) && v >= 0 && v <= MAX_CENTS)) return null;
    const d = discountEnabled ? (discountMode === 'percent' ? rate(discountValue) : cents(discountValue)) : 0;
    if (d === null) return null;
    const discount = discountMode === 'percent' ? roundRatio(subtotal, d, 1000000) : d;
    if (discount === null || discount > subtotal) return null;
    // Discount applies to goods/services; extra costs are added afterwards.
    const goods = subtotal - discount, amount = goods + extra;
    if (amount > MAX_CENTS) return null;
    const vat = vatMode === 'inclusive' ? roundRatio(amount, 7, 107) : vatMode === 'exclusive' ? roundRatio(amount, 7, 100) : 0;
    if (vat === null) return null;
    const base = vatMode === 'inclusive' ? amount - vat : amount;
    const total = vatMode === 'exclusive' ? amount + vat : amount;
    const wr = rate(whtRate);
    if (wr === null || total > MAX_CENTS) return null;
    // Preserve the original estimate's exclusion of extra costs and VAT.
    const whtBase = vatMode === 'inclusive' ? goods - roundRatio(goods, 7, 107) : goods;
    const wht = roundRatio(whtBase, wr, 1000000);
    return { subtotal, discount, goods, amount, base, vat, total, wht, net: total - wht };
  }
  const api = { MAX_CENTS, decimal, cents, rate, roundRatio, line, quote };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Money = api;
})(globalThis);
