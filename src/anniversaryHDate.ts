import {AnniversaryDate, getBirthdayHD, getYahrzeitHD} from './anniversary';
import {HDate} from './hdate';

/**
 * Calculates yahrzeit, the anniversary of a death, and returns it as an
 * {@link HDate}.
 *
 * Same calculation as {@link getYahrzeitHD}, but the result comes back
 * as an `HDate` instance rather than a plain `{yy, mm, dd}` object, so it
 * can be rendered (`render`, `renderGematriya`) or used for further
 * Hebrew calendar arithmetic directly.
 *
 * Note that a yahrzeit is *not* calculated the same way as a birthday:
 * when the original date is missing from `hyear` it moves earlier rather
 * than later. See {@link getYahrzeitHD} for the full algorithm and its
 * edge cases (Marcheshvan 30, Kislev 30, Adar I / Adar II).
 *
 * `hyear` must be strictly after the year of death. A yahrzeit is an
 * *anniversary* of a death, so the first one is the earliest that
 * exists — the day of the death itself is not a yahrzeit, and there is
 * no meaningful "zeroth" one to return. This is the one place where
 * {@link birthdayOrAnniversary} legitimately accepts a year that this
 * function rejects: a birth date is a real day in its own right.
 *
 * The `date` argument is never modified, so a single original date can be
 * reused to generate a run of years.
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of death
 * @returns anniversary occurring in `hyear`, or `undefined` when `hyear`
 *   is on or before the year of death
 * @see {@link getYahrzeitHD}
 * @see {@link birthdayOrAnniversary}
 * @example
 * import {yahrzeit} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
 * yahrzeit(5780, dt)?.toString();          // '30 Sh\'vat 5780'
 * yahrzeit(5780, dt)?.renderGematriya();   // 'ל׳ שְׁבָט תש״פ'
 * yahrzeit(5774, dt);                      // undefined (year of death)
 */
export function yahrzeit(
  hyear: number,
  date: AnniversaryDate
): HDate | undefined {
  const hd = getYahrzeitHD(hyear, date);
  return hd && new HDate(hd);
}

/**
 * Calculates a birthday or anniversary (non-yahrzeit) and returns it as
 * an {@link HDate}.
 *
 * Same calculation as {@link getBirthdayHD}, but the result comes back
 * as an `HDate` instance rather than a plain `{yy, mm, dd}` object, so it
 * can be rendered (`render`, `renderGematriya`) or used for further
 * Hebrew calendar arithmetic directly.
 *
 * Note that a birthday is *not* calculated the same way as a yahrzeit:
 * when the original date is missing from `hyear` it is postponed rather
 * than moved earlier. See {@link getBirthdayHD} for the full algorithm
 * and its edge cases.
 *
 * `hyear` may be the original year, in which case the original date is
 * returned unchanged: someone's birth date is a meaningful day in its
 * own right, not merely the zeroth anniversary of itself. A death has no
 * equivalent — a yahrzeit begins at the first anniversary — which is why
 * {@link yahrzeit} rejects the year of death.
 *
 * The `date` argument is never modified, so a single original date can be
 * reused to generate a run of years.
 * @param hyear Hebrew year in which to find the anniversary
 * @param date Gregorian or Hebrew date of the original event
 * @returns anniversary occurring in `hyear`, or `undefined` when `hyear`
 *   precedes the original year
 * @see {@link getBirthdayHD}
 * @see {@link yahrzeit}
 * @example
 * import {birthdayOrAnniversary} from '@hebcal/hdate';
 * const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
 * birthdayOrAnniversary(5780, dt)?.toString(); // '1 Nisan 5780'
 * birthdayOrAnniversary(5774, dt)?.toString(); // '30 Adar I 5774'
 * birthdayOrAnniversary(5773, dt);             // undefined
 */
export function birthdayOrAnniversary(
  hyear: number,
  date: AnniversaryDate
): HDate | undefined {
  const hd = getBirthdayHD(hyear, date);
  return hd && new HDate(hd);
}
