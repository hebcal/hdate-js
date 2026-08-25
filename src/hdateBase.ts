/*
 * More minimal HDate
 */
import {hebrewStripNikkud} from './hebrewStripNikkud.js';

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
 * Hebrew months of the year (NISAN=1, TISHREI=7).
 *
 * Months are numbered from Nisan, the first month of the ecclesiastical
 * year, even though the civil year begins with Tishrei on Rosh Hashanah
 * (see {@link HDate.getTishreiMonth} for Tishrei-based numbering).
 *
 * In a common year month 12 is Adar; in a leap year month 12 is Adar I
 * and month 13 is Adar II.
 * @readonly
 * @enum {number}
 * @example
 * import {months, getMonthName} from '@hebcal/hdate';
 * months.TISHREI;                     // 7
 * getMonthName(months.ADAR_I, 5784);  // 'Adar I' (5784 is a leap year)
 * getMonthName(months.ADAR_I, 5783);  // 'Adar'
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

/**
 * Transliterated Hebrew month names, as returned by
 * {@link getMonthName} and {@link HDate.getMonthName}.
 *
 * These strings double as the message IDs used for translation, so they
 * can be passed straight to {@link Locale.gettext}.
 * @example
 * import {Locale} from '@hebcal/hdate';
 * const name: MonthName = 'Cheshvan';
 * Locale.gettext(name, 'he'); // 'חֶשְׁוָן'
 */
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
 * R.D. 1 is the imaginary date Monday, January 1, 1 on the (proleptic)
 * Gregorian Calendar.
 *
 * R.D. is the common currency between the two calendars: convert a
 * Hebrew date to R.D. with this function, then to a Gregorian `Date`
 * with {@link abs2greg}.
 * @param year Hebrew year
 * @param month Hebrew month (1=NISAN, 7=TISHREI)
 * @param day Hebrew date (1-30)
 * @returns R.D. number of days
 * @throws {TypeError} if any argument is not a number
 * @throws {RangeError} if `year` is less than 1
 * @see {@link abs2hebrew}
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
 * @param hdate Hebrew date, or any object with `yy`/`mm`/`dd` fields
 *   (an {@link HDate} qualifies)
 * @returns R.D. number of days
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

/**
 * A plain-object Hebrew date: year, month and day with no methods and no
 * time or location attached.
 *
 * This is the lightweight currency of the low-level functions in this
 * package ({@link abs2hebrew}, {@link hd2abs}, {@link getYahrzeitHD},
 * {@link getBirthdayHD}). The {@link HDate} class is structurally
 * compatible with it, so an `HDate` may be passed anywhere a
 * `SimpleHebrewDate` is expected.
 *
 * Note that nothing validates the field values: constructing
 * `{yy: 5769, mm: 8, dd: 31}` is possible even though Cheshvan 5769 has
 * only 29 days. Use {@link HDate} if you want out-of-range days and
 * months normalized for you.
 * @example
 * import {SimpleHebrewDate, months, hd2abs} from '@hebcal/hdate';
 * const hd: SimpleHebrewDate = {yy: 5769, mm: months.CHESHVAN, dd: 15};
 * hd2abs(hd); // 733359
 */
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
 * @returns the Hebrew date as a plain `{yy, mm, dd}` object
 * @throws {TypeError} if `abs` is not a number
 * @throws {RangeError} if `abs` precedes the Hebrew epoch
 * @see {@link hebrew2abs}
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
 * Returns true if Hebrew year is a leap year.
 *
 * The Hebrew calendar is lunisolar: 7 years out of every 19-year
 * (Metonic) cycle are leap years, in which a 13th month (Adar I) is
 * inserted before Adar so that Nisan stays in the spring.
 * @param year Hebrew year
 * @returns `true` if `year` has 13 months
 * @example
 * isLeapYear(5783); // false
 * isLeapYear(5784); // true
 */
export function isLeapYear(year: number): boolean {
  return (1 + year * 7) % 19 < 7;
}

/**
 * Number of months in this Hebrew year (either 12 or 13 depending on leap year).
 *
 * Because Adar II is the last month of a leap year and Adar the last
 * month of a common year, this doubles as "the number of the final
 * month", which is how the anniversary rules identify Adar.
 * @param year Hebrew year
 * @returns 12 or 13
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
 * Number of days in Hebrew month in a given year (29 or 30).
 *
 * Most months have a fixed length. Cheshvan and Kislev vary to absorb
 * the 353/354/355-day variation of the Hebrew year (see
 * {@link longCheshvan} and {@link shortKislev}), and Adar I has 30 days
 * in a leap year but 29 in a common year.
 * @param month Hebrew month (e.g. months.TISHREI)
 * @param year Hebrew year
 * @returns an integer 29-30
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
 *
 * The year matters only for the 12th month, which is named `'Adar'` in a
 * common year and `'Adar I'` in a leap year. To translate the result into
 * another locale, pass it to {@link Locale.gettext}.
 * @param month Hebrew month (e.g. months.TISHREI)
 * @param year Hebrew year
 * @returns transliterated month name
 * @throws {TypeError} if `month` is out of range 1-14
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
 * conjunction of Tishrei in Hebrew YEAR, after applying the four
 * postponement rules (dechiyot) that fix Rosh Hashanah.
 *
 * This is an implementation detail of the calendar arithmetic rather
 * than a supported entry point; prefer {@link hebrew2abs} or
 * {@link daysInYear}. Results for years 5000-6999 are cached.
 * @internal
 * @param year Hebrew year
 * @returns days elapsed since the epoch
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
 *
 * The three lengths within each group are deficient, regular and
 * complete years respectively; see {@link shortKislev} and
 * {@link longCheshvan} for which month absorbs the difference.
 * @param year Hebrew year
 * @returns 353-355 in a common year, 383-385 in a leap year
 * @example
 * daysInYear(5783); // 355
 * daysInYear(5784); // 383 (leap year)
 */
export function daysInYear(year: number): number {
  return elapsedDays(year + 1) - elapsedDays(year);
}

/**
 * true if Cheshvan is long in Hebrew year.
 *
 * Cheshvan normally has 29 days, but gains a 30th in a "complete"
 * (שלמה) year, one of the two ways the calendar stretches a year to
 * keep Rosh Hashanah off a forbidden weekday.
 * @param year Hebrew year
 * @returns `true` if Cheshvan has 30 days
 * @example
 * longCheshvan(5783); // true
 * longCheshvan(5784); // false
 */
export function longCheshvan(year: number): boolean {
  return daysInYear(year) % 10 === 5;
}

/**
 * true if Kislev is short in Hebrew year.
 *
 * Kislev normally has 30 days, but drops to 29 in a "deficient" (חסרה)
 * year, the counterpart to {@link longCheshvan} that shortens a year by
 * a day.
 * @param year Hebrew year
 * @returns `true` if Kislev has 29 days
 * @example
 * shortKislev(5783); // false
 * shortKislev(5784); // true
 */
export function shortKislev(year: number): boolean {
  return daysInYear(year) % 10 === 3;
}

/**
 * Resolves the "Adar I vs Adar II" ambiguity from the ordinal that trails
 * an Adar month name.
 *
 * By the time this is called the caller has already decided the month is
 * Adar (the name began with `ad` or `אד`) and has normalized `c`: trimmed,
 * lower-cased, nikud removed, and any leading bet prefix stripped. This
 * looks only at whatever follows the `adar`/`אדר` stem, ignoring the
 * separator (space, hyphen, period) and any gershayim, and answers which
 * of the two Adars was meant.
 *
 * Recognized as **Adar I** (the _first_ Adar): a bare `1`, roman `i`,
 * Latin `a`, `alef`/`aleph`/`alaph`, `rishon` (any `rish…`), or Hebrew
 * `א` / `ראשון` (any `ראש…`) / `אלף` (any `אל…`).
 *
 * Everything else resolves to **Adar II** (the _second_ Adar). That covers
 * the explicit second-Adar spellings — `2`, roman `ii`, Latin `b`,
 * `bet`/`beit`/`beis`, `sheni`/`sheini`, Hebrew `ב` / `שני` — but is also
 * the deliberate default for the ambiguous cases: a bare `Adar` with no
 * ordinal at all, or an unrecognized suffix such as `Adar Bogus`. An
 * unqualified Adar conventionally denotes the second Adar in a leap year,
 * so defaulting there keeps a silent miss on the more likely month.
 *
 * @param c normalized month name, already known to start with `adar`/`אדר`
 * @returns {@link ADAR_I} (12) or {@link ADAR_II} (13)
 */
function adarFromName(c: string): number {
  // Look only at the ordinal after the "adar"/"אדר" stem, and drop the
  // separator (space/hyphen/period) plus any gershayim so that
  // "Adar I", "Adar-I", "AdarI" and "אדר א׳" all reduce to the same token.
  const suffix = c.replace(/^(adar|אדר)/, '').replace(/[\s.'`\-׳״]/g, '');
  if (
    suffix === '1' ||
    suffix === 'i' ||
    suffix === 'a' ||
    suffix === 'א' ||
    suffix.startsWith('alef') ||
    suffix.startsWith('aleph') ||
    suffix.startsWith('alaph') ||
    suffix.startsWith('rish') ||
    suffix.startsWith('ראש') /* ראש (rishon) */ ||
    suffix.startsWith('אל') /* אלף (alef) */
  ) {
    return ADAR_I;
  }
  // Explicit second-Adar spellings and every ambiguous form default here.
  return ADAR_II;
}

/**
 * Converts Hebrew month string name to numeric.
 *
 * Accepts transliterated names (`'Cheshvan'`, `'Sh'vat'`), Hebrew-script
 * names with or without nikud (`'חשון'`, `'תִּשְׁרֵי'`), an optional bet
 * prefix (`'בתמוז'`), and passes numbers through unchanged. Matching is
 * case-insensitive and only needs enough of the name to be unambiguous.
 *
 * Before matching, the name is trimmed and lower-cased, its nikud is
 * removed (so `'תִּשְׁרֵי'` matches `'תשרי'`), and a single leading Hebrew
 * bet — the "in/of" prefix, as in `'בתמוז'` ("in Tamuz") — is dropped.
 *
 * ### Adar in a leap year
 *
 * Once the name is recognized as Adar, the trailing ordinal decides
 * between Adar I and Adar II across the many ways it gets written:
 *
 * - **Adar I** — `'Adar I'`, `'Adar 1'`, `'Adar Alef'`, `'Adar Rishon'`,
 *   `'אדר א'`, `'אדר ראשון'`.
 * - **Adar II** — `'Adar II'`, `'Adar 2'`, `'Adar Bet'`, `'Adar Sheni'`,
 *   `'אדר ב'`, `'אדר שני'`.
 *
 * When the ordinal is missing or unrecognized (a bare `'Adar'`, or
 * something like `'Adar Bogus'`) the result is **ambiguous and defaults to
 * Adar II**, following the convention that an unqualified Adar means the
 * second Adar in a leap year. See {@link adarFromName} for the full set of
 * accepted spellings.
 *
 * @param monthName monthName
 * @returns Hebrew month number (1=NISAN, 7=TISHREI)
 * @throws {TypeError} if `monthName` is neither a string nor a number
 * @throws {RangeError} if the name is not recognized, or a numeric month
 *   is outside 1-14
 * @example
 * monthFromName('Cheshvan');    // 8
 * monthFromName('חשון');        // 8
 * monthFromName('Adar Rishon'); // 12 (Adar I)
 * monthFromName('Adar II');     // 13 (Adar II)
 * monthFromName('Adar');        // 13 (ambiguous, defaults to Adar II)
 * monthFromName(7);             // 7 (passthrough)
 */
export function monthFromName(monthName: string | number): number {
  if (typeof monthName === 'number') {
    if (isNaN(monthName) || monthName < 1 || monthName > 14) {
      throw new RangeError(`bad monthName: ${monthName}`);
    }
    return monthName;
  }
  if (typeof monthName !== 'string') {
    throw new TypeError(`bad monthName: ${monthName}`);
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
          return adarFromName(c);
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
          return adarFromName(c);
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
