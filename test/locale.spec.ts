import {expect, test} from 'vitest';
import {Locale} from '../src/locale';

test('getLocaleNames', () => {
  const expected = ['ashkenazi', 'en', 'he', 'he-x-nonikud'];
  const actual = Locale.getLocaleNames();
  expect(actual).toEqual(expected);
});

test('gettext-he', () => {
  expect(Locale.gettext('Elul', 'he')).toBe('אֱלוּל');
  expect(Locale.gettext('Elul', 'h')).toBe('אֱלוּל');
  const str = "אלול";
  expect(Locale.gettext('Elul', 'he-x-NoNikud')).toBe(str);
  expect(Locale.gettext('Elul', 'he-x-nonikud')).toBe(str);
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

test('ordinal', () => {
  expect(Locale.ordinal(3, 'en')).toBe('3rd');
  const expected = {
    a: '3rd',
    s: '3rd',
    ashkenazi: '3rd',
    en: '3rd',
    he: '3',
    h: '3',
  };
  for (const [loc, str] of Object.entries(expected)) {
    expect(Locale.ordinal(3, loc)).toBe(str);
  }
  expect(Locale.ordinal(3, '')).toBe('3rd');
  expect(Locale.ordinal(3, undefined)).toBe('3rd');

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
