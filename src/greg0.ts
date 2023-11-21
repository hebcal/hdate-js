/*
 * More minimal greg routines
 */

/** @private */
const lengths: number[] = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** @private */
const monthLengths: number[][] = [
  lengths,
  lengths.slice(),
];
monthLengths[1][2] = 29;

/**
 * @private
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
export function mod(x: number, y: number): number {
  return x - y * Math.floor(x / y);
}

/**
 * @private
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
function quotient(x: number, y: number): number {
  return Math.floor(x / y);
}

/**
 * Returns true if the Gregorian year is a leap year
 * @private
 * @param {number} year Gregorian year
 * @return {boolean}
 */
export function isLeapYear(year: number): boolean {
  return !(year % 4) && (!!(year % 100) || !(year % 400));
}

/**
 * Number of days in the Gregorian month for given year
 * @private
 * @param {number} month Gregorian month (1=January, 12=December)
 * @param {number} year Gregorian year
 * @return {number}
 */
export function daysInMonth(month: number, year: number): number {
  // 1 based months
  return monthLengths[+isLeapYear(year)][month];
}

/**
 * Returns true if the object is a Javascript Date
 * @private
 * @param {any} obj
 * @return {boolean}
 */
export function isDate(obj: any): boolean {
  return typeof obj === 'object' && Date.prototype.isPrototypeOf(obj);
}

/*
const ABS_14SEP1752 = 639797;
const ABS_2SEP1752 = 639785;
*/

/**
 * Converts Gregorian date to absolute R.D. (Rata Die) days
 * @private
 * @param {Date} date Gregorian date
 * @return {number}
 */
export function greg2abs(date: Date): number {
  if (!isDate(date)) {
    throw new TypeError(`Argument not a Date: ${date}`);
  }
  const abs = toFixed(date.getFullYear(), date.getMonth() + 1, date.getDate());
  /*
  if (abs < ABS_14SEP1752 && abs > ABS_2SEP1752) {
    throw new RangeError(`Invalid Date: ${date}`);
  }
  */
  return abs;
}

/**
 * @private
 * @param {number} abs - R.D. number of days
 * @return {number}
 */
function yearFromFixed(abs: number): number {
  const l0: number = abs - 1;
  const n400: number = quotient(l0, 146097);
  const d1: number = mod(l0, 146097);
  const n100: number = quotient(d1, 36524);
  const d2: number = mod(d1, 36524);
  const n4: number = quotient(d2, 1461);
  const d3: number = mod(d2, 1461);
  const n1: number = quotient(d3, 365);
  const year: number = 400 * n400 + 100 * n100 + 4 * n4 + n1;
  return n100 != 4 && n1 != 4 ? year + 1 : year;
}

/**
 * @private
 * @param {number} year
 * @param {number} month (1-12)
 * @param {number} day (1-31)
 * @return {number}
 */
function toFixed(year: number, month: number, day: number): number {
  const py: number = year - 1;
  return 365 * py +
    quotient(py, 4) -
    quotient(py, 100) +
    quotient(py, 400) +
    quotient((367 * month - 362), 12) +
    (month <= 2 ? 0 : (isLeapYear(year) ? -1 : -2)) +
    day;
}

/**
 * Converts from Rata Die (R.D. number) to Gregorian date.
 * See the footnote on page 384 of ``Calendrical Calculations, Part II:
 * Three Historical Calendars'' by E. M. Reingold,  N. Dershowitz, and S. M.
 * Clamen, Software--Practice and Experience, Volume 23, Number 4
 * (April, 1993), pages 383-404 for an explanation.
 * @private
 * @param {number} abs - R.D. number of days
 * @return {Date}
 */
export function abs2greg(abs: number): Date {
  if (typeof abs !== 'number') {
    throw new TypeError(`Argument not a Number: ${abs}`);
  }
  abs = Math.trunc(abs);
  /*
  if (abs < ABS_14SEP1752 && abs > ABS_2SEP1752) {
    throw new RangeError(`Invalid Date: ${abs}`);
  }
  */
  const year: number = yearFromFixed(abs);
  const priorDays: number = abs - toFixed(year, 1, 1);
  const correction: number = abs < toFixed(year, 3, 1) ? 0 : (isLeapYear(year) ? 1 : 2);
  const month: number = quotient((12 * (priorDays + correction) + 373), 367);
  const day: number = abs - toFixed(year, month, 1) + 1;
  const dt: Date = new Date(year, month - 1, day);
  if (year < 100 && year >= 0) {
    dt.setFullYear(year);
  }
  return dt;
}
