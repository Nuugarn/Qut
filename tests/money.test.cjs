const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../shared/money.js');
test('strict decimal input preserves cents and rejects partial parses', () => {
  assert.equal(M.cents('0.10'), 10); assert.equal(M.cents(''), 0);
  for (const value of ['-1', '12abc', '1e3', '0.001', 'Infinity', '1,000']) assert.equal(M.cents(value), null);
  assert.equal(M.cents('9999999999.99'), M.MAX_CENTS);
  assert.equal(M.cents('10000000000'), null);
});
test('quantities and line rounding: no manual row total', () => {
  assert.equal(M.line('1','4000'), 400000);
  assert.equal(M.line('10','500'), 500000);
  assert.equal(M.line('12','500'), 600000);
  assert.equal(M.line('0.5','0.01'), 1);
  assert.equal(M.line('1.2345','100'), 12345);
  assert.equal(M.line('1.23456','100'), null);
  assert.equal(M.line('999999','9999999999'), null);
});
test('quote VAT none, exclusive and inclusive use exact satang', () => {
  assert.equal(M.quote({subtotal:1000000}).total,1000000);
  const ex = M.quote({subtotal:1000000,vatMode:'exclusive'});
  assert.equal(ex.vat,70000); assert.equal(ex.total,1070000);
  const inc = M.quote({subtotal:1070000,vatMode:'inclusive'});
  assert.equal(inc.vat,70000); assert.equal(inc.base,1000000); assert.equal(inc.total,1070000);
});
test('optional discount affects goods before extra costs and VAT, disabling removes its effect', () => {
  const args = {subtotal:1000000,extra:10000,discountEnabled:true,discountMode:'percent',discountValue:'10',vatMode:'exclusive'};
  const result=M.quote(args);
  assert.equal(result.discount,100000); assert.equal(result.total,973700);
  assert.equal(M.quote({...args,discountEnabled:false}).total,1080700);
  assert.equal(M.quote({...args,discountMode:'amount',discountValue:'1000'}).total,973700);
  assert.equal(M.quote({...args,discountValue:'101'}),null);
  assert.equal(M.quote({...args,discountMode:'amount',discountValue:'10001'}),null);
});
test('withholding estimate excludes extra costs and included VAT', () => {
  assert.equal(M.quote({subtotal:1000000,extra:100000,whtRate:'3',vatMode:'exclusive'}).wht,30000);
  assert.equal(M.quote({subtotal:1070000,extra:107000,whtRate:'3',vatMode:'inclusive'}).wht,30000);
  assert.equal(M.quote({subtotal:1000000,discountEnabled:true,discountValue:'1000',whtRate:'3'}).wht,27000);
});
test('totals reject overflow and exact max remains valid', () => {
  assert.equal(M.quote({subtotal:M.MAX_CENTS}).total,M.MAX_CENTS);
  assert.equal(M.quote({subtotal:M.MAX_CENTS,extra:1}),null);
  assert.equal(M.quote({subtotal:M.MAX_CENTS,vatMode:'exclusive'}),null);
});
