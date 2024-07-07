import {months} from '../src/hdate-base';
import {HDate} from '../src/hdate';
import {isoDateString} from '../src/dateFormat';

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

test('daysInMonth', () => {
  expect(HDate.daysInMonth(IYYAR, 5780)).toBe(29);
  expect(HDate.daysInMonth(SIVAN, 5780)).toBe(30);
  expect(HDate.daysInMonth(CHESHVAN, 5782)).toBe(29);
  expect(HDate.daysInMonth(CHESHVAN, 5783)).toBe(30);
  expect(HDate.daysInMonth(KISLEV, 5783)).toBe(30);
  expect(HDate.daysInMonth(KISLEV, 5784)).toBe(29);
});

test('ctor-mdy', () => {
  let d = new HDate(29, CHESHVAN, 5769);
  let dt = d.greg(); // 2008-11-27
  expect(d.getMonth()).toBe(CHESHVAN);
  expect(d.getDate()).toBe(29);
  expect(d.getFullYear()).toBe(5769);
  expect(d.prev().getMonth()).toBe(CHESHVAN);
  expect(d.next().getMonth()).toBe(KISLEV);
  expect(d.abs()).toBe(733373);
  expect(dt.getMonth()).toBe(10);
  expect(dt.getDate()).toBe(27);
  expect(dt.getFullYear()).toBe(2008);

  d = new HDate(4, TAMUZ, 5536);
  dt = d.greg(); // 1776-06-21
  expect(d.getMonth()).toBe(TAMUZ);
  expect(d.getDate()).toBe(4);
  expect(d.getFullYear()).toBe(5536);
  expect(d.abs()).toBe(648478);
  expect(dt.getMonth()).toBe(5);
  expect(dt.getDate()).toBe(21);
  expect(dt.getFullYear()).toBe(1776);

  d = new HDate(3, TISHREI, 1003);
  expect(d.getMonth()).toBe(TISHREI);
  expect(d.getDate()).toBe(3);
  expect(d.getFullYear()).toBe(1003);
  expect(d.abs()).toBe(-1007451);
});

test('ctor-abs', () => {
  let d = new HDate(733359);
  expect(d.getMonth()).toBe(CHESHVAN);
  expect(d.getDate()).toBe(15);
  expect(d.getFullYear()).toBe(5769);
  expect(d.abs()).toBe(733359);

  d = new HDate(295059);
  expect(d.getMonth()).toBe(CHESHVAN);
  expect(d.getDate()).toBe(7);
  expect(d.getFullYear()).toBe(4569);
  expect(d.abs()).toBe(295059);

  d = new HDate(1);
  expect(d.getMonth()).toBe(TEVET);
  expect(d.getDate()).toBe(18);
  expect(d.getFullYear()).toBe(3761);
  expect(d.abs()).toBe(1);
});

test('prev-next', () => {
  const hd = new HDate(765432);
  expect(hd.prev().abs()).toBe(765431);
  expect(hd.next().abs()).toBe(765433);
  const hd2 = new HDate(new Date(1751, 0, 1));
  expect(hd2.prev().abs()).toBe(639174);
  expect(hd2.next().abs()).toBe(639176);
});

test('ctor-jsdate', () => {
  const d = new HDate(new Date(1751, 0, 1));
  expect(d.getMonth()).toBe(TEVET);
  expect(d.getDate()).toBe(4);
  expect(d.getFullYear()).toBe(5511);
  expect(d.abs()).toBe(639175);
});

test('ctor-copy', () => {
  const d1 = new HDate(new Date(1751, 0, 1));
  const d2 = new HDate(d1);
  expect(d1.isSameDate(d2)).toBe(true);
  expect(d1.abs()).toBe(d2.abs());

  const d3 = new HDate(29, 'Cheshvan', 5769);
  const d4 = new HDate(d3);
  expect(d3.isSameDate(d4)).toBe(true);
  expect(d3.abs()).toBe(d4.abs());

  expect(d3.isSameDate(d1)).toBe(false);
  // expect(d3.isSameDate({})).toBe(false);
  // expect(d3.isSameDate([])).toBe(false);
  // expect(d3.isSameDate('bogus')).toBe(false);
  // expect(d3.isSameDate(3.14159)).toBe(false);

  const d5 = new HDate(733359);
  const d6 = new HDate(d5);
  expect(d5.isSameDate(d6)).toBe(true);
  expect(d5.abs()).toBe(d6.abs());
});

test('throws-ctor-2', () => {
  expect(() => {
    new HDate(17, 'Cheshvan');
  }).toThrow('HDate constructor requires 0, 1 or 3 arguments');
});

test('throws-ctor-NaN', () => {
  expect(() => {
    new HDate(NaN, 'Sivan', 5780);
  }).toThrow('HDate called with bad day argument: NaN');

  expect(() => {
    new HDate(17, 'Sivan', NaN);
  }).toThrow( 'HDate called with bad year argument: NaN');

  expect(() => {
    new HDate(17, NaN, 5780);
  }).toThrow( 'Invalid month number: NaN');
});


test('toString', () => {
  const d = new HDate(new Date(1751, 0, 1));
  expect(d.toString()).toBe('4 Tevet 5511');
});

test('renderGematriya', () => {
  expect(new HDate(17, 'Tamuz', 5748).renderGematriya()).toBe('י״ז תַּמּוּז תשמ״ח');
  expect(new HDate(20, 'Tishrei', 5780).renderGematriya()).toBe('כ׳ תִּשְׁרֵי תש״פ');
  expect(new HDate(26, 'Tevet', 8008).renderGematriya()).toBe('כ״ו טֵבֵת ח׳ח׳');
});

test('renderGematriya-suppressNikud', () => {
  expect(new HDate(17, 'Tamuz', 5748).renderGematriya(false)).toBe('י״ז תַּמּוּז תשמ״ח');
  expect(new HDate(17, 'Tamuz', 5748).renderGematriya(true)).toBe('י״ז תמוז תשמ״ח');
});

test('render', () => {
  const hd = new HDate(15, months.CHESHVAN, 5769);
  expect(hd.render('')).toBe('15th of Cheshvan, 5769');
  expect(hd.render('en')).toBe('15th of Cheshvan, 5769');
  expect(hd.render('s')).toBe('15th of Cheshvan, 5769');
  expect(hd.render('ashkenazi')).toBe('15th of Cheshvan, 5769');
  expect(hd.render('he')).toBe('15 חֶשְׁוָן, 5769');

  expect(hd.render('en', true)).toBe('15th of Cheshvan, 5769');
  expect(hd.render('ashkenazi', true)).toBe('15th of Cheshvan, 5769');
  expect(hd.render('he', true)).toBe('15 חֶשְׁוָן, 5769');

  expect(hd.render('en', false)).toBe('15th of Cheshvan');
  expect(hd.render('ashkenazi', false)).toBe('15th of Cheshvan');
  expect(hd.render('he', false)).toBe('15 חֶשְׁוָן');
});

test('render-shvat', () => {
  const hd = new HDate(15, months.SHVAT, 5789);
  expect(hd.render('')).toBe('15th of Sh’vat, 5789');
  expect(hd.render('en')).toBe('15th of Sh’vat, 5789');
  expect(hd.render('s')).toBe('15th of Sh’vat, 5789');
  expect(hd.render('ashkenazi')).toBe('15th of Sh’vat, 5789');

  expect(hd.render('en', true)).toBe('15th of Sh’vat, 5789');
  expect(hd.render('ashkenazi', true)).toBe('15th of Sh’vat, 5789');

  expect(hd.render('en', false)).toBe('15th of Sh’vat');
  expect(hd.render('ashkenazi', false)).toBe('15th of Sh’vat');
});


test('render-tevet-ashkenazi', () => {
  const hd = new HDate(3, months.TEVET, 5769);
  expect(hd.render('en', false)).toBe('3rd of Tevet');
  expect(hd.render('s', false)).toBe('3rd of Tevet');
  expect(hd.render('ashkenazi', false)).toBe('3rd of Teves');
  expect(hd.render('a', false)).toBe('3rd of Teves');
});

test('monthFromName', () => {
  const toTest = [
    NISAN, 'Nisan_nisan_n_N_Nissan_ניסן',
    IYYAR, 'Iyyar_Iyar_iyyar_iy_אייר',
    ELUL, 'Elul_elul_אלול',
    CHESHVAN, 'Cheshvan_cheshvan_חשון',
    KISLEV, 'Kislev_kislev_כסלו',
    SIVAN, 'Sivan_sivan_סייון_סיון',
    SHVAT, 'Shvat_Sh\'vat_Shevat_שבט',
    TAMUZ, 'Tamuz_Tammuz_תמוז',
    TISHREI, 'Tishrei_תשרי',
    TEVET, 'Tevet_טבת',
    AV, 'Av_אב',
    ADAR_I, ['Adar I', 'Adar 1', 'AdarI', 'Adar1', 'אדר א', 'אדר 1'],
    ADAR_II, ['Adar II', 'Adar 2', 'AdarII', 'Adar2', 'אדר', 'אדר ב', 'אדר 2'],
  ];

  for (let i = 0; i < toTest.length; i += 2) {
    const monthNum = toTest[i];
    const samples = toTest[i + 1];
    const arr = typeof samples == 'string' ? samples.split('_') : samples as string[];
    for (const input of arr) {
      expect(HDate.monthFromName(input)).toBe(monthNum);
    }
  }

  expect(HDate.monthFromName(7)).toBe(7);

  const bad = 'Xyz Ace November Tommy suds January תת אא'.split(' ');
  for (const sample of bad) {
    expect(() => {
      HDate.monthFromName(sample);
    }).toThrow(`Unable to parse month name: ${sample}`);
  }
});

test('getMonthName-throws', () => {
  expect(() => {
    HDate.getMonthName(0, 5780);
  }).toThrow(`bad month argument 0`);
});

test('month14-rollover', () => {
  expect(new HDate(17, 14, 5779).toString()).toBe('17 Nisan 5780');
  expect(new HDate(17, 14, 5780).toString()).toBe('17 Iyyar 5781');
});

test('month-rollunder', () => {
  expect(new HDate(17, 0, 5779).toString()).toBe('17 Adar 5778');
  expect(new HDate(17, 0, 5780).toString()).toBe('17 Adar I 5779');

  expect(new HDate(17, -3, 5779).toString()).toBe('17 Tevet 5778');
  expect(new HDate(17, -3, 5780).toString()).toBe('17 Kislev 5779');
});

test('day-rollover-rollunder', () => {
  expect(new HDate(33, ELUL, 5779).toString()).toBe('4 Tishrei 5780');
  expect(new HDate(-3, TISHREI, 5779).toString()).toBe('27 Elul 5778');
});

test('adar2-nonleap', () => {
  const hd = new HDate(17, ADAR_II, 5780);
  expect(hd.getMonth()).toBe(ADAR_I);
});

// eslint-disable-next-line require-jsdoc
function hd2iso(hd: HDate) {
  return isoDateString(hd.greg());
}

test('before', () => {
  const hd = new HDate(new Date('Wednesday February 19, 2014'));
  expect(hd2iso(hd.before(6))).toBe('2014-02-15');
});

test('onOrBefore', () => {
  expect(hd2iso(new HDate(new Date('Wednesday February 19, 2014')).onOrBefore(6))).toBe('2014-02-15');
  expect(hd2iso(new HDate(new Date('Saturday February 22, 2014')).onOrBefore(6))).toBe('2014-02-22');
  expect(hd2iso(new HDate(new Date('Sunday February 23, 2014')).onOrBefore(6))).toBe('2014-02-22');
});

test('nearest', () => {
  expect(hd2iso(new HDate(new Date('Wednesday February 19, 2014')).nearest(6))).toBe('2014-02-22');
  expect(hd2iso(new HDate(new Date('Tuesday February 18, 2014')).nearest(6))).toBe('2014-02-15');
});

test('onOrAfter', () => {
  expect(hd2iso(new HDate(new Date('Wednesday February 19, 2014')).onOrAfter(6))).toBe('2014-02-22');
  expect(hd2iso(new HDate(new Date('Saturday February 22, 2014')).onOrAfter(6))).toBe('2014-02-22');
  expect(hd2iso(new HDate(new Date('Sunday February 23, 2014')).onOrAfter(6))).toBe('2014-03-01');
});

test('after', () => {
  expect(hd2iso(new HDate(new Date('Wednesday February 19, 2014')).after(6))).toBe('2014-02-22');
  expect(hd2iso(new HDate(new Date('Saturday February 22, 2014')).after(6))).toBe('2014-03-01');
  expect(hd2iso(new HDate(new Date('Sunday February 23, 2014')).after(6))).toBe('2014-03-01');
});

test('isHDate', () => {
  expect(HDate.isHDate('foo')).toBe(false);
  expect(HDate.isHDate(null)).toBe(false);
  expect(HDate.isHDate(undefined)).toBe(false);
  expect(HDate.isHDate({})).toBe(false);
  expect(HDate.isHDate(new HDate())).toBe(true);
  expect(HDate.isHDate(new Date())).toBe(false);
  expect(HDate.isHDate(new HDate(12345))).toBe(true);
});

test('getDay', () => {
  expect(new HDate(15, CHESHVAN, 5769).getDay()).toBe(4);
  expect(new HDate(6, IYYAR, 5708).getDay()).toBe(6);
  expect(new HDate(7, IYYAR, 5708).getDay()).toBe(0);
  expect(new HDate(1, TISHREI, 3762).getDay()).toBe(4);
  expect(new HDate(1, NISAN, 3761).getDay()).toBe(2);
  expect(new HDate(18, TEVET, 3761).getDay()).toBe(1);
  expect(new HDate(17, TEVET, 3761).getDay()).toBe(0);
  expect(new HDate(16, TEVET, 3761).getDay()).toBe(6);
  expect(new HDate(1, TEVET, 3761).getDay()).toBe(5);
  expect(new HDate(29, SIVAN, 3333).getDay()).toBe(2);
  expect(new HDate(28, SIVAN, 3333).getDay()).toBe(1);
  expect(new HDate(27, SIVAN, 3333).getDay()).toBe(0);
  expect(new HDate(26, SIVAN, 3333).getDay()).toBe(6);
  expect(new HDate(25, SIVAN, 3333).getDay()).toBe(5);
  expect(new HDate(24, SIVAN, 3333).getDay()).toBe(4);
  expect(new HDate(23, SIVAN, 3333).getDay()).toBe(3);
});

test('add', () => {
  const cheshvan29 = new HDate(29, CHESHVAN, 5769);
  let hd = cheshvan29.add(1, 'd');
  expect(hd.getMonth()).toBe(KISLEV);
  expect(hd.getDate()).toBe(1);
  expect(hd.getFullYear()).toBe(5769);

  hd = cheshvan29.add(10, 'days');
  expect(hd.getMonth()).toBe(KISLEV);
  expect(hd.getDate()).toBe(10);
  expect(hd.getFullYear()).toBe(5769);

  hd = cheshvan29.add(1, 'weeks');
  expect(hd.getMonth()).toBe(KISLEV);
  expect(hd.getDate()).toBe(7);
  expect(hd.getFullYear()).toBe(5769);

  hd = cheshvan29.add(-3, 'Days');
  expect(hd.getMonth()).toBe(CHESHVAN);
  expect(hd.getDate()).toBe(26);
  expect(hd.getFullYear()).toBe(5769);

  hd = cheshvan29.add(-3, 'Day');
  expect(hd.getMonth()).toBe(CHESHVAN);
  expect(hd.getDate()).toBe(26);
  expect(hd.getFullYear()).toBe(5769);

  hd = cheshvan29.subtract(3, 'M');
  expect(hd.getMonth()).toBe(AV);
  expect(hd.getDate()).toBe(30);
  expect(hd.getFullYear()).toBe(5768);

  hd = cheshvan29.add(0, 'y');
  expect(hd.getMonth()).toBe(CHESHVAN);
  expect(hd.getDate()).toBe(29);
  expect(hd.getFullYear()).toBe(5769);

  const adarIIleap = new HDate(14, ADAR_II, 5763);
  hd = adarIIleap.add(1, 'years');
  expect(hd.getMonth()).toBe(ADAR_I);
  expect(hd.getDate()).toBe(14);
  expect(hd.getFullYear()).toBe(5764);

  hd = adarIIleap.add(2, 'year');
  expect(hd.getMonth()).toBe(ADAR_II);
  expect(hd.getDate()).toBe(14);
  expect(hd.getFullYear()).toBe(5765);

  hd = adarIIleap.add(19, 'y');
  expect(hd.getMonth()).toBe(ADAR_II);
  expect(hd.getDate()).toBe(14);
  expect(hd.getFullYear()).toBe(5782);

  hd = adarIIleap.add(52, 'WEEKS');
  expect(hd.getMonth()).toBe(ADAR_I);
  expect(hd.getDate()).toBe(23);
  expect(hd.getFullYear()).toBe(5764);

  const adarNonLeap = new HDate(14, ADAR_I, 5764);
  expect(adarNonLeap.getMonth()).toBe(ADAR_I);
  expect(adarNonLeap.getDate()).toBe(14);
  expect(adarNonLeap.getFullYear()).toBe(5764);

  hd = adarNonLeap.add(-3, 'months');
  expect(hd.getMonth()).toBe(KISLEV);
  expect(hd.getDate()).toBe(15);
  expect(hd.getFullYear()).toBe(5764);

  hd = adarNonLeap.add(-1, 'months');
  expect(hd.getMonth()).toBe(SHVAT);
  expect(hd.getDate()).toBe(15);
  expect(hd.getFullYear()).toBe(5764);

  hd = adarNonLeap.add(-6, 'months');
  expect(hd.getMonth()).toBe(ELUL);
  expect(hd.getDate()).toBe(14);
  expect(hd.getFullYear()).toBe(5763);

  hd = adarNonLeap.add(1, 'months');
  expect(hd.getMonth()).toBe(NISAN);
  expect(hd.getDate()).toBe(14);
  expect(hd.getFullYear()).toBe(5764);

  hd = adarNonLeap.add(2, 'month');
  expect(hd.getMonth()).toBe(IYYAR);
  expect(hd.getDate()).toBe(14);
  expect(hd.getFullYear()).toBe(5764);

  hd = adarNonLeap.add(15, 'month');
  expect(hd.getMonth()).toBe(IYYAR);
  expect(hd.getDate()).toBe(14);
  expect(hd.getFullYear()).toBe(5765);
});

test('deltaDays', () => {
  const hd1 = new HDate(25, KISLEV, 5770);
  const hd2 = new HDate(15, CHESHVAN, 5769);
  expect(hd1.deltaDays(hd2)).toBe(394);
  expect(hd2.deltaDays(hd1)).toBe(-394);
  expect(hd1.deltaDays(hd1)).toBe(0);

  const hd3 = new HDate(10, TISHREI, 5770);
  const hd4 = new HDate(9, AV, 5769);
  expect(hd3.deltaDays(hd4)).toBe(60);
  expect(hd4.deltaDays(hd3)).toBe(-60);
});

test('throws-invalid-units', () => {

  expect(() => {

    const hd = new HDate(29, CHESHVAN, 5769);
    hd.add(1, 'foobar');
  }).toThrow('Invalid units \'foobar\'');
});

test('fromGematriyaString', () => {
  expect(HDate.fromGematriyaString('כ״ז בְּתַמּוּז תשפ״ג').toString()).toBe('27 Tamuz 5783');
  expect(HDate.fromGematriyaString('כ׳ סיון תש״ד').toString()).toBe('20 Sivan 5704');
  expect(HDate.fromGematriyaString('ה׳ אִיָיר תש״ח').toString()).toBe('5 Iyyar 5708');
  expect(HDate.fromGematriyaString('ה׳ אִיָיר תש״ח', 6000).toString()).toBe('5 Iyyar 6708');
  expect(HDate.fromGematriyaString('ה׳ אִיָיר ח׳תשס״ה', 4000).toString()).toBe('5 Iyyar 8765');
  expect(HDate.fromGematriyaString('ה׳ אִיָיר ח׳תשס״ה').toString()).toBe('5 Iyyar 8765');
});

test('fromGematriyaString Adar I', () => {
  expect(HDate.fromGematriyaString(' ה באדר א תשי"ט ').toString()).toBe('5 Adar I 5719');
});

test('fromGematriyaString whitespace', () => {
  expect(HDate.fromGematriyaString(' ה׳     אִיָיר   תש״ח').toString()).toBe('5 Iyyar 5708');
  expect(HDate.fromGematriyaString('ה  באדר   א תשי"ט ').toString()).toBe('5 Adar I 5719');
});

test('HDate-rollover-leap', () => {
  const hd = new HDate(30, IYYAR, 5784);
  expect(hd.getFullYear()).toBe(5784);
  expect(hd.getMonth()).toBe(SIVAN);
  expect(hd.getDate()).toBe(1);

  const hd2 = new HDate(30, ADAR_I, 5784);
  expect(hd2.getFullYear()).toBe(5784);
  expect(hd2.getMonth()).toBe(ADAR_I);
  expect(hd2.getDate()).toBe(30);

  const hd3 = new HDate(36, ADAR_I, 5784);
  expect(hd3.getFullYear()).toBe(5784);
  expect(hd3.getMonth()).toBe(ADAR_II);
  expect(hd3.getDate()).toBe(6);

  const hd4 = new HDate(36, ADAR_II, 5784);
  expect(hd4.getFullYear()).toBe(5784);
  expect(hd4.getMonth()).toBe(NISAN);
  expect(hd4.getDate()).toBe(7);
});

test('HDate-rollover-nonleap', () => {
  const hd = new HDate(30, IYYAR, 5783);
  expect(hd.getFullYear()).toBe(5783);
  expect(hd.getMonth()).toBe(SIVAN);
  expect(hd.getDate()).toBe(1);

  const hd0 = new HDate(30, ADAR_I, 5783);
  expect(hd0.getFullYear()).toBe(5783);
  expect(hd0.getMonth()).toBe(NISAN);
  expect(hd0.getDate()).toBe(1);

  const hd2 = new HDate(30, ADAR_II, 5783);
  expect(hd2.getFullYear()).toBe(5783);
  expect(hd2.getMonth()).toBe(NISAN);
  expect(hd2.getDate()).toBe(1);

  const hd3 = new HDate(36, ADAR_II, 5783);
  expect(hd3.getFullYear()).toBe(5783);
  expect(hd3.getMonth()).toBe(NISAN);
  expect(hd3.getDate()).toBe(7);
});
