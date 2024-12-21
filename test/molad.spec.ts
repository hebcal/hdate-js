import {expect, test} from 'vitest';
import {molad} from '../src/molad';
import {months} from '../src/hdateBase';

test('Molad', () => {
  const items = [
    [months.CHESHVAN, 3, 14, 42, 14],
    [months.KISLEV, 5, 3, 26, 15],
    [months.TEVET, 6, 16, 10, 16],
    [months.SHVAT, 1, 4, 54, 17],
    [months.ADAR_I, 2, 17, 39, 0],
    [months.NISAN, 4, 6, 23, 1],
    [months.IYYAR, 5, 19, 7, 2],
    [months.SIVAN, 0, 7, 51, 3],
    [months.TAMUZ, 1, 20, 35, 4],
    [months.AV, 3, 9, 19, 5],
    [months.ELUL, 4, 22, 3, 6],
  ];

  for (const item of items) {
    const [month, dow, hour, minutes, chalakim] = item;
    const m = molad(5769, month);
    expect(m.dayOfWeek).toBe(dow);
    expect(m.hour).toBe(hour);
    expect(m.minutes).toBe(minutes);
    expect(m.chalakim).toBe(chalakim);
    expect(m.year).toBe(5769);
    expect(m.month).toBe(month);
  }
});
