import {expect, test} from 'vitest';
import {months} from '../src/hdateBase';
import {HDate} from '../src/hdate';
import {birthdayOrAnniversary, yahrzeit} from '../src/anniversaryHDate';

test('yahrzeit', () => {
  const dt = new Date(2014, 2, 2); // 30 Adar I 5774
  const hd = yahrzeit(5780, dt);
  expect(hd).toBeInstanceOf(HDate);
  expect(hd!.toString()).toBe("30 Sh'vat 5780");
  expect(hd!.greg()).toEqual(new Date(2020, 1, 25));
});

test('yahrzeit-undefined-on-or-before-death', () => {
  const dt = new Date(2014, 2, 2); // 30 Adar I 5774
  expect(yahrzeit(5774, dt)).toBe(undefined);
  expect(yahrzeit(5773, dt)).toBe(undefined);
});

test('birthdayOrAnniversary', () => {
  const dt = new Date(2014, 2, 2); // 30 Adar I 5774
  const hd = birthdayOrAnniversary(5780, dt);
  expect(hd).toBeInstanceOf(HDate);
  expect(hd!.toString()).toBe('1 Nisan 5780');
  expect(hd!.greg()).toEqual(new Date(2020, 2, 26));
});

test('birthdayOrAnniversary-same-year', () => {
  const dt = new Date(2014, 2, 2); // 30 Adar I 5774
  expect(birthdayOrAnniversary(5774, dt)!.toString()).toBe('30 Adar I 5774');
  expect(birthdayOrAnniversary(5773, dt)).toBe(undefined);
});

test('accepts HDate, SimpleHebrewDate and R.D. number', () => {
  const expected = "30 Sh'vat 5780";
  expect(yahrzeit(5780, new HDate(30, months.ADAR_I, 5774))!.toString()).toBe(
    expected
  );
  expect(
    yahrzeit(5780, {yy: 5774, mm: months.ADAR_I, dd: 30})!.toString()
  ).toBe(expected);
  expect(yahrzeit(5780, new HDate(30, months.ADAR_I, 5774).abs())!.toString()).toBe(
    expected
  );
});

test('does not modify the original HDate', () => {
  // 15 Adar II 5784 reused across years: 5785 and 5786 are common years,
  // 5787 is a leap year
  const niftar = new HDate(15, months.ADAR_II, 5784);
  const actual = [5785, 5786, 5787].map(y => yahrzeit(y, niftar)!.toString());
  expect(actual).toEqual([
    '15 Adar 5785',
    '15 Adar 5786',
    '15 Adar II 5787',
  ]);
  expect(niftar.toString()).toBe('15 Adar II 5784');
});

test('original year is a birthday but never a yahrzeit', () => {
  const dt = new Date(2014, 2, 2); // 30 Adar I 5774
  // a birth date is a meaningful day in its own right
  expect(birthdayOrAnniversary(5774, dt)!.toString()).toBe('30 Adar I 5774');
  // there is no "zeroth" yahrzeit; the first anniversary is the earliest
  expect(yahrzeit(5774, dt)).toBe(undefined);
  expect(yahrzeit(5775, dt)!.toString()).toBe("30 Sh'vat 5775");
});

test('yahrzeit and birthday diverge for a missing date', () => {
  // 30 Adar I 5774 does not exist in the common year 5780
  const dt = new Date(2014, 2, 2);
  // yahrzeit moves earlier, to the last day of the preceding month
  expect(yahrzeit(5780, dt)!.toString()).toBe("30 Sh'vat 5780");
  // birthday is postponed to the first of the following month
  expect(birthdayOrAnniversary(5780, dt)!.toString()).toBe('1 Nisan 5780');
});
