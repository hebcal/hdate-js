const GERESH = '׳';
const GERSHAYIM = '״';

const alefbet = {
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  ז: 7,
  ח: 8,
  ט: 9,
  י: 10,
  כ: 20,
  ל: 30,
  מ: 40,
  נ: 50,
  ס: 60,
  ע: 70,
  פ: 80,
  צ: 90,
  ק: 100,
  ר: 200,
  ש: 300,
  ת: 400,
} as const;
const heb2num = new Map<string, number>();
const num2heb = new Map<number, string>();
for (const [key, val] of Object.entries(alefbet)) {
  heb2num.set(key, val);
  num2heb.set(val, key);
}

function num2digits(num: number): number[] {
  const digits: number[] = [];
  while (num > 0) {
    if (num === 15 || num === 16) {
      digits.push(9);
      digits.push(num - 9);
      break;
    }
    let incr = 100;
    let i;
    for (i = 400; i > num; i -= incr) {
      if (i === incr) {
        incr = incr / 10;
      }
    }
    digits.push(i);
    num -= i;
  }
  return digits;
}

/**
 * Converts a numerical value to a string of Hebrew letters.
 *
 * When specifying years of the Hebrew calendar in the present millennium,
 * we omit the thousands (which is presently 5 [ה]).
 * @example
 * gematriya(5774) // 'תשע״ד' - cropped to 774
 * gematriya(25) // 'כ״ה'
 * gematriya(60) // 'ס׳'
 * gematriya(3761) // 'ג׳תשס״א'
 * gematriya(1123) // 'א׳קכ״ג'
 */
export function gematriya(num: number | string): string {
  const num0 = <string>num;
  const num1 = parseInt(num0, 10);
  if (!num1 || num1 < 0) {
    throw new TypeError(`invalid gematriya number: ${num}`);
  }
  let str = '';
  const thousands = Math.floor(num1 / 1000);
  if (thousands > 0 && thousands !== 5) {
    const tdigits = num2digits(thousands);
    for (const tdig of tdigits) {
      str += num2heb.get(tdig);
    }
    str += GERESH;
  }
  const digits = num2digits(num1 % 1000);
  if (digits.length === 1) {
    return str + num2heb.get(digits[0]) + GERESH;
  }
  for (let i = 0; i < digits.length; i++) {
    if (i + 1 === digits.length) {
      str += GERSHAYIM;
    }
    str += num2heb.get(digits[i]);
  }
  return str;
}

/**
 * Converts a string of Hebrew letters to a numerical value.
 *
 * Only considers the value of Hebrew letters `א` through `ת`.
 * Ignores final Hebrew letters such as `ך` (kaf sofit) or `ם` (mem sofit)
 * and vowels (nekudot).
 */
export function gematriyaStrToNum(str: string): number {
  let num = 0;
  const gereshIdx: number = str.indexOf(GERESH);
  if (gereshIdx !== -1 && gereshIdx !== str.length - 1) {
    const thousands = str.substring(0, gereshIdx);
    num += gematriyaStrToNum(thousands) * 1000;
    str = str.substring(gereshIdx);
  }
  for (const ch of str) {
    const n: number | undefined = heb2num.get(ch);
    if (typeof n === 'number') {
      num += n;
    }
  }
  return num;
}
