import {
  hebrew2abs,
  abs2hebrew,
  isLeapYear,
  months,
  monthsInYear,
  shortKislev,
  longCheshvan,
  SimpleHebrewDate,
} from './hdateBase';
import {abs2greg, greg2abs, isDate} from './greg';

const NISAN = months.NISAN;
const CHESHVAN = months.CHESHVAN;
const KISLEV = months.KISLEV;
const TEVET = months.TEVET;
const SHVAT = months.SHVAT;
const ADAR_I = months.ADAR_I;
const ADAR_II = months.ADAR_II;

/**
 * Returns true if the object is a SimpleHebrewDate
 * @private
 */
function isSimpleHebrewDate(obj0: unknown): boolean {
  const obj = obj0 as SimpleHebrewDate;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.yy === 'number' &&
    typeof obj.mm === 'number' &&
    typeof obj.dd === 'number'
  );
}

/**
 * Accepted forms of the original event date for `getYahrzeit`,
 * `getYahrzeitHD`, `getBirthdayOrAnniversary`, and `getBirthdayHD`.
 *
 * - `Date` — a Gregorian date (local time; hours and below ignored)
 * - `SimpleHebrewDate` — `{yy, mm, dd}` already in the Hebrew calendar
 * - `number` — an absolute R.D. day count
 *
 * An {@link HDate} is structurally a `SimpleHebrewDate` and may be
 * passed directly. The functions never modify the value you pass, so the
 * same original date can be reused to generate a run of years.
 * @example
 * import {yahrzeit, months} from '@hebcal/hdate';
 * const death: AnniversaryDate = {yy: 5784, mm: months.ADAR_II, dd: 15};
 * const years = [5785, 5786, 5787].map(y => yahrzeit(y, death));
 */
export type AnniversaryDate = Date | SimpleHebrewDate | number;

/**
 * Normalizes any accepted form of an event date into a `SimpleHebrewDate`.
 *
 * When the caller passes an object (a `SimpleHebrewDate` or anything
 * structurally compatible with it, such as an `HDate`), this returns a
 * copy rather than the object itself: callers keep their original event
 * date around and reuse it across years, and the anniversary functions
 * are free to modify the value they get back from here.
 * @private
 */
function toSimpleHebrewDate(obj: AnniversaryDate): SimpleHebrewDate {
  if (isSimpleHebrewDate(obj)) {
    const hd = obj as SimpleHebrewDate;
    return {yy: hd.yy, mm: hd.mm, dd: hd.dd};
  } else if (isDate(obj)) {
    const abs = greg2abs(obj as Date);
    return abs2hebrew(abs);
  } else {
    // typeof obj === 'number'
    return abs2hebrew(obj as number);
  }
}

/**
 * Calculates yahrzeit and converts the result to a Gregorian `Date`.
 *
 * See {@link getYahrzeitHD} for a description of the algorithm.
 * @deprecated Use {@link yahrzeit} instead, which returns an `HDate`.
 *   Returning a Gregorian `Date` loses the Hebrew date that was actually
 *   computed and invites a needless conversion back again; call
 *   `.greg()` on the result if you really do want a `Date`.
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of death
 * @returns anniversary occurring in `hyear` as a Gregorian date, or
 *   `undefined` when `hyear` is on or before the year of death
 * @see {@link yahrzeit} to get the result as an `HDate`
 * @see {@link birthdayOrAnniversary} for birthdays and other
 *   non-yahrzeit anniversaries
 * @example
 * import {getYahrzeit} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
 * const anniversary = getYahrzeit(5780, dt); // '2/25/2020' == '30 Sh\'vat 5780'
 */
export function getYahrzeit(
  hyear: number,
  date: AnniversaryDate
): Date | undefined {
  const hd = getYahrzeitHD(hyear, date);
  if (!hd) {
    return hd;
  }
  return abs2greg(hebrew2abs(hd.yy, hd.mm, hd.dd));
}

/**
 * Calculates yahrzeit, the anniversary of a death, and returns it as a
 * `SimpleHebrewDate` (`{yy, mm, dd}`).
 * `hyear` must be after original `date` of death.
 * Returns `undefined` when requested year preceeds or is same as original year.
 *
 * Hebcal uses the algorithm defined in "Calendrical Calculations"
 * by Edward M. Reingold and Nachum Dershowitz.
 *
 * **This is not the same calculation as a birthday.** When the original
 * date does not exist in the target year, a yahrzeit falls *earlier* —
 * on the last day of the preceding month — because the anniversary
 * should not be observed later than the day itself. A birthday in the
 * same situation is *postponed* to the first of the following month.
 * See {@link getBirthdayHD} for the contrast.
 *
 * The two also differ in whether the original year is a legal `hyear`.
 * A yahrzeit is by definition an *anniversary* of a death, so the
 * earliest one that exists is the first: the day of the death itself is
 * not a yahrzeit, and a "zeroth" yahrzeit has no meaning to return.
 * `hyear` must therefore be strictly after the year of death, and this
 * function returns `undefined` otherwise. A birth date, by contrast, is
 * a real and meaningful day in its own right, so
 * {@link getBirthdayHD} accepts the year of birth and hands back the
 * original date.
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
 *
 * The `date` argument is never modified, so a single original date can be
 * reused to generate a run of years.
 * @see {@link yahrzeit} for the same result as an `HDate` instance
 * @example
 * import {getYahrzeitHD} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // 30 Adar I 5774
 * getYahrzeitHD(5780, dt); // {yy: 5780, mm: 11, dd: 30} (30 Sh'vat)
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of death
 * @returns anniversary occurring in `hyear`, or `undefined`
 *   when `hyear` is on or before the original year
 */
export function getYahrzeitHD(
  hyear: number,
  date: AnniversaryDate
): SimpleHebrewDate | undefined {
  let hDeath = toSimpleHebrewDate(date);
  if (hyear <= hDeath.yy) {
    // Hebrew year ${hyear} occurs on or before original date in ${hDeath.yy}
    return undefined;
  }

  if (
    hDeath.mm === CHESHVAN &&
    hDeath.dd === 30 &&
    !longCheshvan(hDeath.yy + 1)
  ) {
    // If it's Heshvan 30 it depends on the first anniversary;
    // if that was not Heshvan 30, use the day before Kislev 1.
    hDeath = abs2hebrew(hebrew2abs(hyear, KISLEV, 1) - 1);
  } else if (
    hDeath.mm === KISLEV &&
    hDeath.dd === 30 &&
    shortKislev(hDeath.yy + 1)
  ) {
    // If it's Kislev 30 it depends on the first anniversary;
    // if that was not Kislev 30, use the day before Teveth 1.
    hDeath = abs2hebrew(hebrew2abs(hyear, TEVET, 1) - 1);
  } else if (hDeath.mm === ADAR_II) {
    // If it's Adar II, use the same day in last month of year (Adar or Adar II).
    hDeath.mm = monthsInYear(hyear);
  } else if (hDeath.mm === ADAR_I && hDeath.dd === 30 && !isLeapYear(hyear)) {
    // If it's the 30th in Adar I and year is not a leap year
    // (so Adar has only 29 days), use the last day in Shevat.
    hDeath.dd = 30;
    hDeath.mm = SHVAT;
  }
  // In all other cases, use the normal anniversary of the date of death.

  // advance day to rosh chodesh if needed
  if (hDeath.mm === CHESHVAN && hDeath.dd === 30 && !longCheshvan(hyear)) {
    hDeath.mm = KISLEV;
    hDeath.dd = 1;
  } else if (hDeath.mm === KISLEV && hDeath.dd === 30 && shortKislev(hyear)) {
    hDeath.mm = TEVET;
    hDeath.dd = 1;
  }

  hDeath.yy = hyear;
  return hDeath;
}

/**
 * Calculates a birthday or anniversary (non-yahrzeit) and converts the
 * result to a Gregorian `Date`.
 *
 * See {@link getBirthdayHD} for a description of the algorithm.
 * @deprecated Use {@link birthdayOrAnniversary} instead, which returns
 *   an `HDate`. Returning a Gregorian `Date` loses the Hebrew date that
 *   was actually computed and invites a needless conversion back again;
 *   call `.greg()` on the result if you really do want a `Date`.
 * @example
 * import {getBirthdayOrAnniversary} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
 * const anniversary = getBirthdayOrAnniversary(5780, dt); // '3/26/2020' == '1 Nisan 5780'
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of the original event
 * @returns anniversary occurring in `hyear` as a Gregorian date, or
 *   `undefined` when `hyear` precedes the original year
 * @see {@link birthdayOrAnniversary} to get the result as an `HDate`
 * @see {@link yahrzeit} for anniversaries of a death
 */
export function getBirthdayOrAnniversary(
  hyear: number,
  date: AnniversaryDate
): Date | undefined {
  const hd = getBirthdayHD(hyear, date);
  if (!hd) {
    return hd;
  }
  return abs2greg(hebrew2abs(hd.yy, hd.mm, hd.dd));
}

/**
 * Calculates a birthday or anniversary (non-yahrzeit) and returns it as
 * a `SimpleHebrewDate` (`{yy, mm, dd}`).
 * `hyear` must be on or after original `date` of anniversary.
 * Returns `undefined` when requested year preceeds the original year.
 *
 * Hebcal uses the algorithm defined in "Calendrical Calculations"
 * by Edward M. Reingold and Nachum Dershowitz.
 *
 * **This is not the same calculation as a yahrzeit.** When the original
 * date is missing from the target year, a birthday is *postponed* to the
 * first of the following month, whereas a yahrzeit moves *earlier* to
 * the last day of the preceding month. Passing the same original date to
 * both functions can therefore return dates almost a month apart.
 *
 * Unlike {@link getYahrzeitHD}, `hyear` may equal the original year, in
 * which case the original date is returned unchanged. A birth date is a
 * meaningful day in its own right — it is the day the person was born,
 * not merely the zeroth anniversary of it. A death has no comparable
 * day: a yahrzeit only begins to exist on the first anniversary, which
 * is why {@link getYahrzeitHD} rejects the year of death.
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
 *
 * The `date` argument is never modified, so a single original date can be
 * reused to generate a run of years.
 * @see {@link birthdayOrAnniversary} for the same result as an `HDate` instance
 * @example
 * import {getBirthdayHD} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // 30 Adar I 5774
 * getBirthdayHD(5780, dt); // {yy: 5780, mm: 1, dd: 1} (1 Nisan)
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of the original event
 * @returns anniversary occurring in `hyear`, or `undefined`
 *   when `hyear` precedes the original year
 */
export function getBirthdayHD(
  hyear: number,
  date: AnniversaryDate
): SimpleHebrewDate | undefined {
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

  if ((month === ADAR_I && !isOrigLeap) || (month === ADAR_II && isOrigLeap)) {
    month = monthsInYear(hyear);
  } else if (month === CHESHVAN && day === 30 && !longCheshvan(hyear)) {
    month = KISLEV;
    day = 1;
  } else if (month === KISLEV && day === 30 && shortKislev(hyear)) {
    month = TEVET;
    day = 1;
  } else if (
    month === ADAR_I &&
    day === 30 &&
    isOrigLeap &&
    !isLeapYear(hyear)
  ) {
    month = NISAN;
    day = 1;
  }

  return {yy: hyear, mm: month, dd: day};
}
