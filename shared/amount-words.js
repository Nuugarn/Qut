/* Convert integer satang without floating-point fractional arithmetic. */
(function (root) {
  const thDigits = ['ศูนย์','หนึ่ง','สอง','สาม','สี่','ห้า','หก','เจ็ด','แปด','เก้า'];
  function thaiNumber(n) {
    if (n >= 1000000) return thaiNumber(Math.floor(n / 1000000)) + 'ล้าน' + (n % 1000000 ? (n % 1000000 === 1 ? 'เอ็ด' : thaiNumber(n % 1000000)) : '');
    const digits = String(n), units = ['','สิบ','ร้อย','พัน','หมื่น','แสน'];
    let text = '';
    for (let i = 0; i < digits.length; i++) {
      const d = Number(digits[i]), place = digits.length - i - 1;
      if (!d) continue;
      if (place === 1) text += (d === 1 ? '' : d === 2 ? 'ยี่' : thDigits[d]) + 'สิบ';
      else text += (place === 0 && d === 1 && n > 1 ? 'เอ็ด' : thDigits[d]) + units[place];
    }
    return text || thDigits[0];
  }
  function englishNumber(n) {
    const small = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
    if (n < 20) return small[n];
    if (n < 100) return ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'][Math.floor(n / 10)] + (n % 10 ? ' ' + small[n % 10] : '');
    for (const [value,name] of [[1000000000,'billion'],[1000000,'million'],[1000,'thousand'],[100,'hundred']]) {
      if (n >= value) return englishNumber(Math.floor(n / value)) + ' ' + name + (n % value ? ' ' + englishNumber(n % value) : '');
    }
  }
  function text(cents, language = 'th') {
    if (!Number.isSafeInteger(cents) || cents < 0) return '';
    const baht = Math.floor(cents / 100), satang = cents % 100;
    return language === 'en'
      ? englishNumber(baht) + ' baht' + (satang ? ' and ' + englishNumber(satang) + ' satang' : ' only')
      : thaiNumber(baht) + 'บาท' + (satang ? thaiNumber(satang) + 'สตางค์' : 'ถ้วน');
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {text};
  else root.AmountWords = {text};
})(globalThis);
