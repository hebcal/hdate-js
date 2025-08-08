import {expect, test} from 'vitest';
import {Locale} from '../src/locale';

test('getLocaleNames', () => {
  const expected = ['', 'a', 'ashkenazi', 'en', 'h', 'he', 'he-x-nonikud', 's'];
  const actual = Locale.getLocaleNames();
  expect(actual).toEqual(expected);
});

test('gettext-he', () => {
  expect(Locale.gettext('Elul', 'he')).toBe('אֱלוּל');
});

test('hebrewStripNikkud', () => {
  const strs = [
    ['יוֹם כִּפּוּר',
      'יום כפור'],
    ['לֶךְ־לְךָ',
      'לך־לך'],
  ];
  for (const [original, expected] of strs) {
    expect(Locale.hebrewStripNikkud(original)).toBe(expected);
  }
});

test('useLocale-ordinal', () => {
  Locale.useLocale('en');
  expect(Locale.ordinal(3)).toBe('3rd');
  const expected = {
    a: '3rd',
    s: '3rd',
    ashkenazi: '3rd',
    en: '3rd',
    he: '3',
    h: '3',
  };
  for (const [loc, str] of Object.entries(expected)) {
    Locale.useLocale(loc);
    expect(Locale.ordinal(3)).toBe(str);
  }
  Locale.useLocale('');
  expect(Locale.ordinal(3)).toBe('3rd');

  expect(Locale.ordinal(3, 'fr')).toBe('3.');
  expect(Locale.ordinal(3, 'es')).toBe('3º');
  expect(Locale.ordinal(3, 'he')).toBe('3');
});

test('lookupTranslation-he-x-NoNikud', () => {
  expect(Locale.lookupTranslation('Adar II', 'he-x-NoNikud')).toBe('אדר ב׳');
  expect(Locale.lookupTranslation('Foobar', 'he-x-NoNikud')).toBe(undefined);
});

test('gettext-ashkenazi', () => {
  expect(Locale.gettext('Tevet', 'a')).toBe('Teves');
  expect(Locale.gettext('Tevet', 'ashkenazi')).toBe('Teves');
});

test('getLocaleName', () => {
  Locale.useLocale('he');
  expect(Locale.getLocaleName()).toBe('he');
  Locale.useLocale('s');
  expect(Locale.getLocaleName()).toBe('en');
  Locale.useLocale('h');
  expect(Locale.getLocaleName()).toBe('he');
});

test('useLocale-throws', () => {
  expect(() => {
    Locale.useLocale('bogus');
  }).toThrow('Locale \'bogus\' not found');
});

test('addTranslation', () => {
  expect(Locale.lookupTranslation('Foobar', 'a')).toBe(undefined);
  Locale.addTranslation('a', 'Foobar', 'Quux');
  expect(Locale.lookupTranslation('Foobar', 'a')).toBe('Quux');

  expect(Locale.lookupTranslation('Baaz', 'a')).toBe(undefined);
  Locale.addTranslation('a', 'Baaz', ['Quux']);
  expect(Locale.lookupTranslation('Baaz', 'a')).toBe('Quux');
});

test('addTranslations', () => {
  expect(Locale.lookupTranslation('Hello world', 'a')).toBe(undefined);
  expect(Locale.lookupTranslation('Goodbye', 'a')).toBe(undefined);
  const localeData = {
    headers: {'plural-forms': 'nplurals=2; plural=(n!=1);'},
    contexts: {'': {
      'Hello': ['World'],
      'Hello world': ['Quux'],
      'Goodbye': ['World'],
    }},
  };
  Locale.addTranslations('a', localeData);
  expect(Locale.lookupTranslation('Hello world', 'a')).toBe('Quux');
  expect(Locale.lookupTranslation('Goodbye', 'a')).toBe('World');
});

test('addTranslation-throws', () => {
  expect(() => {
    Locale.addTranslation('a', 'foo', null);
  }).toThrow('Invalid translation string: null');
  expect(() => {
    Locale.addTranslation('a', 'foo', undefined);
  }).toThrow('Invalid translation string: undefined');
  expect(() => {
    Locale.addTranslation('a', 'foo', 123 as any);
  }).toThrow('Invalid translation string: 123');
  expect(() => {
    Locale.addTranslation('a', 'foo', ['']);
  }).toThrow('Invalid translation array: ');
  expect(() => {
    Locale.addTranslation('a', 'foo', [123] as any);
  }).toThrow('Invalid translation array: 123');
  expect(() => {
    Locale.addTranslation('a', '', 'translation');
  }).toThrow('Invalid id string: ');
  expect(() => {
    Locale.addTranslation('a', null, 'translation');
  }).toThrow('Invalid id string: null');
});

test('ordinal-ashkenazi-prefix', () => {
  Locale.addLocale('ashkenazi-custom', { headers: {}, contexts: { '': {} } });
  expect(Locale.ordinal(3, 'ashkenazi-custom')).toBe('3rd');
});
