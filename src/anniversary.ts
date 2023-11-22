import {hebrew2abs, abs2hebrew, isLeapYear, months, monthsInYear,
  shortKislev, longCheshvan, SimpleHebrewDate} from './hdate';
import {greg} from './greg';

const NISAN = months.NISAN;
const CHESHVAN = months.CHESHVAN;
const KISLEV = months.KISLEV;
const TEVET = months.TEVET;
const SHVAT = months.SHVAT;
const ADAR_I = months.ADAR_I;
const ADAR_II = months.ADAR_II;

/**
 * Returns true if the object is a Javascript Date
 * @private
 * @param {Object} obj
 */
function isSimpleHebrewDate(obj: any): boolean {
  return typeof obj === 'object' && obj !== null &&
    typeof obj.yy === 'number' &&
    typeof obj.mm === 'number' &&
    typeof obj.dd === 'number';
}

/**
 * @private
 */
function toSimpleHebrewDate(obj: Date | SimpleHebrewDate | number): SimpleHebrewDate {
  if (isSimpleHebrewDate(obj)) {
    return obj as SimpleHebrewDate;
  } else if (typeof obj === 'number') {
    return abs2hebrew(obj);
  } else if (greg.isDate(obj)) {
    const abs = greg.greg2abs(obj as Date);
    return abs2hebrew(abs);
  } else {
    throw new TypeError(`Argument not a Date: ${obj}`);
  }
}

/**
 * Calculates yahrzeit.
 * `hyear` must be after original `date` of death.
 * Returns `undefined` when requested year preceeds or is same as original year.
 *
 * Hebcal uses the algorithm defined in "Calendrical Calculations"
 * by Edward M. Reingold and Nachum Dershowitz.
 *
 * The customary anniversary date of a death is more complicated and depends
 * also on the character of the year in which the first anniversary occurs.
 * There are several cases:
 *
 * * If the date of death is Marcheshvan 30, the anniversary in general depends
 *   on the first anniversary; if that first anniversary was not Marcheshvan 30,
 *   use the day before Kislev 1.
 * * If the date of death is Kislev 30, the anniversary in general again depends
 *   on the first anniversary — if that was not Kislev 30, use the day before
 *   Tevet 1.
 * * If the date of death is Adar II, the anniversary is the same day in the
 *   last month of the Hebrew year (Adar or Adar II).
 * * If the date of death is Adar I 30, the anniversary in a Hebrew year that
 *   is not a leap year (in which Adar only has 29 days) is the last day in
 *   Shevat.
 * * In all other cases, use the normal (that is, same month number) anniversary
 *   of the date of death. [Calendrical Calculations p. 113]
 * @example
 * import {getYahrzeit} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
 * const anniversary = getYahrzeit(5780, dt); // '2/25/2020' == '30 Sh\'vat 5780'
 * @param {number} hyear Hebrew year
 * @param {Date | SimpleHebrewDate | number} date Gregorian or Hebrew date of death
 * @return {Date} anniversary occurring in `hyear`
 */
export function getYahrzeit(hyear: number, date: Date | SimpleHebrewDate | number): Date | undefined {
  const hd = getYahrzeitHD(hyear, date);
  if (typeof hd === 'undefined') {
    return hd;
  }
  return greg.abs2greg(hebrew2abs(hd.yy, hd.mm, hd.dd));
}

export function getYahrzeitHD(hyear: number, date: Date | SimpleHebrewDate | number): SimpleHebrewDate | undefined {
  let hDeath = toSimpleHebrewDate(date);
  if (hyear <= hDeath.yy) {
    // Hebrew year ${hyear} occurs on or before original date in ${hDeath.yy}
    return undefined;
  }

  if (hDeath.mm == CHESHVAN && hDeath.dd == 30 && !longCheshvan(hDeath.yy + 1)) {
    // If it's Heshvan 30 it depends on the first anniversary;
    // if that was not Heshvan 30, use the day before Kislev 1.
    hDeath = abs2hebrew(hebrew2abs(hyear, KISLEV, 1) - 1);
  } else if (hDeath.mm == KISLEV && hDeath.dd == 30 && shortKislev(hDeath.yy + 1)) {
    // If it's Kislev 30 it depends on the first anniversary;
    // if that was not Kislev 30, use the day before Teveth 1.
    hDeath = abs2hebrew(hebrew2abs(hyear, TEVET, 1) - 1);
  } else if (hDeath.mm == ADAR_II) {
    // If it's Adar II, use the same day in last month of year (Adar or Adar II).
    hDeath.mm = monthsInYear(hyear);
  } else if (hDeath.mm == ADAR_I && hDeath.dd == 30 && !isLeapYear(hyear)) {
    // If it's the 30th in Adar I and year is not a leap year
    // (so Adar has only 29 days), use the last day in Shevat.
    hDeath.dd = 30;
    hDeath.mm = SHVAT;
  }
  // In all other cases, use the normal anniversary of the date of death.

  // advance day to rosh chodesh if needed
  if (hDeath.mm == CHESHVAN && hDeath.dd == 30 && !longCheshvan(hyear)) {
    hDeath.mm = KISLEV;
    hDeath.dd = 1;
  } else if (hDeath.mm == KISLEV && hDeath.dd == 30 && shortKislev(hyear)) {
    hDeath.mm = TEVET;
    hDeath.dd = 1;
  }

  hDeath.yy = hyear;
  return hDeath;
}

/**
 * Calculates a birthday or anniversary (non-yahrzeit).
 * `hyear` must be after original `date` of anniversary.
 * Returns `undefined` when requested year preceeds or is same as original year.
 *
 * Hebcal uses the algorithm defined in "Calendrical Calculations"
 * by Edward M. Reingold and Nachum Dershowitz.
 *
 * The birthday of someone born in Adar of an ordinary year or Adar II of
 * a leap year is also always in the last month of the year, be that Adar
 * or Adar II. The birthday in an ordinary year of someone born during the
 * first 29 days of Adar I in a leap year is on the corresponding day of Adar;
 * in a leap year, the birthday occurs in Adar I, as expected.
 *
 * Someone born on the thirtieth day of Marcheshvan, Kislev, or Adar I
 * has his birthday postponed until the first of the following month in
 * years where that day does not occur. [Calendrical Calculations p. 111]
 * @example
 * import {getBirthdayOrAnniversary} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
 * const anniversary = getBirthdayOrAnniversary(5780, dt); // '3/26/2020' == '1 Nisan 5780'
 * @param {number} hyear Hebrew year
 * @param {Date | SimpleHebrewDate | number} date Gregorian or Hebrew date of event
 * @return {Date} anniversary occurring in `hyear`
 */
export function getBirthdayOrAnniversary(hyear: number, date: Date | SimpleHebrewDate): Date | undefined {
  const hd = getBirthdayHD(hyear, date);
  if (typeof hd === 'undefined') {
    return hd;
  }
  return greg.abs2greg(hebrew2abs(hd.yy, hd.mm, hd.dd));
}

export function getBirthdayHD(hyear: number, date: Date | SimpleHebrewDate): SimpleHebrewDate | undefined {
  const orig = toSimpleHebrewDate(date);
  const origYear = orig.yy;
  if (hyear === origYear) {
    return orig;
  } else if (hyear < origYear) {
    // Hebrew year ${hyear} occurs on or before original date in ${origYear}
    return undefined;
  }
  const isOrigLeap = isLeapYear(origYear);
  let month = orig.mm;
  let day = orig.dd;

  if ((month == ADAR_I && !isOrigLeap) || (month == ADAR_II && isOrigLeap)) {
    month = monthsInYear(hyear);
  } else if (month == CHESHVAN && day == 30 && !longCheshvan(hyear)) {
    month = KISLEV;
    day = 1;
  } else if (month == KISLEV && day == 30 && shortKislev(hyear)) {
    month = TEVET;
    day = 1;
  } else if (month == ADAR_I && day == 30 && isOrigLeap && !isLeapYear(hyear)) {
    month = NISAN;
    day = 1;
  }

  return {yy: hyear, mm: month, dd: day};
}
