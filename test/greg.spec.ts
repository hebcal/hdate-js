import {expect, test} from 'vitest';
import {greg} from '../src/gregNamespace';

function ymd(date: Date) {
  return {yy: date.getFullYear(), mm: date.getMonth() + 1, dd: date.getDate()};
}

test('greg2abs', () => {
  const dt = new Date(1995, 11, 17);
  expect(greg.greg2abs(dt)).toBe(728644);
  expect(greg.greg2abs(new Date(1888, 11, 31))).toBe(689578);
  expect(greg.greg2abs(new Date(2005, 3, 2))).toBe(732038);
});

test('greg2abs-early-ce', () => {
  const dt = new Date(88, 11, 30);
  dt.setFullYear(88);
  expect(greg.greg2abs(dt)).toBe(32141);

  const dt2 = new Date(1, 0, 1);
  dt2.setFullYear(1);
  expect(greg.greg2abs(dt2)).toBe(1);
});

test('greg2abs-negative', () => {
  expect(greg.greg2abs(new Date(-1, 0, 1))).toBe(-730);
  expect(greg.greg2abs(new Date(-100, 11, 20))).toBe(-36536);
  expect(greg.greg2abs(new Date(-1000, 5, 15))).toBe(-365442);
});

test('abs2greg', () => {
  expect(ymd(greg.abs2greg(737553))).toEqual({yy: 2020, mm: 5, dd: 8});
  expect(ymd(greg.abs2greg(689578))).toEqual({yy: 1888, mm: 12, dd: 31});
  expect(ymd(greg.abs2greg(732038))).toEqual({yy: 2005, mm: 4, dd: 2});
});

test('abs2greg-88ce', () => {
  expect(ymd(greg.abs2greg(32141))).toEqual({yy: 88, mm: 12, dd: 30});
  expect(ymd(greg.abs2greg(32142))).toEqual({yy: 88, mm: 12, dd: 31});
  expect(ymd(greg.abs2greg(32143))).toEqual({yy: 89, mm: 1, dd: 1});
});

test('abs2greg-1ce', () => {
  const dt = greg.abs2greg(1);
  expect(dt.getFullYear()).toBe(1);
  expect(dt.getMonth()).toBe(0);
  expect(dt.getDate()).toBe(1);
});

test('abs2greg-negative', () => {
  const dt = greg.abs2greg(-730);
  expect(dt.getFullYear()).toBe(-1);
  expect(dt.getMonth()).toBe(0);
  expect(dt.getDate()).toBe(1);

  const dt2 = greg.abs2greg(-36536);
  expect(dt2.getFullYear()).toBe(-100);
  expect(dt2.getMonth()).toBe(11);
  expect(dt2.getDate()).toBe(20);

  const dt3 = greg.abs2greg(0);
  expect(dt3.getFullYear()).toBe(0);
  expect(dt3.getMonth()).toBe(11);
  expect(dt3.getDate()).toBe(31);

  const dt4 = greg.abs2greg(-1);
  expect(dt4.getFullYear()).toBe(0);
  expect(dt4.getMonth()).toBe(11);
  expect(dt4.getDate()).toBe(30);
});

test('daysInMonth', () => {
  expect(greg.daysInMonth(2, 2020)).toBe(29);
  expect(greg.daysInMonth(2, 2019)).toBe(28);
  expect(greg.daysInMonth(5, 2020)).toBe(31);
  expect(greg.daysInMonth(2, 2100)).toBe(28);
});

test('isLeapYear', () => {
  expect(greg.isLeapYear(2020)).toBe(true);
  expect(greg.isLeapYear(2019)).toBe(false);
  expect(greg.isLeapYear(2018)).toBe(false);
  expect(greg.isLeapYear(2017)).toBe(false);
  expect(greg.isLeapYear(2016)).toBe(true);
  expect(greg.isLeapYear(2000)).toBe(true);
  expect(greg.isLeapYear(2100)).toBe(false);
  expect(greg.isLeapYear(1980)).toBe(true);
});

test.skip('greg2abs-1752-reformation', () => {
  expect(greg.greg2abs(new Date(1752, 8, 14))).toBe(639797);
  // expect(greg.greg2abs(new Date(1752, 8, 2))).toBe(639796);
  expect(greg.greg2abs(new Date(1752, 5, 2))).toBe(639704);
  expect(greg.greg2abs(new Date(1751, 0, 1))).toBe(639186);
});

test.skip('gregorian-reformation-throws', () => {
  expect(() => {
    console.log(greg.greg2abs(new Date(1752, 8, 13)));
  }).toThrow(/^Invalid Date: /);

  expect(() => {
    console.log(greg.greg2abs(new Date(1752, 8, 3)));
  }).toThrow(/^Invalid Date: /);
});

test.skip('abs2greg-1752-reformation', () => {
  expect(ymd(greg.abs2greg(639797))).toEqual({yy: 1752, mm: 9, dd: 14});
  expect(ymd(greg.abs2greg(639796))).toEqual({yy: 1752, mm: 9, dd: 2});
  expect(ymd(greg.abs2greg(639186))).toEqual({yy: 1751, mm: 1, dd: 1});
});
