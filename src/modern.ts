import {SimpleHebrewDate, hd2abs, months} from './hdate';

const SUN = 0;
const TUE = 2;
const FRI = 5;
const SAT = 6;

const NISAN = months.NISAN;

/**
 * Yom HaShoah first observed in 1951.
 * When the actual date of Yom Hashoah falls on a Friday, the
 * state of Israel observes Yom Hashoah on the preceding
 * Thursday. When it falls on a Sunday, Yom Hashoah is observed
 * on the following Monday.
 * http://www.ushmm.org/remembrance/dor/calendar/
 */
export function dateYomHaShoah(year: number): SimpleHebrewDate | null {
  if (year < 5711) {
    return null;
  }
  let nisan27dt = {dd: 27, mm: NISAN, yy: year};
  const dow = hd2abs(nisan27dt) % 7;
  if (dow === FRI) {
    nisan27dt = {dd: 26, mm: NISAN, yy: year};
  } else if (dow === SUN) {
    nisan27dt = {dd: 28, mm: NISAN, yy: year};
  }
  return nisan27dt;
}

/**
 * Yom HaAtzma'ut only celebrated after 1948
 */
export function dateYomHaZikaron(year: number): SimpleHebrewDate | null {
  if (year < 5708) {
    return null;
  }
  let day;
  const pesach = {dd: 15, mm: NISAN, yy: year};
  const pdow = hd2abs(pesach) % 7;
  if (pdow === SUN) {
    day = 2;
  } else if (pdow === SAT) {
    day = 3;
  } else if (year < 5764) {
    day = 4;
  } else if (pdow === TUE) {
    day = 5;
  } else {
    day = 4;
  }
  return {dd: day, mm: months.IYYAR, yy: year};
}
