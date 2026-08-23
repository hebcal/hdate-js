const GERESH = '׳';
const GERSHAYIM = '״';

const heb2num: Record<string, number> = {
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

const num2heb: Record<number, string> = {};
for (const [key, val] of Object.entries(heb2num)) {
  num2heb[val] = key;
}

/**
 * Final (sofit) Hebrew letters mapped to the value of their base form.
 * Used only when parsing a gematriya string; `gematriya()` never emits
 * these forms, so they are kept out of `heb2num` to avoid clobbering the
 * `num2heb` reverse map.
 */
const sofit2num: Record<string, number> = {
  ך: 20,
  ם: 40,
  ן: 50,
  ף: 80,
  ץ: 90,
} as const;

function num2digits(num: number): number[] {
  const digits: number[] = [];
  while (num > 0) {
    if (num === 15 || num === 16) {
      digits.push(9, num - 9);
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
  const num1 = parseInt(num as string, 10);
  if (!num1 || num1 < 0) {
    throw new TypeError(`invalid number: ${num}`);
  }
  let str = '';
  const thousands = Math.floor(num1 / 1000);
  if (thousands > 0 && thousands !== 5) {
    const tdigits = num2digits(thousands);
    for (const tdig of tdigits) {
      str += num2heb[tdig];
    }
    str += GERESH;
  }
  const digits = num2digits(num1 % 1000);
  if (digits.length === 1) {
    return str + num2heb[digits[0]] + GERESH;
  }
  for (let i = 0; i < digits.length; i++) {
    if (i + 1 === digits.length) {
      str += GERSHAYIM;
    }
    str += num2heb[digits[i]];
  }
  return str;
}

/**
 * Converts a string of Hebrew letters to a numerical value.
 *
 * Considers the value of Hebrew letters `א` through `ת`, and the five final
 * (sofit) forms `ך`, `ם`, `ן`, `ף`, `ץ`, which count as their base letters
 * (20, 40, 50, 80, 90). This matches how Hebrew years are written — e.g.
 * `תש״ף` is 780 — since the last letter of a year falls in final form.
 * Vowels (nekudot) are ignored.
 * @example
 * gematriyaStrToNum('תשע״ד');   // 774
 * gematriyaStrToNum('תש״ף');    // 780 (final pe)
 * gematriyaStrToNum('ט״ו');     // 15
 * gematriyaStrToNum('ג׳תשס״א'); // 3761 (thousands prefix)
 */
export function gematriyaStrToNum(str: string): number {
  if (typeof str !== 'string') {
    throw new TypeError(`bad gematriya str: ${str}`);
  }
  let num = 0;
  const gereshIdx: number = str.indexOf(GERESH);
  if (gereshIdx !== -1 && gereshIdx !== str.length - 1) {
    const thousands = str.substring(0, gereshIdx);
    num += gematriyaStrToNum(thousands) * 1000;
    str = str.substring(gereshIdx);
  }
  for (const ch of str) {
    const n: number | undefined = heb2num[ch] ?? sofit2num[ch];
    if (typeof n === 'number') {
      num += n;
    }
  }
  return num;
}
