const {test} = require('node:test');
const assert = require('node:assert/strict');
const {text} = require('../shared/amount-words.js');
test('Thai whole amounts and satang', () => {
  for (const [value,expected] of [[0,'ศูนย์บาทถ้วน'],[43000000,'สี่แสนสามหมื่นบาทถ้วน'],[21500000,'สองแสนหนึ่งหมื่นห้าพันบาทถ้วน'],[12900000,'หนึ่งแสนสองหมื่นเก้าพันบาทถ้วน'],[4300000,'สี่หมื่นสามพันบาทถ้วน'],[21,'ศูนย์บาทยี่สิบเอ็ดสตางค์'],[10101,'หนึ่งร้อยเอ็ดบาทหนึ่งสตางค์'],[100000100,'หนึ่งล้านเอ็ดบาทถ้วน']]) assert.equal(text(value),expected);
});
test('English whole amounts and satang', () => {
  assert.equal(text(43000000,'en'),'four hundred thirty thousand baht only');
  assert.equal(text(21500021,'en'),'two hundred fifteen thousand baht and twenty one satang');
  assert.equal(text(0,'en'),'zero baht only');
});
test('Maximum amount stays readable and invalid amounts have no words', () => {
  assert.equal(text(999999999999),'เก้าพันเก้าร้อยเก้าสิบเก้าล้านเก้าแสนเก้าหมื่นเก้าพันเก้าร้อยเก้าสิบเก้าบาทเก้าสิบเก้าสตางค์');
  for (const n of [-1,NaN,Infinity,0.1]) assert.equal(text(n),'');
});
