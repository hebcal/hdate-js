/* eslint-disable @typescript-eslint/no-namespace */
import {
  abs2greg,
  daysInGregMonth,
  greg2abs,
  isDate,
  isGregLeapYear,
} from './greg';

/**
 * Gregorian date helper functions.
 *
 * These are aliases retained for backwards compatibility. Each member
 * simply forwards to the identically-behaving top-level function, which
 * is the preferred form in new code because it tree-shakes cleanly:
 *
 * | Namespace | Top-level equivalent |
 * | --- | --- |
 * | `greg.abs2greg` | {@link abs2greg} |
 * | `greg.daysInMonth` | {@link daysInGregMonth} |
 * | `greg.greg2abs` | {@link greg2abs} |
 * | `greg.isDate` | {@link isDate} |
 * | `greg.isLeapYear` | {@link isGregLeapYear} |
 * @example
 * import {greg} from '@hebcal/hdate';
 * greg.greg2abs(new Date(2008, 10, 13)); // 733359
 * greg.isLeapYear(2024);                 // true
 */
export namespace greg {
  /**
   * Converts from Rata Die (R.D. number) to Gregorian date.
   * Alias for the top-level {@link abs2greg}.
   */
  export declare function abs2greg(abs: number): Date;
  /**
   * Number of days in the Gregorian month for given year.
   * Alias for the top-level {@link daysInGregMonth}.
   * @param month Gregorian month (1=January, 12=December)
   * @param year Gregorian year
   */
  export declare function daysInMonth(month: number, year: number): number;
  /**
   * Converts Gregorian date to absolute R.D. (Rata Die) days.
   * Alias for the top-level {@link greg2abs}.
   */
  export declare function greg2abs(date: Date): number;
  /**
   * Returns true if the object is a Javascript `Date`.
   * Alias for the top-level {@link isDate}.
   */
  export declare function isDate(obj: unknown): boolean;
  /**
   * Returns true if the Gregorian year is a leap year.
   * Alias for the top-level {@link isGregLeapYear}.
   * @param year Gregorian year
   */
  export declare function isLeapYear(year: number): boolean;
}

greg.abs2greg = abs2greg;
greg.daysInMonth = daysInGregMonth;
greg.greg2abs = greg2abs;
greg.isDate = isDate;
greg.isLeapYear = isGregLeapYear;
