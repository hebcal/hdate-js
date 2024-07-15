import { pad2, pad4 } from '../src/pad';

test('pad2', () => {
  expect(pad2(0)).toBe('00');
  expect(pad2(5)).toBe('05');
  expect(pad2(25)).toBe('25');
  expect(pad2(-3)).toBe('-3');
});

test('pad4', () => {
  expect(pad4(0)).toBe('0000');
  expect(pad4(5)).toBe('0005');
  expect(pad4(25)).toBe('0025');
  expect(pad4(125)).toBe('0125');
  expect(pad4(2025)).toBe('2025');
  expect(pad4(-38)).toBe('-000038');
});
