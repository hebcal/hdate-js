import {expect, test} from 'vitest';
import {
  abs2hebrew, daysInMonth, daysInYear, elapsedDays, hebrew2abs,
  hd2abs,
  isLeapYear, months, getMonthName, monthFromName
} from '../src/hdateBase';

const NISAN = months.NISAN;
const IYYAR = months.IYYAR;
const SIVAN = months.SIVAN;
const TAMUZ = months.TAMUZ;
const AV = months.AV;
const ELUL = months.ELUL;
const TISHREI = months.TISHREI;
const CHESHVAN = months.CHESHVAN;
const KISLEV = months.KISLEV;
const TEVET = months.TEVET;
const SHVAT = months.SHVAT;
const ADAR_I = months.ADAR_I;
const ADAR_II = months.ADAR_II;

test('elapsedDays', () => {
  expect(elapsedDays(5780)).toBe(2110760);
  expect(elapsedDays(5708)).toBe(2084447);
  expect(elapsedDays(3762)).toBe(1373677);
  expect(elapsedDays(3671)).toBe(1340455);
  expect(elapsedDays(1234)).toBe(450344);
  expect(elapsedDays(123)).toBe(44563);
  expect(elapsedDays(2)).toBe(356);
  expect(elapsedDays(1)).toBe(1);
  expect(elapsedDays(5762)).toBe(2104174);
  expect(elapsedDays(5763)).toBe(2104528);
  expect(elapsedDays(5764)).toBe(2104913);
  expect(elapsedDays(5765)).toBe(2105268);
  expect(elapsedDays(5766)).toBe(2105651);
});

test('isLeapYear', () => {
  expect(isLeapYear(5779)).toBe(true);
  expect(isLeapYear(5782)).toBe(true);
  expect(isLeapYear(5784)).toBe(true);
  expect(isLeapYear(5780)).toBe(false);
  expect(isLeapYear(5781)).toBe(false);
  expect(isLeapYear(5783)).toBe(false);
  expect(isLeapYear(5778)).toBe(false);
  expect(isLeapYear(5749)).toBe(true);
  expect(isLeapYear(5511)).toBe(false);
  expect(isLeapYear(5252)).toBe(true);
  expect(isLeapYear(4528)).toBe(true);
  expect(isLeapYear(4527)).toBe(false);
});

test('daysInYear', () => {
  expect(daysInYear(5779)).toBe(385);
  expect(daysInYear(5780)).toBe(355);
  expect(daysInYear(5781)).toBe(353);
  expect(daysInYear(5782)).toBe(384);
  expect(daysInYear(5783)).toBe(355);
  expect(daysInYear(5784)).toBe(383);
  expect(daysInYear(5785)).toBe(355);
  expect(daysInYear(5786)).toBe(354);
  expect(daysInYear(5787)).toBe(385);
  expect(daysInYear(5788)).toBe(355);
  expect(daysInYear(5789)).toBe(354);
  expect(daysInYear(3762)).toBe(383);
  expect(daysInYear(3671)).toBe(354);
  expect(daysInYear(1234)).toBe(353);
  expect(daysInYear(123)).toBe(355);
  expect(daysInYear(2)).toBe(355);
  expect(daysInYear(1)).toBe(355);

  expect(daysInYear(5761)).toBe(353);
  expect(daysInYear(5762)).toBe(354);
  expect(daysInYear(5763)).toBe(385);
  expect(daysInYear(5764)).toBe(355);
  expect(daysInYear(5765)).toBe(383);
  expect(daysInYear(5766)).toBe(354);
});

test('daysInYear2', () => {
  const actual: {[key: string]: number} = {};
  for (let year = 1; year <= 9999; year++) {
    const days = daysInYear(year);
    if (actual[days]) {
      actual[days]++;
    } else {
      actual[days] = 1;
    }
  }
  const expected = {
    '353': 1004,
    '354': 2431,
    '355': 2881,
    '383': 1547,
    '384': 524,
    '385': 1612,
  };
  expect(actual).toEqual(expected);
});

test('daysInMonth', () => {
  expect(daysInMonth(IYYAR, 5780)).toBe(29);
  expect(daysInMonth(SIVAN, 5780)).toBe(30);
  expect(daysInMonth(CHESHVAN, 5782)).toBe(29);
  expect(daysInMonth(CHESHVAN, 5783)).toBe(30);
  expect(daysInMonth(KISLEV, 5783)).toBe(30);
  expect(daysInMonth(KISLEV, 5784)).toBe(29);

  expect(daysInMonth(TISHREI, 5765)).toBe(30);
  expect(daysInMonth(CHESHVAN, 5765)).toBe(29);
  expect(daysInMonth(KISLEV, 5765)).toBe(29);
  expect(daysInMonth(TEVET, 5765)).toBe(29);
});

test('hebrew2abs', () => {
  expect(hebrew2abs(5769, CHESHVAN, 15)).toBe(733359);
  expect(hebrew2abs(5708, IYYAR, 6)).toBe(711262);
  expect(hebrew2abs(3762, TISHREI, 1)).toBe(249);
  expect(hebrew2abs(3761, NISAN, 1)).toBe(72);
  expect(hebrew2abs(3761, TEVET, 18)).toBe(1);
  expect(hebrew2abs(3761, TEVET, 17)).toBe(0);
  expect(hebrew2abs(3761, TEVET, 16)).toBe(-1);
  expect(hebrew2abs(3761, TEVET, 1)).toBe(-16);
  expect(hebrew2abs(5765, TISHREI, 1)).toBe(731840);
  expect(hebrew2abs(5765, SHVAT, 1)).toBe(731957);
  expect(hebrew2abs(5765, ADAR_I, 1)).toBe(731987);
  expect(hebrew2abs(5765, ADAR_II, 22)).toBe(732038);
  expect(hebrew2abs(5765, ADAR_II, 1)).toBe(732017);
  expect(hebrew2abs(5765, NISAN, 1)).toBe(732046);
});

test('hd2abs', () => {
  expect(hd2abs({yy: 5769, mm: CHESHVAN, dd: 15})).toBe(733359);
  expect(hd2abs({yy: 5765, mm: TISHREI, dd: 1})).toBe(731840);
  expect(hd2abs({yy: 5765, mm: SHVAT, dd: 1})).toBe(731957);
  expect(hd2abs({yy: 5765, mm: ADAR_I, dd: 1})).toBe(731987);
  expect(hd2abs({yy: 5765, mm: ADAR_II, dd: 22})).toBe(732038);
  expect(hd2abs({yy: 5765, mm: ADAR_II, dd: 1})).toBe(732017);
  expect(hd2abs({yy: 5765, mm: NISAN, dd: 1})).toBe(732046);
});

test('abs2hebrew', () => {
  expect(abs2hebrew(733359)).toEqual({yy: 5769, mm: CHESHVAN, dd: 15});
  expect(abs2hebrew(711262)).toEqual({yy: 5708, mm: IYYAR, dd: 6});
  expect(abs2hebrew(249)).toEqual({yy: 3762, mm: TISHREI, dd: 1});
  expect(abs2hebrew(1)).toEqual({yy: 3761, mm: TEVET, dd: 18});
  expect(abs2hebrew(0)).toEqual({yy: 3761, mm: TEVET, dd: 17});
  expect(abs2hebrew(-16)).toEqual({yy: 3761, mm: TEVET, dd: 1});
  expect(abs2hebrew(736685)).toEqual({yy: 5778, mm: 10, dd: 4});
  expect(abs2hebrew(737485)).toEqual({yy: 5780, mm: 12, dd: 5});
  expect(abs2hebrew(737885)).toEqual({dd: 23, mm: 1, yy: 5781});
  expect(abs2hebrew(738285)).toEqual({dd: 9, mm: 2, yy: 5782});
  expect(abs2hebrew(732038)).toEqual({yy: 5765, mm: ADAR_II, dd: 22});
  for (let i = 73668; i <= 943620; i += 365) {
    abs2hebrew(i);
  }
  expect(abs2hebrew(-1373427)).toEqual({yy: 1, mm: TISHREI, dd: 1});
});

test('abs2hebrew-88ce', () => {
  expect(abs2hebrew(32141)).toEqual({yy: 3849, mm: SHVAT, dd: 1});
  expect(abs2hebrew(32142)).toEqual({yy: 3849, mm: SHVAT, dd: 2});
});

test('throws-abs2hebrew', () => {
  expect(() => {
    abs2hebrew(NaN);
  }).toThrow('param \'abs\' not a number: NaN');
});

test('throws-abs2hebrew-before-epoch', () => {
  expect(() => {
    abs2hebrew(-1373429);
  }).toThrow('abs2hebrew: -1373429 is before epoch');
});

test('throws-hebrew2abs', () => {
  expect(() => {
    hebrew2abs(0, NISAN, 15);
  }).toThrow('hebrew2abs: invalid year 0');
});


test('getMonthName', () => {
  // leap year
  expect(getMonthName(ADAR_I, 5763)).toBe('Adar I');
  expect(getMonthName(ADAR_II, 5763)).toBe('Adar II');
  expect(getMonthName(14, 5763)).toBe('Nisan');
  // not a leap year
  expect(getMonthName(ADAR_I, 5764)).toBe('Adar');
  expect(getMonthName(ADAR_II, 5764)).toBe('Nisan');
  // not boundary conditions
  expect(getMonthName(TAMUZ, 5780)).toBe('Tamuz');
  expect(getMonthName(NISAN, 5763)).toBe('Nisan');
  expect(getMonthName(ELUL, 5763)).toBe('Elul');
  expect(getMonthName(TISHREI, 5763)).toBe('Tishrei');
});

test('throws-getMonthName', () => {
  expect(() => {
    getMonthName(NaN, 5780);
  }).toThrow('param \'month\' not a number: NaN');
  expect(() => {
    getMonthName(20, 5780);
  }).toThrow('bad monthNum: 20');
});

test('abs2hebrew-1752-reformation', () => {
  // 14 September 1752
  expect(abs2hebrew(639797)).toEqual({yy: 5513, mm: TISHREI, dd: 6});
  // 2 September 1752
  expect(abs2hebrew(639796)).toEqual({yy: 5513, mm: TISHREI, dd: 5});
});

test('hebrew2abs-1752-reformation', () => {
  // 14 September 1752
  expect(hebrew2abs(5513, TISHREI, 6)).toBe(639797);
  // 2 September 1752
  expect(hebrew2abs(5513, TISHREI, 5)).toBe(639796);
});

test('monthFromName', () => {
  const toTest = [
    NISAN, 'Nisan_nisan_n_N_Nissan_ניסן',
    IYYAR, ['Iyyar', 'Iyar', 'iyyar', 'iy', 'אייר', "אִיָּיר"],
    ELUL, 'Elul_elul_אלול',
    CHESHVAN, 'Cheshvan_cheshvan_חשון',
    KISLEV, 'Kislev_kislev_כסלו',
    SIVAN, 'Sivan_sivan_סייון_סיון',
    SHVAT, 'Shvat_Sh\'vat_Shevat_שבט',
    TAMUZ, 'Tamuz_Tammuz_תמוז',
    TISHREI, 'Tishrei_תשרי',
    TEVET, 'Tevet_טבת',
    AV, ['Av', 'אב', 'אָב'],
    ADAR_I, ['Adar I', 'Adar 1', 'AdarI', 'Adar1',
      'אדר א', "אֲדָר א", "אֲדָר א׳", 'אדר 1'],
    ADAR_II, ['Adar II', 'Adar 2', 'AdarII', 'Adar2',
      'אדר', 'אֲדָר', "אֲדָר ב", "אֲדָר ב׳", 'אדר ב', 'אדר 2'],
  ];

  for (let i = 0; i < toTest.length; i += 2) {
    const monthNum = toTest[i];
    const samples = toTest[i + 1];
    const arr: string[] = typeof samples == 'string' ? samples.split('_') : samples as string[];
    for (const input of arr) {
      expect(monthFromName(input)).toBe(monthNum); // `${input} => ${monthNum}`);
    }
  }

  const bad = 'Xyz Ace November Tommy suds January תת אא'.split(' ');
  for (const sample of bad) {
    expect(() => {
      monthFromName(sample);
    }).toThrow(`bad monthName: ${sample}`);
  }
});
