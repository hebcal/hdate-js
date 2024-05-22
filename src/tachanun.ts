import {
  SimpleHebrewDate,
  months,
  hd2abs,
  abs2hebrew,
  isLeapYear,
  monthsInYear,
  daysInMonth,
} from './hdate';
import {dateYomHaZikaron} from './modern';

function range(start: number, end: number): number[] {
  const arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
}

const NONE: TachanunResult = {
  shacharit: false,
  mincha: false,
  allCongs: false,
};

export type TachanunResult = {
  /** Tachanun is said at Shacharit */
  shacharit: boolean;
  /** Tachanun is said at Mincha */
  mincha: boolean;
  /** All congregations say Tachanun on the day */
  allCongs: boolean;
};

export function tachanun(hdate: SimpleHebrewDate, il: boolean): TachanunResult {
  return tachanun0(hdate, il, true);
}

function tachanun0(
  hdate: SimpleHebrewDate,
  il: boolean,
  checkNext: boolean
): TachanunResult {
  const year = hdate.yy;
  const dates = tachanunYear(year, il);
  const abs = hd2abs(hdate);
  if (dates.none.indexOf(abs) > -1) {
    return NONE;
  }
  const dow = abs % 7;
  const ret: TachanunResult = {
    shacharit: false,
    mincha: false,
    allCongs: false,
  };
  if (dates.some.indexOf(abs) === -1) {
    ret.allCongs = true;
  }
  if (dow !== 6) {
    ret.shacharit = true;
  }
  const tomorrow = abs + 1;
  if (checkNext && dates.yesPrev.indexOf(tomorrow) === -1) {
    const tmp = tachanun0(abs2hebrew(tomorrow), il, false);
    ret.mincha = tmp.shacharit;
  } else {
    ret.mincha = dow !== 5;
  }
  if (ret.allCongs && !ret.mincha && !ret.shacharit) {
    return NONE;
  }
  return ret;
}

function simpleHD(dd: number, mm: number, yy: number): SimpleHebrewDate {
  return {yy, mm, dd};
}

function tachanunYear(year: number, il: boolean): any {
  const leap = isLeapYear(year);
  const miy = monthsInYear(year);
  let av9dt = simpleHD(9, months.AV, year);
  const av9abs = hd2abs(av9dt);
  if (av9abs % 7 === 6) {
    av9dt = abs2hebrew(av9abs + 1);
  }
  let shushPurim = simpleHD(15, months.ADAR_II, year);
  const shushPurimAbs = hd2abs(shushPurim);
  if (shushPurimAbs % 7 === 6) {
    shushPurim = abs2hebrew(shushPurimAbs + 1);
  }
  const empty: SimpleHebrewDate[] = [];
  const none: SimpleHebrewDate[] = empty.concat(
    // Rosh Chodesh - 1st of every month. Also includes RH day 1 (1 Tishrei)
    range(1, miy).map(month => simpleHD(1, month, year)),
    // Rosh Chodesh - 30th of months that have one
    range(1, miy)
      .filter(month => daysInMonth(month, year) === 30)
      .map(month => simpleHD(30, month, year)),
    simpleHD(2, months.TISHREI, year), // Rosh Hashana II
    // entire month of Nisan
    range(1, daysInMonth(months.NISAN, year)).map(mday =>
      simpleHD(mday, months.NISAN, year)
    ),
    simpleHD(18, months.IYYAR, year), // Lag BaOmer
    // Rosh Chodesh Sivan thru Isru Chag
    range(1, 8 - (il ? 1 : 0)).map(mday => simpleHD(mday, months.SIVAN, year)),
    av9dt, // Tisha B'Av
    simpleHD(15, months.AV, year), // Tu B'Av
    simpleHD(29, months.ELUL, year), // Erev Rosh Hashanah
    // Erev Yom Kippur thru Isru Chag
    range(9, 24 - (il ? 1 : 0)).map(mday =>
      simpleHD(mday, months.TISHREI, year)
    ),
    // Chanukah
    range(25, 33).map(mday => simpleHD(mday, months.KISLEV, year)),
    simpleHD(15, months.SHVAT, year), // Tu BiShvat
    simpleHD(14, months.ADAR_II, year), // Purim
    shushPurim,
    leap ? simpleHD(14, months.ADAR_I, year) : [] // Purim Katan
  );
  const some: SimpleHebrewDate[] = empty.concat(
    // Until 14 Sivan
    range(1, 13).map(mday => simpleHD(mday, months.SIVAN, year)),
    // Until after Rosh Chodesh Cheshvan
    range(20, 31).map(mday => simpleHD(mday, months.TISHREI, year)),
    simpleHD(14, months.IYYAR, year), // Pesach Sheini
    // Yom Yerushalayim
    year >= 5727 ? simpleHD(28, months.IYYAR, year) : []
  );
  // Yom HaAtzma'ut, which changes based on day of week
  const yomHaZikaron = dateYomHaZikaron(year);
  if (yomHaZikaron !== null) {
    some.push(abs2hebrew(hd2abs(yomHaZikaron) + 1));
  }
  const yesPrev: SimpleHebrewDate[] = [
    simpleHD(29, months.ELUL, year - 1), // Erev Rosh Hashanah
    simpleHD(9, months.TISHREI, year), // Erev Yom Kippur
    simpleHD(14, months.IYYAR, year), // Pesach Sheini
  ];
  return {
    none: none.map(hd => hd2abs(hd)).sort((a, b) => a - b),
    some: some.map(hd => hd2abs(hd)).sort((a, b) => a - b),
    yesPrev: yesPrev.map(hd => hd2abs(hd)).sort((a, b) => a - b),
  };
}
