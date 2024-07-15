/*
 * More minimal HDate
 */

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

const monthNames0: string[] = [
  '',
  'Nisan',
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

/**
 * Transliterations of Hebrew month names.
 * Regular years are index 0 and leap years are index 1.
 * @private
 */
const monthNames: string[][] = [
  monthNames0.concat(['Adar', 'Nisan']),
  monthNames0.concat(['Adar I', 'Adar II', 'Nisan']),
] as const;

const edCache: Map<number, number> = new Map<number, number>();

const EPOCH = -1373428;
// Avg year length in the cycle (19 solar years with 235 lunar months)
const AVG_HEBYEAR_DAYS = 365.24682220597794;

/**
 * @private
 */
function assertNumber(n: any, name: string) {
  if (typeof n !== 'number' || isNaN(n)) {
    throw new TypeError(`invalid parameter '${name}' not a number: ${n}`);
  }
}

/**
 * Converts Hebrew date to R.D. (Rata Die) fixed days.
 * R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
 * Calendar.
 * @param year Hebrew year
 * @param month Hebrew month
 * @param day Hebrew date (1-30)
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
    for (let m = TISHREI; m <= monthsInYear(year); m++) {
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
 * Converts Hebrew date to R.D. (Rata Die) fixed days.
 * R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
 * Calendar.
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
 */
export function isLeapYear(year: number): boolean {
  return (1 + year * 7) % 19 < 7;
}

/**
 * Number of months in this Hebrew year (either 12 or 13 depending on leap year)
 * @param year Hebrew year
 */
export function monthsInYear(year: number): number {
  return 12 + +isLeapYear(year); // boolean is cast to 1 or 0
}

/**
 * Number of days in Hebrew month in a given year (29 or 30)
 * @param month Hebrew month (e.g. months.TISHREI)
 * @param year Hebrew year
 */
export function daysInMonth(month: number, year: number): number {
  switch (month) {
    case IYYAR:
    case TAMUZ:
    case ELUL:
    case TEVET:
    case ADAR_II:
      return 29;
    default:
      break;
  }
  if (
    (month === ADAR_I && !isLeapYear(year)) ||
    (month === CHESHVAN && !longCheshvan(year)) ||
    (month === KISLEV && shortKislev(year))
  ) {
    return 29;
  } else {
    return 30;
  }
}

/**
 * Returns a transliterated string name of Hebrew month in year,
 * for example 'Elul' or 'Cheshvan'.
 * @param month Hebrew month (e.g. months.TISHREI)
 * @param year Hebrew year
 */
export function getMonthName(month: number, year: number): string {
  assertNumber(month, 'month');
  assertNumber(year, 'year');
  if (month < 1 || month > 14) {
    throw new TypeError(`bad month argument ${month}`);
  }
  return monthNames[+isLeapYear(year)][month];
}

/**
 * Days from sunday prior to start of Hebrew calendar to mean
 * conjunction of Tishrei in Hebrew YEAR
 * @param year Hebrew year
 */
export function elapsedDays(year: number): number {
  const n = edCache.get(year);
  if (typeof n === 'number') {
    return n;
  }
  const elapsed: number = elapsedDays0(year);
  edCache.set(year, elapsed);
  return elapsed;
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
 */
export function daysInYear(year: number): number {
  return elapsedDays(year + 1) - elapsedDays(year);
}

/**
 * true if Cheshvan is long in Hebrew year
 * @param year Hebrew year
 */
export function longCheshvan(year: number): boolean {
  return daysInYear(year) % 10 === 5;
}

/**
 * true if Kislev is short in Hebrew year
 * @param year Hebrew year
 */
export function shortKislev(year: number): boolean {
  return daysInYear(year) % 10 === 3;
}

/**
 * Converts Hebrew month string name to numeric
 * @param monthName monthName
 */
export function monthFromName(monthName: string): number {
  if (typeof monthName === 'number') {
    if (isNaN(monthName) || monthName < 1 || monthName > 14) {
      throw new RangeError(`Invalid month name: ${monthName}`);
    }
    return monthName;
  }
  let c = monthName.trim().toLowerCase();
  // If Hebrew month starts with a bet (for example `בתמוז`) then ignore it
  if (c[0] === 'ב') {
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
          if (/(1|[^i]i|a|א)$/i.test(monthName)) {
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
          if (/(1|[^i]i|a|א)$/i.test(monthName)) {
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
  throw new RangeError(`Unable to parse month name: ${monthName}`);
}
