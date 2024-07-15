import { getPseudoISO, getTimezoneOffset } from '../src/dateFormat';

test('getPseudoISO-2021', () => {
  const dt = new Date(Date.UTC(2021, 0, 31, 7, 30, 50, 551));
  expect(getPseudoISO('UTC', dt)).toBe('2021-01-31T07:30:50Z');
  expect(getPseudoISO('America/New_York', dt)).toBe('2021-01-31T02:30:50Z');
  expect(getPseudoISO('America/Los_Angeles', dt)).toBe('2021-01-30T23:30:50Z');
});

test('getPseudoISO-1948', () => {
  const dt = new Date(Date.UTC(1948, 0, 31, 7, 30, 50, 551));
  expect(getPseudoISO('UTC', dt)).toBe('1948-01-31T07:30:50Z');
  expect(getPseudoISO('America/New_York', dt)).toBe('1948-01-31T02:30:50Z');
  expect(getPseudoISO('America/Los_Angeles', dt)).toBe('1948-01-30T23:30:50Z');
});

test('getPseudoISO-1776', () => {
  const dt = new Date(Date.UTC(1776, 0, 31, 7, 30, 50, 551));
  expect(getPseudoISO('UTC', dt)).toBe('1776-01-31T07:30:50Z');
  expect(getPseudoISO('America/New_York', dt)).toBe('1776-01-31T02:34:48Z');
  expect(getPseudoISO('America/Los_Angeles', dt)).toBe('1776-01-30T23:37:52Z');
});

test('getPseudoISO-101', () => {
  const dt = new Date(Date.UTC(101, 0, 31, 7, 30, 50, 551));
  expect(getPseudoISO('UTC', dt)).toBe('0101-01-31T07:30:50Z');
  expect(getPseudoISO('America/New_York', dt)).toBe('0101-01-31T02:34:48Z');
  expect(getPseudoISO('America/Los_Angeles', dt)).toBe('0101-01-30T23:37:52Z');
});

test('getTimezoneOffset', () => {
  const january = new Date(Date.UTC(2021, 0, 31, 7, 30, 50, 551));
  expect(getTimezoneOffset('America/New_York', january)).toBe(300);
  expect(getTimezoneOffset('America/Los_Angeles', january)).toBe(480);
  expect(getTimezoneOffset('America/Phoenix', january)).toBe(420);
  expect(getTimezoneOffset('Asia/Jerusalem', january)).toBe(-120);

  const july = new Date(Date.UTC(2021, 7, 21, 7, 30, 50, 551));
  expect(getTimezoneOffset('America/New_York', july)).toBe(240);
  expect(getTimezoneOffset('America/Los_Angeles', july)).toBe(420);
  expect(getTimezoneOffset('America/Phoenix', july)).toBe(420);
  expect(getTimezoneOffset('Asia/Jerusalem', july)).toBe(-180);
});
