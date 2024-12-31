/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
import {
  abs2greg,
  daysInGregMonth,
  greg2abs,
  isDate,
  isGregLeapYear,
} from './greg';

/**
 * Gregorian date helper functions
 */
export namespace greg {
  export declare function abs2greg(abs: number): Date;
  export declare function daysInMonth(month: number, year: number): number;
  export declare function greg2abs(date: Date): number;
  export declare function isDate(obj: unknown): boolean;
  export declare function isLeapYear(year: number): boolean;
}

greg.abs2greg = abs2greg;
greg.daysInMonth = daysInGregMonth;
greg.greg2abs = greg2abs;
greg.isDate = isDate;
greg.isLeapYear = isGregLeapYear;
