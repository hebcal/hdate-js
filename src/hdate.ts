/*
    Hebcal - A Jewish Calendar Generator
    Copyright (c) 1994-2020 Danny Sadinoff
    Portions copyright Eyal Schachter and Michael J. Radwin

    https://github.com/hebcal/hebcal-es6

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {
  SimpleHebrewDate,
  abs2hebrew, daysInMonth, daysInYear,
  getMonthName,
  hebrew2abs, isLeapYear, longCheshvan,
  monthFromName,
  months,
  monthsInYear, shortKislev,
} from './hdate-base';
import {greg} from './greg';
import {gematriya, gematriyaStrToNum,} from './gematriya';  
import {Locale} from './locale';

// eslint-disable-next-line require-jsdoc
function mod(x: number, y: number): number {
  return x - y * Math.floor(x / y);
}

function isSimpleHebrewDate(obj: any): obj is SimpleHebrewDate {
  return (obj as SimpleHebrewDate).yy !== undefined;
}

const UNITS_DAY = 'day';
const UNITS_WEEK = 'week';
const UNITS_MONTH = 'month';
const UNITS_YEAR = 'year';

/** Represents a Hebrew date */
export class HDate {
  /** Hebrew year, 1-9999 */
  yy: number;
  /** Hebrew month of year (1=NISAN, 7=TISHREI) */
  mm: number;
  /** Hebrew day within the month (1-30) */
  dd: number;
  /** absolute Rata Die (R.D.) days */
  rd?: number;

  /**
   * Create a Hebrew date. There are 3 basic forms for the `HDate()` constructor.
   *
   * 1. No parameters - represents the current Hebrew date at time of instantiation
   * 2. One parameter
   *    * `Date` - represents the Hebrew date corresponding to the Gregorian date using
   *       local time. Hours, minutes, seconds and milliseconds are ignored.
   *    * `HDate` - clones a copy of the given Hebrew date
   *    * `number` - Converts absolute R.D. days to Hebrew date.
   *       R.D. 1 == the imaginary date January 1, 1 (Gregorian)
   * 3. Three parameters: Hebrew day, Hebrew month, Hebrew year. Hebrew day should
   *    be a number between 1-30, Hebrew month can be a number or string, and
   *    Hebrew year is always a number.
   * @example
   * import {HDate, months} from '@hebcal/hdate';
   *
   * const hd1 = new HDate();
   * const hd2 = new HDate(new Date(2008, 10, 13));
   * const hd3 = new HDate(15, 'Cheshvan', 5769);
   * const hd4 = new HDate(15, months.CHESHVAN, 5769);
   * const hd5 = new HDate(733359); // ==> 15 Cheshvan 5769
   * const monthName = 'אייר';
   * const hd6 = new HDate(5, monthName, 5773);
   * @param [day] - Day of month (1-30) if a `number`.
   *   If a `Date` is specified, represents the Hebrew date corresponding to the
   *   Gregorian date using local time.
   *   If an `HDate` is specified, clones a copy of the given Hebrew date.
   * @param [month] - Hebrew month of year (1=NISAN, 7=TISHREI)
   * @param [year] - Hebrew year
   */
  constructor(day?: number|Date|HDate|SimpleHebrewDate|undefined, month?: number|string, year?: number) {
    if (arguments.length === 2 || arguments.length > 3) {
      throw new TypeError('HDate constructor requires 0, 1 or 3 arguments');
    }
    if (arguments.length === 3) {
      // Hebrew day, Hebrew month, Hebrew year
      this.dd = this.mm = 1;
      const yy: number = typeof year === 'string' ? parseInt(year, 10) : year as number;
      if (isNaN(yy)) {
        throw new TypeError(`HDate called with bad year argument: ${year}`);
      }
      this.yy = yy;
      setMonth(this, month as string | number); // will throw if we can't parse
      const dd: number = typeof day === 'string' ? parseInt(day, 10) : day as number;
      if (isNaN(dd)) {
        throw new TypeError(`HDate called with bad day argument: ${day}`);
      }
      setDate(this, dd);
    } else {
      // 0 arguments
      if (typeof day === 'undefined' || day === null) {
        day = new Date();
      }
      // 1 argument
      const abs0 = (typeof day === 'number' && !isNaN(day)) ? day :
        greg.isDate(day) ? greg.greg2abs(day as Date) :
        isSimpleHebrewDate(day) ? day : null;
      if (abs0 === null) {
        throw new TypeError(`HDate called with bad argument: ${day}`);
      }
      const isNumber = typeof abs0 === 'number';
      const d: SimpleHebrewDate = isNumber ? abs2hebrew(abs0) : abs0;
      this.yy = d.yy;
      this.mm = d.mm;
      this.dd = d.dd;
      if (isNumber) {
        this.rd = abs0;
      }
    }
  }

  /**
   * Gets the Hebrew year of this Hebrew date
   */
  getFullYear(): number {
    return this.yy;
  }

  /**
   * Tests if this date occurs during a leap year
   */
  isLeapYear(): boolean {
    return isLeapYear(this.yy);
  }

  /**
   * Gets the Hebrew month (1=NISAN, 7=TISHREI) of this Hebrew date
   */
  getMonth(): number {
    return this.mm;
  }

  /**
   * The Tishrei-based month of the date. 1 is Tishrei, 7 is Nisan, 13 is Elul in a leap year
   */
  getTishreiMonth(): number {
    const nummonths = monthsInYear(this.getFullYear());
    return (this.getMonth() + nummonths - 6) % nummonths || nummonths;
  }

  /**
   * Number of days in the month of this Hebrew date
   */
  daysInMonth(): number {
    return daysInMonth(this.getMonth(), this.getFullYear());
  }

  /**
   * Gets the day within the month (1-30)
   */
  getDate(): number {
    return this.dd;
  }

  /**
   * Gets the day of the week. 0=Sunday, 6=Saturday
   */
  getDay(): number {
    return mod(this.abs(), 7);
  }

  /**
   * Converts to Gregorian date
   */
  greg(): Date {
    return greg.abs2greg(this.abs());
  }

  /**
   * Returns R.D. (Rata Die) fixed days.
   * R.D. 1 == Monday, January 1, 1 (Gregorian)
   * Note also that R.D. = Julian Date − 1,721,424.5
   * https://en.wikipedia.org/wiki/Rata_Die#Dershowitz_and_Reingold
   */
  abs(): number {
    if (typeof this.rd !== 'number') {
      this.rd = hebrew2abs(this.yy, this.mm, this.dd);
    }
    return this.rd;
  }

  /**
   * Converts Hebrew date to R.D. (Rata Die) fixed days.
   * R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
   * Calendar.
   * @param year Hebrew year
   * @param month Hebrew month
   * @param day Hebrew date (1-30)
   */
  static hebrew2abs(year: number, month: number, day: number): number {
    return hebrew2abs(year, month, day);
  }

  /**
   * Returns a transliterated Hebrew month name, e.g. `'Elul'` or `'Cheshvan'`.
   */
  getMonthName(): string {
    return getMonthName(this.getMonth(), this.getFullYear());
  }

  /**
   * Renders this Hebrew date as a translated or transliterated string,
   * including ordinal e.g. `'15th of Cheshvan, 5769'`.
   * @example
   * import {HDate, months} from '@hebcal/hdate';
   *
   * const hd = new HDate(15, months.CHESHVAN, 5769);
   * console.log(hd.render('en')); // '15th of Cheshvan, 5769'
   * console.log(hd.render('he')); // '15 חֶשְׁוָן, 5769'
   * @param [locale] Optional locale name (defaults to active locale).
   * @param [showYear=true] Display year (defaults to true).
   */
  render(locale?: string, showYear: boolean=true): string {
    const locale0 = locale || Locale.getLocaleName();
    const day = this.getDate();
    const monthName0 = Locale.gettext(this.getMonthName(), locale0);
    const monthName = monthName0.replace(/'/g, '’');
    const nth = Locale.ordinal(day, locale0);
    const dayOf = getDayOfTranslation(locale0);
    const dateStr = `${nth}${dayOf} ${monthName}`;
    if (showYear) {
      const fullYear = this.getFullYear();
      return `${dateStr}, ${fullYear}`;
    } else {
      return dateStr;
    }
  }

  /**
   * Renders this Hebrew date in Hebrew gematriya, regardless of locale.
   * @example
   * import {HDate, months} from '@hebcal/hdate';
   * const hd = new HDate(15, months.CHESHVAN, 5769);
   * console.log(hd.renderGematriya()); // 'ט״ו חֶשְׁוָן תשס״ט'
   */
  renderGematriya(suppressNikud: boolean=false): string {
    const d = this.getDate();
    const locale = suppressNikud ? 'he-x-NoNikud' : 'he';
    const m = Locale.gettext(this.getMonthName(), locale);
    const y = this.getFullYear();
    return gematriya(d) + ' ' + m + ' ' + gematriya(y);
  }

  /**
   * Returns an `HDate` representing the a dayNumber before the current date.
   * Sunday=0, Saturday=6
   * @example
   * new HDate(new Date('Wednesday February 19, 2014')).before(6).greg() // Sat Feb 15 2014
   * @param dow day of week
   */
  before(dow: number): HDate {
    return onOrBefore(dow, this, -1);
  }

  /**
   * Returns an `HDate` representing the a dayNumber on or before the current date.
   * Sunday=0, Saturday=6
   * @example
   * new HDate(new Date('Wednesday February 19, 2014')).onOrBefore(6).greg() // Sat Feb 15 2014
   * new HDate(new Date('Saturday February 22, 2014')).onOrBefore(6).greg() // Sat Feb 22 2014
   * new HDate(new Date('Sunday February 23, 2014')).onOrBefore(6).greg() // Sat Feb 22 2014
   * @param dow day of week
   */
  onOrBefore(dow: number): HDate {
    return onOrBefore(dow, this, 0);
  }

  /**
   * Returns an `HDate` representing the nearest dayNumber to the current date
   * Sunday=0, Saturday=6
   * @example
   * new HDate(new Date('Wednesday February 19, 2014')).nearest(6).greg() // Sat Feb 22 2014
   * new HDate(new Date('Tuesday February 18, 2014')).nearest(6).greg() // Sat Feb 15 2014
   * @param dow day of week
   */
  nearest(dow: number): HDate {
    return onOrBefore(dow, this, 3);
  }

  /**
   * Returns an `HDate` representing the a dayNumber on or after the current date.
   * Sunday=0, Saturday=6
   * @example
   * new HDate(new Date('Wednesday February 19, 2014')).onOrAfter(6).greg() // Sat Feb 22 2014
   * new HDate(new Date('Saturday February 22, 2014')).onOrAfter(6).greg() // Sat Feb 22 2014
   * new HDate(new Date('Sunday February 23, 2014')).onOrAfter(6).greg() // Sat Mar 01 2014
   * @param dow day of week
   */
  onOrAfter(dow: number): HDate {
    return onOrBefore(dow, this, 6);
  }

  /**
   * Returns an `HDate` representing the a dayNumber after the current date.
   * Sunday=0, Saturday=6
   * @example
   * new HDate(new Date('Wednesday February 19, 2014')).after(6).greg() // Sat Feb 22 2014
   * new HDate(new Date('Saturday February 22, 2014')).after(6).greg() // Sat Mar 01 2014
   * new HDate(new Date('Sunday February 23, 2014')).after(6).greg() // Sat Mar 01 2014
   * @param dow day of week
   */
  after(dow: number): HDate {
    return onOrBefore(dow, this, 7);
  }

  /**
   * Returns the next Hebrew date
   */
  next(): HDate {
    return new HDate(this.abs() + 1);
  }

  /**
   * Returns the previous Hebrew date
   */
  prev(): HDate {
    return new HDate(this.abs() - 1);
  }

  /**
   * Returns a cloned `HDate` object with a specified amount of time added
   *
   * Units are case insensitive, and support plural and short forms.
   * Note, short forms are case sensitive.
   *
   * | Unit | Shorthand | Description
   * | --- | --- | --- |
   * | `day` | `d` | days |
   * | `week` | `w` | weeks |
   * | `month` | `M` | months |
   * | `year` | `y` | years |
   */
  add(amount: number | string, units: string='d'): HDate {
    amount = typeof amount === 'string' ? parseInt(amount, 10) : amount as number;
    if (!amount) {
      return new HDate(this);
    }
    units = standardizeUnits(units);
    if (units === UNITS_DAY) {
      return new HDate(this.abs() + amount);
    } else if (units === UNITS_WEEK) {
      return new HDate(this.abs() + (7 * amount));
    } else if (units === UNITS_YEAR) {
      return new HDate(this.getDate(), this.getMonth(), this.getFullYear() + amount);
    } else if (units === UNITS_MONTH) {
      let hd = new HDate(this);
      const sign = amount > 0 ? 1 : -1;
      amount = Math.abs(amount);
      for (let i = 0; i < amount; i++) {
        hd = new HDate(hd.abs() + (sign * hd.daysInMonth()));
      }
      return hd;
    } else {
      throw new TypeError(`Invalid units '${units}'`);
    }
  }

  /**
   * Returns a cloned `HDate` object with a specified amount of time subracted
   *
   * Units are case insensitive, and support plural and short forms.
   * Note, short forms are case sensitive.
   *
   * | Unit | Shorthand | Description
   * | --- | --- | --- |
   * | `day` | `d` | days |
   * | `week` | `w` | weeks |
   * | `month` | `M` | months |
   * | `year` | `y` | years |
   * @example
   * import {HDate, months} from '@hebcal/hdate';
   *
   * const hd1 = new HDate(15, months.CHESHVAN, 5769);
   * const hd2 = hd1.add(1, 'weeks'); // 7 Kislev 5769
   * const hd3 = hd1.add(-3, 'M'); // 30 Av 5768
   */
  subtract(amount: number, units: string='d'): HDate {
    return this.add(amount * -1, units);
  }

  /**
   * Returns the difference in days between the two given HDates.
   *
   * The result is positive if `this` date is comes chronologically
   * after the `other` date, and negative
   * if the order of the two dates is reversed.
   *
   * The result is zero if the two dates are identical.
   * @example
   * import {HDate, months} from '@hebcal/hdate';
   *
   * const hd1 = new HDate(25, months.KISLEV, 5770);
   * const hd2 = new HDate(15, months.CHESHVAN, 5769);
   * const days = hd1.deltaDays(hd2); // 394
   * @param other Hebrew date to compare
   */
  deltaDays(other: HDate): number {
    if (!HDate.isHDate(other)) {
      throw new TypeError(`Bad argument: ${other}`);
    }
    return this.abs() - other.abs();
  }

  /**
   * Compares this date to another date, returning `true` if the dates match.
   * @param other Hebrew date to compare
   */
  isSameDate(other: HDate): boolean {
    if (HDate.isHDate(other)) {
      return this.yy === other.yy &&
        this.mm === other.mm &&
        this.dd === other.dd;
    }
    return false;
  }

  toString(): string {
    const day = this.getDate();
    const fullYear = this.getFullYear();
    const monthName = this.getMonthName();
    return `${day} ${monthName} ${fullYear}`;
  }

  /**
   * Returns true if Hebrew year is a leap year
   * @param year Hebrew year
   */
  static isLeapYear(year: number): boolean {
    return isLeapYear(year);
  }

  /**
   * Number of months in this Hebrew year (either 12 or 13 depending on leap year)
   * @param year Hebrew year
   */
  static monthsInYear(year: number): number {
    return monthsInYear(year);
  }

  /**
   * Number of days in Hebrew month in a given year (29 or 30)
   * @param month Hebrew month (e.g. months.TISHREI)
   * @param year Hebrew year
   */
  static daysInMonth(month: number, year: number): number {
    return daysInMonth(month, year);
  }

  /**
   * Returns a transliterated string name of Hebrew month in year,
   * for example 'Elul' or 'Cheshvan'.
   * @param month Hebrew month (e.g. months.TISHREI)
   * @param year Hebrew year
   */
  static getMonthName(month: number, year: number): string {
    return getMonthName(month, year);
  }

  /**
   * Returns the Hebrew month number (NISAN=1, TISHREI=7)
   * @param month A number, or Hebrew month name string
   */
  static monthNum(month: number|string): number {
    if (typeof month === 'number') {
      if (isNaN(month) || month > 14) {
        throw new RangeError(`Invalid month number: ${month}`);
      }
      return month;
    }
    return month.charCodeAt(0) >= 48 && month.charCodeAt(0) <= 57 ? /* number */
      parseInt(month, 10) :
      HDate.monthFromName(month);
  }

  /**
   * Number of days in the hebrew YEAR
   * @param year Hebrew year
   */
  static daysInYear(year: number): number {
    return daysInYear(year);
  }

  /**
   * true if Cheshvan is long in Hebrew year
   * @param year Hebrew year
   */
  static longCheshvan(year: number): boolean {
    return longCheshvan(year);
  }

  /**
   * true if Kislev is short in Hebrew year
   * @param year Hebrew year
   */
  static shortKislev(year: number): boolean {
    return shortKislev(year);
  }

  /**
   * Converts Hebrew month string name to numeric
   */
  static monthFromName(monthName: string|number): number {
    if (typeof monthName === 'number') {
      if (isNaN(monthName) || monthName < 1 || monthName > 14) {
        throw new RangeError(`Invalid month name: ${monthName}`);
      }
      return monthName;
    }
    const name = Locale.hebrewStripNikkud(monthName);
    return monthFromName(name);
  }

  /**
   * Note: Applying this function to d+6 gives us the DAYNAME on or after an
   * absolute day d. Similarly, applying it to d+3 gives the DAYNAME nearest to
   * absolute date d, applying it to d-1 gives the DAYNAME previous to absolute
   * date d, and applying it to d+7 gives the DAYNAME following absolute date d.
   */
  static dayOnOrBefore(dayOfWeek: number, absdate: number): number {
    return absdate - ((absdate - dayOfWeek) % 7);
  }

  /**
   * Tests if the object is an instance of `HDate`
   */
  static isHDate(obj: any): boolean {
    return obj !== null && typeof obj === 'object' &&
      typeof obj.yy === 'number' &&
      typeof obj.mm === 'number' &&
      typeof obj.dd === 'number' &&
      typeof obj.greg === 'function' &&
      typeof obj.abs === 'function';
  }

  /**
   * Construct a new instance of `HDate` from a Gematriya-formatted string
   * @example
   *  HDate.fromGematriyaString('כ״ז בְּתַמּוּז תשפ״ג') // 27 Tamuz 5783
   *  HDate.fromGematriyaString('כ׳ סיון תש״ד') // 20 Sivan 5704
   *  HDate.fromGematriyaString('ה׳ אִיָיר תש״ח') // 5 Iyyar 5708
   */
  static fromGematriyaString(str: string, currentThousands: number=5000): HDate {
    const parts = str.split(' ').filter((x) => x.length !== 0);
    const numParts = parts.length;
    if (numParts !== 3 && numParts !== 4) {
      throw new RangeError(`Unable to parse gematriya string: "${str}"`);
    }
    const day = gematriyaStrToNum(parts[0]);
    const monthStr = numParts === 3 ? parts[1] : parts[1] + ' ' + parts[2];
    const month = HDate.monthFromName(monthStr);
    const yearStr = numParts === 3 ? parts[2] : parts[3];
    let year = gematriyaStrToNum(yearStr);
    if (year < 1000) {
      year += currentThousands;
    }
    return new HDate(day, month, year);
  }
}

function standardizeUnits(units: string): string {
  switch (units) {
    case 'd': return UNITS_DAY;
    case 'w': return UNITS_WEEK;
    case 'M': return UNITS_MONTH;
    case 'y': return UNITS_YEAR; 
  }
  const str = String(units || '').toLowerCase().replace(/s$/, '');
  switch (str) {
    case UNITS_DAY:
    case UNITS_WEEK:
    case UNITS_MONTH:
    case UNITS_YEAR:
      return str;
  }
  throw new TypeError(`Invalid units '${units}'`);
}

function getDayOfTranslation(locale: string): string {
  switch (locale) {
    case 'en':
    case 's':
    case 'a':
    case 'ashkenazi':
      return ' of';
    default:
      break;
  }
  const ofStr = Locale.lookupTranslation('of', locale);
  if (ofStr) {
    return ' ' + ofStr;
  }
  if (locale.startsWith('ashkenazi')) {
    return ' of';
  }
  return '';
}

/**
 * Sets the day of the month of the date. Returns the object it was called upon
 * @private
 * @param month A number, or Hebrew month name string
 */
function setMonth(hd: HDate, month: number | string): HDate {
  hd.mm = HDate.monthNum(month);
  fix(hd);
  return hd;
}

function setDate(hd: HDate, date: number): HDate {
  hd.dd = date;
  fix(hd);
  return hd;
}

function fix(hd: HDate) {
  fixMonth(hd);
  fixDate(hd);
}

function fixDate(hd: HDate) {
  if (hd.dd < 1) {
    if (hd.mm === months.TISHREI) {
      hd.yy -= 1;
    }
    hd.dd += daysInMonth(hd.mm, hd.yy);
    hd.mm -= 1;
    fix(hd);
  }
  if (hd.dd > daysInMonth(hd.mm, hd.yy)) {
    if (hd.mm === months.ELUL) {
      hd.yy += 1;
    }
    hd.dd -= daysInMonth(hd.mm, hd.yy);
    if (hd.mm === monthsInYear(hd.yy)) {
      hd.mm = 1; // rollover to NISAN
    } else {
      hd.mm += 1;
    }
    fix(hd);
  }
  fixMonth(hd);
}

function fixMonth(hd: HDate) {
  if (hd.mm === months.ADAR_II && !hd.isLeapYear()) {
    hd.mm -= 1; // to Adar I
    fix(hd);
  } else if (hd.mm < 1) {
    hd.mm += monthsInYear(hd.yy);
    hd.yy -= 1;
    fix(hd);
  } else if (hd.mm > monthsInYear(hd.yy)) {
    hd.mm -= monthsInYear(hd.yy);
    hd.yy += 1;
    fix(hd);
  }
  delete hd.rd;
}

function onOrBefore(day: number, t: HDate, offset: number): HDate {
  return new HDate(HDate.dayOnOrBefore(day, t.abs() + offset));
}
