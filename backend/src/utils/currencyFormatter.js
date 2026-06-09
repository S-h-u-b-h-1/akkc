export const convertAmountToWords = (amount) => {
  if (amount === undefined || amount === null) return '';
  if (amount === 0 || amount === '0') return 'Zero Only';

  let num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '';

  num = Math.round(num); // Ensure we're dealing with whole numbers for simplicity
  if (num === 0) return 'Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numStr = num.toString();
  let words = '';

  const getHundreds = (n) => {
    let str = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) {
      str += singleDigits[h] + ' Hundred ';
    }
    if (rem > 0) {
      if (rem < 10) {
        str += singleDigits[rem] + ' ';
      } else if (rem < 20) {
        str += twoDigits[rem - 10] + ' ';
      } else {
        const t = Math.floor(rem / 10);
        const o = rem % 10;
        str += tensMultiple[t] + ' ';
        if (o > 0) {
          str += singleDigits[o] + ' ';
        }
      }
    }
    return str;
  };

  let remaining = num;

  const crores = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakhs = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousands = Math.floor(remaining / 1000);
  remaining %= 1000;

  if (crores > 0) {
    words += getHundreds(crores).trim() + ' Crore ';
  }
  if (lakhs > 0) {
    words += getHundreds(lakhs).trim() + ' Lakh ';
  }
  if (thousands > 0) {
    words += getHundreds(thousands).trim() + ' Thousand ';
  }
  if (remaining > 0) {
    words += getHundreds(remaining).trim();
  }

  return 'INR ' + words.trim() + ' Only';
};
