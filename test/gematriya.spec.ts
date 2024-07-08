import {gematriya, gematriyaStrToNum} from '../src/gematriya';

test('gematriya', () => {
  expect(gematriya(5749)).toBe('תשמ״ט');
  expect(gematriya(5774)).toBe('תשע״ד');
  expect(gematriya(5780)).toBe('תש״פ');
  expect(gematriya(3)).toBe('ג׳');
  expect(gematriya(14)).toBe('י״ד');
  expect(gematriya(15)).toBe('ט״ו');
  expect(gematriya(16)).toBe('ט״ז');
  expect(gematriya(17)).toBe('י״ז');
  expect(gematriya(20)).toBe('כ׳');
  expect(gematriya(25)).toBe('כ״ה');
  expect(gematriya(60)).toBe('ס׳');
  expect(gematriya(123)).toBe('קכ״ג');
  expect(gematriya(613)).toBe('תרי״ג');
  expect(gematriya(3761)).toBe('ג׳תשס״א');
  expect(gematriya(6749)).toBe('ו׳תשמ״ט');
  expect(gematriya(8765)).toBe('ח׳תשס״ה');
  expect(gematriya(22700)).toBe('כב׳ת״ש');
  expect(gematriya(16123)).toBe('טז׳קכ״ג');
  expect(gematriya(1123)).toBe('א׳קכ״ג');
  expect(gematriya(6000)).toBe('ו׳');
  expect(gematriya(7007)).toBe('ז׳ז׳');
});

test('gematriyaStrToNum', () => {
  expect(gematriyaStrToNum('תשמ״ט')).toBe(749);
  expect(gematriyaStrToNum('תשע״ד')).toBe(774);
  expect(gematriyaStrToNum('תש״פ')).toBe(780);
  expect(gematriyaStrToNum('ג׳')).toBe(3);
  expect(gematriyaStrToNum('י״ד')).toBe(14);
  expect(gematriyaStrToNum('ט״ו')).toBe(15);
  expect(gematriyaStrToNum('ט״ז')).toBe(16);
  expect(gematriyaStrToNum('י״ז')).toBe(17);
  expect(gematriyaStrToNum('כ׳')).toBe(20);
  expect(gematriyaStrToNum('כ״ה')).toBe(25);
  expect(gematriyaStrToNum('ס׳')).toBe(60);
  expect(gematriyaStrToNum('קכ״ג')).toBe(123);
  expect(gematriyaStrToNum('תרי״ג')).toBe(613);
});

test('gematriyaStrToNum-thousands', () => {
  expect(gematriyaStrToNum('ג׳תשס״א')).toBe(3761);
  expect(gematriyaStrToNum('ו׳תשמ״ט')).toBe(6749);
  expect(gematriyaStrToNum('ח׳תשס״ה')).toBe(8765);
  expect(gematriyaStrToNum('כב׳ת״ש')).toBe(22700);
  expect(gematriyaStrToNum('טז׳קכ״ג')).toBe(16123);
  expect(gematriyaStrToNum('א׳קכ״ג')).toBe(1123);
  expect(gematriyaStrToNum('ז׳ז׳')).toBe(7007);
});

test('throws-0', () => {
  expect(() => {
    gematriya(NaN);
  }).toThrow('invalid gematriya number: NaN');
  expect(() => {
    gematriya(0);
  }).toThrow('invalid gematriya number: 0');
  expect(() => {
    gematriya(-34);
  }).toThrow('invalid gematriya number: -34');
});
