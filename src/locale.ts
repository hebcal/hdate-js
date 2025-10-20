import {hebrewStripNikkud} from './hebrewStripNikkud';
import poAshkenazi from './ashkenazi.po';
import poHe from './he.po';

export interface Headers {
  'content-type'?: string;
  'plural-forms'?: string;
}

export type StringArrayMap = Record<string, string[]>;

export interface LocaleData {
  headers: Headers;
  contexts: Record<string, StringArrayMap>;
}

const noopLocale: LocaleData = {
  headers: {'plural-forms': 'nplurals=2; plural=(n!=1);'},
  contexts: {'': {}},
} as const;

const alias: Record<string, string> = {
  h: 'he',
  a: 'ashkenazi',
  s: 'en',
  '': 'en',
} as const;

/** @private */
const locales = new Map<string, StringArrayMap>();

/** @private */
function getEnOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** @private */
function checkLocale(locale: string): string {
  if (typeof locale !== 'string') {
    throw new TypeError(`Invalid locale name: ${locale}`);
  }
  locale = alias[locale] || locale;
  return locale.toLowerCase();
}

/** @private */
function getExistingLocale(locale: string): StringArrayMap {
  const locale1 = checkLocale(locale);
  const loc = locales.get(locale1);
  if (!loc) {
    throw new RangeError(`Locale '${locale}' not found`);
  }
  return loc;
}

/**
 * A locale in Hebcal is used for translations/transliterations of
 * holidays. `@hebcal/hdate` supports four locales by default
 * * `en` - default, Sephardic transliterations (e.g. "Shabbat")
 * * `ashkenazi` - Ashkenazi transliterations (e.g. "Shabbos")
 * * `he` - Hebrew (e.g. "שַׁבָּת")
 * * `he-x-NoNikud` - Hebrew without nikud (e.g. "שבת")
 */
export class Locale {
  /**
   * Returns translation only if `locale` offers a non-empty translation for `id`.
   * Otherwise, returns `undefined`.
   * @param id Message ID to translate
   * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to no-op locale.
   */
  static lookupTranslation(id: string, locale?: string): string | undefined {
    const loc =
      (typeof locale === 'string' && locales.get(checkLocale(locale))) ||
      noopLocale.contexts[''];
    const array = loc[id];
    if (array?.length && array[0].length) {
      return array[0];
    }
    return undefined;
  }

  /**
   * By default, if no translation was found, returns `id`.
   * @param id Message ID to translate
   * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to no-op locale.
   */
  static gettext(id: string, locale?: string): string {
    const text = this.lookupTranslation(id, locale);
    if (typeof text === 'undefined') {
      return id;
    }
    return text;
  }

  /**
   * Register locale translations.
   * @param locale Locale name (i.e.: `'he'`, `'fr'`)
   * @param data parsed data from a `.po` file.
   */
  static addLocale(locale: string, data: LocaleData): void {
    locale = checkLocale(locale);
    const ctx = data.contexts;
    if (typeof ctx !== 'object' || typeof ctx[''] !== 'object') {
      throw new TypeError(`Locale '${locale}' invalid compact format`);
    }
    locales.set(locale, ctx['']);
  }

  /**
   * Adds a translation to `locale`, replacing any previous translation.
   * @param locale Locale name (i.e: `'he'`, `'fr'`).
   * @param id Message ID to translate
   * @param translation Translation text
   */
  static addTranslation(
    locale: string,
    id: string,
    translation: string | string[]
  ): void {
    const loc = getExistingLocale(locale);
    if (typeof id !== 'string' || id.length === 0) {
      throw new TypeError(`Invalid id string: ${id}`);
    }
    const isArray = Array.isArray(translation);
    if (isArray) {
      const t0 = translation[0];
      if (typeof t0 !== 'string' || t0.length === 0) {
        throw new TypeError(`Invalid translation array: ${translation}`);
      }
    } else if (typeof translation !== 'string') {
      throw new TypeError(`Invalid translation string: ${translation}`);
    }
    loc[id] = isArray ? translation : [translation];
  }
  /**
   * Adds multiple translations to `locale`, replacing any previous translations.
   * @param locale Locale name (i.e: `'he'`, `'fr'`).
   * @param data parsed data from a `.po` file.
   */
  static addTranslations(locale: string, data: LocaleData) {
    const loc = getExistingLocale(locale);
    const ctx = data.contexts;
    if (typeof ctx !== 'object' || typeof ctx[''] !== 'object') {
      throw new TypeError(`Locale '${locale}' invalid compact format`);
    }
    Object.assign(loc, ctx['']);
  }

  /**
   * Returns the names of registered locales
   */
  static getLocaleNames(): string[] {
    const keys = Array.from(locales.keys());
    return keys.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Checks whether a locale has been registered
   * @param locale Locale name (i.e: `'he'`, `'fr'`).
   */
  static hasLocale(locale: string): boolean {
    const locale1 = checkLocale(locale);
    return locales.has(locale1);
  }

  /**
   * Renders a number in ordinal, such as 1st, 2nd or 3rd
   * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to no-op locale.
   */
  static ordinal(n: number, locale?: string): string {
    let locale0 = locale?.toLowerCase();
    if (!locale0) {
      return getEnOrdinal(n);
    }
    locale0 = alias[locale0] || locale0;
    switch (locale0) {
      case 'en':
      case 'ashkenazi':
        return getEnOrdinal(n);
      case 'es':
        return n + 'º';
      case 'he':
      case 'he-x-nonikud':
        return String(n);
      default:
        break;
    }
    if (locale0.startsWith('ashkenazi')) {
      return getEnOrdinal(n);
    }
    return n + '.';
  }

  /**
   * Removes nekudot from Hebrew string
   */
  static hebrewStripNikkud(str: string): string {
    return hebrewStripNikkud(str);
  }

  /**
   * Makes a copy of entire Hebrew locale with no niqqud
   */
  static copyLocaleNoNikud(data: LocaleData): LocaleData {
    const strs = data.contexts[''];
    const m: StringArrayMap = {};
    for (const [key, val] of Object.entries(strs)) {
      m[key] = [hebrewStripNikkud(val[0])];
    }
    return {
      headers: data.headers,
      contexts: {'': m},
    };
  }
}

Locale.addLocale('en', noopLocale);

/* Ashkenazic transliterations */
Locale.addLocale('ashkenazi', poAshkenazi);

/* Hebrew with nikkud */
Locale.addLocale('he', poHe);

/* Hebrew without nikkud */
const poHeNoNikud = Locale.copyLocaleNoNikud(poHe);
Locale.addLocale('he-x-NoNikud', poHeNoNikud);
