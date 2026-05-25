/*
 * More minimal HDate
 */
import {hebrewStripNikkud} from './hebrewStripNikkud';

const NISAN = 1;
const IYYAR = 2;
const SIVAN = 3;
const TAMUZ = 4;
const AV = 5;
const ELUL = 6;
const TISHREI = 7;
const CHESHVAN = 8;
const KISLEV = 9;
const TEVET = 10;
const SHVAT = 11;
const ADAR_I = 12;
const ADAR_II = 13;

/**
 * Hebrew months of the year (NISAN=1, TISHREI=7)
 * @readonly
 * @enum {number}
 */
export const months = {
  /** Nissan / ניסן */
  NISAN,
  /** Iyyar / אייר */
  IYYAR,
  /** Sivan / סיון */
  SIVAN,
  /** Tamuz (sometimes Tammuz) / תמוז */
  TAMUZ,
  /** Av / אב */
  AV,
  /** Elul / אלול */
  ELUL,
  /** Tishrei / תִּשְׁרֵי */
  TISHREI,
  /** Cheshvan / חשון */
  CHESHVAN,
  /** Kislev / כסלו */
  KISLEV,
  /** Tevet / טבת */
  TEVET,
  /** Sh'vat / שבט */
  SHVAT,
  /** Adar or Adar Rishon / אדר */
  ADAR_I,
  /** Adar Sheini (only on leap years) / אדר ב׳ */
  ADAR_II,
} as const;

const NISAN_STR = 'Nisan';
const monthNames0 = [
  '',
  NISAN_STR,
  'Iyyar',
  'Sivan',
  'Tamuz',
  'Av',
  'Elul',
  'Tishrei',
  'Cheshvan',
  'Kislev',
  'Tevet',
  "Sh'vat",
] as const;

/*
 * Transliterations of Hebrew month names.
 * Regular years are index 0 and leap years are index 1.
 * @private
 */
const monthNames = [
  [...monthNames0, 'Adar', NISAN_STR],
  [...monthNames0, 'Adar I', 'Adar II', NISAN_STR],
] as const;

/** Transliterated Hebrew month names. */
export type MonthName =
  | 'Nisan'
  | 'Iyyar'
  | 'Sivan'
  | 'Tamuz'
  | 'Av'
  | 'Elul'
  | 'Tishrei'
  | 'Cheshvan'
  | 'Kislev'
  | 'Tevet'
  | "Sh'vat"
  | 'Adar'
  | 'Adar I'
  | 'Adar II';

// Typed-array cache for elapsedDays, indexed by `year - ED_CACHE_MIN`.
// The range covers Hebrew years ~AD 1240 through ~AD 3240, which spans
// every realistic modern use. Years outside the range fall through
// uncached. 0 is the "not computed" sentinel; every valid input
// (year >= 1) produces a result >= 1, so it can't collide.
// elapsedDays(6999) is ~2.56M, well within Int32 range.
const ED_CACHE_MIN = 5000;
const ED_CACHE_MAX = 6999;
const edCache = new Int32Array(ED_CACHE_MAX - ED_CACHE_MIN + 1);

const EPOCH = -1373428;
// Avg year length in the cycle (19 solar years with 235 lunar months)
const AVG_HEBYEAR_DAYS = 365.24682220597794;

/**
 * @private
 */
function assertNumber(n: unknown, name: string) {
  if (typeof n !== 'number' || isNaN(n)) {
    throw new TypeError(`param '${name}' not a number: ${n}`);
  }
}

/**
 * Converts Hebrew date to R.D. (Rata Die) fixed days.
 * R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
 * Calendar.
 * @param year Hebrew year
 * @param month Hebrew month
 * @param day Hebrew date (1-30)
 * @example
 * import {hebrew2abs, months} from '@hebcal/hdate';
 * hebrew2abs(5769, months.CHESHVAN, 15); // 733359
 */
export function hebrew2abs(year: number, month: number, day: number): number {
  assertNumber(year, 'year');
  assertNumber(month, 'month');
  assertNumber(day, 'day');

  if (year < 1) {
    throw new RangeError(`hebrew2abs: invalid year ${year}`);
  }

  let tempabs: number = day;

  if (month < TISHREI) {
    const endMonth = monthsInYear(year);
    for (let m = TISHREI; m <= endMonth; m++) {
      tempabs += daysInMonth(m, year);
    }
    for (let m = NISAN; m < month; m++) {
      tempabs += daysInMonth(m, year);
    }
  } else {
    for (let m = TISHREI; m < month; m++) {
      tempabs += daysInMonth(m, year);
    }
  }

  return EPOCH + elapsedDays(year) + tempabs - 1;
}

/**
 * Convenience wrapper for `hebrew2abs` that accepts a
 * `SimpleHebrewDate` (`{yy, mm, dd}`) rather than three separate
 * arguments. Returns the same R.D. (Rata Die) day number.
 * @example
 * import {hd2abs, months} from '@hebcal/hdate';
 * hd2abs({yy: 5769, mm: months.CHESHVAN, dd: 15}); // 733359
 */
export function hd2abs(hdate: SimpleHebrewDate): number {
  return hebrew2abs(hdate.yy, hdate.mm, hdate.dd);
}

/**
 * @private
 */
function newYear(year: number): number {
  return EPOCH + elapsedDays(year);
}

export type SimpleHebrewDate = {
  /** Hebrew year */
  yy: number;
  /** Hebrew month of year (1=NISAN, 7=TISHREI) */
  mm: number;
  /** Day of month (1-30) */
  dd: number;
};

/**
 * Converts absolute R.D. days to Hebrew date
 * @param abs absolute R.D. days
 * @example
 * abs2hebrew(733359); // {yy: 5769, mm: 8, dd: 15} (15 Cheshvan 5769)
 */
export function abs2hebrew(abs: number): SimpleHebrewDate {
  assertNumber(abs, 'abs');
  abs = Math.trunc(abs);
  if (abs <= EPOCH) {
    throw new RangeError(`abs2hebrew: ${abs} is before epoch`);
  }
  // first, quickly approximate year
  let year = Math.floor((abs - EPOCH) / AVG_HEBYEAR_DAYS);
  while (newYear(year) <= abs) {
    ++year;
  }
  --year;

  let month = abs < hebrew2abs(year, 1, 1) ? 7 : 1;
  while (abs > hebrew2abs(year, month, daysInMonth(month, year))) {
    ++month;
  }

  const day = 1 + abs - hebrew2abs(year, month, 1);
  return {yy: year, mm: month, dd: day};
}

/**
 * Returns true if Hebrew year is a leap year
 * @param year Hebrew year
 * @example
 * isLeapYear(5783); // false
 * isLeapYear(5784); // true
 */
export function isLeapYear(year: number): boolean {
  return (1 + year * 7) % 19 < 7;
}

/**
 * Number of months in this Hebrew year (either 12 or 13 depending on leap year)
 * @param year Hebrew year
 * @example
 * monthsInYear(5783); // 12
 * monthsInYear(5784); // 13
 */
export function monthsInYear(year: number): number {
  return 12 + +isLeapYear(year); // boolean is cast to 1 or 0
}

// Static day counts indexed by month number. 0 marks months whose length
// depends on the year (CHESHVAN, KISLEV, ADAR_I).
const STATIC_DAYS_IN_MONTH: readonly number[] = [
  0, 30, 29, 30, 29, 30, 29, 30, 0, 0, 29, 30, 0, 29,
];

/**
 * Number of days in Hebrew month in a given year (29 or 30)
 * @param month Hebrew month (e.g. months.TISHREI)
 * @param year Hebrew year
 * @example
 * import {daysInMonth, months} from '@hebcal/hdate';
 * daysInMonth(months.CHESHVAN, 5769); // 29
 * daysInMonth(months.KISLEV, 5769);   // 30
 */
export function daysInMonth(month: number, year: number): number {
  const d = STATIC_DAYS_IN_MONTH[month];
  if (d !== 0) return d;
  if (month === ADAR_I) return isLeapYear(year) ? 30 : 29;
  if (month === CHESHVAN) return longCheshvan(year) ? 30 : 29;
  return shortKislev(year) ? 29 : 30; // KISLEV
}

/**
 * Returns a transliterated string name of Hebrew month in year,
 * for example 'Elul' or 'Cheshvan'.
 * @param month Hebrew month (e.g. months.TISHREI)
 * @param year Hebrew year
 * @example
 * import {getMonthName, months} from '@hebcal/hdate';
 * getMonthName(months.CHESHVAN, 5769); // 'Cheshvan'
 * getMonthName(months.ADAR_I, 5784);   // 'Adar I' (leap year)
 * getMonthName(months.ADAR_I, 5783);   // 'Adar'   (common year)
 */
export function getMonthName(month: number, year: number): MonthName {
  assertNumber(month, 'month');
  assertNumber(year, 'year');
  if (month < 1 || month > 14) {
    throw new TypeError(`bad monthNum: ${month}`);
  }
  return monthNames[+isLeapYear(year)][month] as MonthName;
}

/**
 * Days from sunday prior to start of Hebrew calendar to mean
 * conjunction of Tishrei in Hebrew YEAR
 * @param year Hebrew year
 */
export function elapsedDays(year: number): number {
  if (year >= ED_CACHE_MIN && year <= ED_CACHE_MAX) {
    const idx = year - ED_CACHE_MIN;
    const n = edCache[idx];
    if (n !== 0) return n;
    const elapsed = elapsedDays0(year);
    edCache[idx] = elapsed;
    return elapsed;
  }
  return elapsedDays0(year);
}

/**
 * Days from sunday prior to start of Hebrew calendar to mean
 * conjunction of Tishrei in Hebrew YEAR
 * @private
 * @param year Hebrew year
 */
function elapsedDays0(year: number): number {
  const prevYear: number = year - 1;
  const mElapsed: number =
    235 * Math.floor(prevYear / 19) + // Months in complete 19 year lunar (Metonic) cycles so far
    12 * (prevYear % 19) + // Regular months in this cycle
    Math.floor(((prevYear % 19) * 7 + 1) / 19); // Leap months this cycle

  const pElapsed: number = 204 + 793 * (mElapsed % 1080);

  const hElapsed: number =
    5 +
    12 * mElapsed +
    793 * Math.floor(mElapsed / 1080) +
    Math.floor(pElapsed / 1080);

  const parts: number = (pElapsed % 1080) + 1080 * (hElapsed % 24);

  const day: number = 1 + 29 * mElapsed + Math.floor(hElapsed / 24);
  let altDay: number = day;

  if (
    parts >= 19440 ||
    (2 === day % 7 && parts >= 9924 && !isLeapYear(year)) ||
    (1 === day % 7 && parts >= 16789 && isLeapYear(prevYear))
  ) {
    altDay++;
  }

  if (altDay % 7 === 0 || altDay % 7 === 3 || altDay % 7 === 5) {
    return altDay + 1;
  } else {
    return altDay;
  }
}

/**
 * Number of days in the hebrew YEAR.
 * A common Hebrew calendar year can have a length of 353, 354 or 355 days
 * A leap Hebrew calendar year can have a length of 383, 384 or 385 days
 * @param year Hebrew year
 * @example
 * daysInYear(5783); // 355
 * daysInYear(5784); // 383 (leap year)
 */
export function daysInYear(year: number): number {
  return elapsedDays(year + 1) - elapsedDays(year);
}

/**
 * true if Cheshvan is long in Hebrew year
 * @param year Hebrew year
 * @example
 * longCheshvan(5783); // true
 * longCheshvan(5784); // false
 */
export function longCheshvan(year: number): boolean {
  return daysInYear(year) % 10 === 5;
}

/**
 * true if Kislev is short in Hebrew year
 * @param year Hebrew year
 * @example
 * shortKislev(5783); // false
 * shortKislev(5784); // true
 */
export function shortKislev(year: number): boolean {
  return daysInYear(year) % 10 === 3;
}

/**
 * Converts Hebrew month string name to numeric
 * @param monthName monthName
 * @example
 * monthFromName('Cheshvan'); // 8
 * monthFromName('חשון');     // 8
 * monthFromName('Adar II');  // 13
 * monthFromName(7);          // 7 (passthrough)
 */
export function monthFromName(monthName: string | number): number {
  if (typeof monthName === 'number') {
    if (isNaN(monthName) || monthName < 1 || monthName > 14) {
      throw new RangeError(`bad monthName: ${monthName}`);
    }
    return monthName;
  }
  let c = monthName.trim().toLowerCase();
  // remove all niqud and trailing gershayim (for Adar Alef/Bet)
  c = hebrewStripNikkud(c).replace(/׳$/, '');
  // If Hebrew month starts with a bet (for example `בתמוז`) then ignore it
  if (c.startsWith('ב')) {
    c = c.substring(1);
  }
  /*
  the Hebrew months are unique to their second letter
  N         Nisan  (November?)
  I         Iyyar
  E        Elul
  C        Cheshvan
  K        Kislev
  1        1Adar
  2        2Adar
  Si Sh     Sivan, Shvat
  Ta Ti Te Tamuz, Tishrei, Tevet
  Av Ad    Av, Adar

  אב אד אי אל   אב אדר אייר אלול
  ח            חשון
  ט            טבת
  כ            כסלו
  נ            ניסן
  ס            סיון
  ש            שבט
  תמ תש        תמוז תשרי
  */
  switch (c[0]) {
    case 'n':
    case 'נ':
      if (c[1] === 'o') {
        break; /* this catches "november" */
      }
      return NISAN;
    case 'i':
      return IYYAR;
    case 'e':
      return ELUL;
    case 'c':
    case 'ח':
      return CHESHVAN;
    case 'k':
    case 'כ':
      return KISLEV;
    case 's':
      switch (c[1]) {
        case 'i':
          return SIVAN;
        case 'h':
          return SHVAT;
        default:
          break;
      }
      break;
    case 't':
      switch (c[1]) {
        case 'a':
          return TAMUZ;
        case 'i':
          return TISHREI;
        case 'e':
          return TEVET;
        default:
          break;
      }
      break;
    case 'a':
      switch (c[1]) {
        case 'v':
          return AV;
        case 'd':
          if (/(1|[^i]i|a|א)$/i.test(c)) {
            return ADAR_I;
          }
          return ADAR_II; // else assume sheini
        default:
          break;
      }
      break;
    case 'ס':
      return SIVAN;
    case 'ט':
      return TEVET;
    case 'ש':
      return SHVAT;
    case 'א':
      switch (c[1]) {
        case 'ב':
          return AV;
        case 'ד':
          if (/(1|[^i]i|a|א)$/i.test(c)) {
            return ADAR_I;
          }
          return ADAR_II; // else assume sheini
        case 'י':
          return IYYAR;
        case 'ל':
          return ELUL;
        default:
          break;
      }
      break;
    case 'ת':
      switch (c[1]) {
        case 'מ':
          return TAMUZ;
        case 'ש':
          return TISHREI;
        default:
          break;
      }
      break;
  }
  throw new RangeError(`bad monthName: ${monthName}`);
}
