import poAshkenazi from './ashkenazi.po';
import poHe from './he.po';

export interface Headers {
  'content-type'?: string;
  'plural-forms'?: string;
}

export interface StringArrayMap {
  [key: string]: string[];
}

export interface LocaleData {
  headers: Headers;
  contexts: { [key: string]: StringArrayMap };
}

const noopLocale: LocaleData = {
  headers: {'plural-forms': 'nplurals=2; plural=(n!=1);'},
  contexts: {'': {}},
};

interface StringProps {
  [key: string]: string;
}

const alias: StringProps = {
  'h': 'he',
  'a': 'ashkenazi',
  's': 'en',
  '': 'en',
};

/** @private */
const locales = new Map<string, StringArrayMap>();
/** @private */
let activeLocale: StringArrayMap;
/** @private */
let activeName: string;

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
   * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale.
   */
  static lookupTranslation(id: string, locale?: string): string | undefined {
    const loc = (typeof locale === 'string' && locales.get(locale.toLowerCase())) || activeLocale;
    const array = loc[id];
    if (array?.length && array[0].length) {
      return array[0];
    }
    return undefined;
  }

  /**
   * By default, if no translation was found, returns `id`.
   * @param id Message ID to translate
   * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale.
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
    if (typeof locale !== 'string') {
      throw new TypeError(`Invalid locale name: ${locale}`);
    }
    if (typeof data.contexts !== 'object' || typeof data.contexts[''] !== 'object') {
      throw new TypeError(`Locale '${locale}' invalid compact format`);
    }
    locales.set(locale.toLowerCase(), data.contexts['']);
  }

  /**
   * Adds a translation to `locale`, replacing any previous translation.
   * @param locale Locale name (i.e: `'he'`, `'fr'`).
   * @param id Message ID to translate
   * @param translation Translation text
   */
  static addTranslation(locale: string, id: string, translation: string | string[]): void {
    if (typeof locale !== 'string') {
      throw new TypeError(`Invalid locale name: ${locale}`);
    }
    const loc = locales.get(locale.toLowerCase());
    if (!loc) {
      throw new TypeError(`Unknown locale: ${locale}`);
    }
    if (typeof id !== 'string' || id.length === 0) {
      throw new TypeError(`Invalid id: ${id}`);
    }
    const isArray = Array.isArray(translation);
    if (isArray) {
      const t0 = translation[0];
      if (typeof t0 !== 'string' || t0.length === 0) {
        throw new TypeError(`Invalid translation array: ${translation}`);
      }
    } else if (typeof translation !== 'string') {
      throw new TypeError(`Invalid translation: ${translation}`);
    }
    loc[id] = isArray ? translation : [translation];
  }
  /**
   * Adds multiple translations to `locale`, replacing any previous translations.
   * @param locale Locale name (i.e: `'he'`, `'fr'`).
   * @param data parsed data from a `.po` file.
   */
  static addTranslations(locale: string, data: LocaleData) {
    if (typeof locale !== 'string') {
      throw new TypeError(`Invalid locale name: ${locale}`);
    }
    const loc = locales.get(locale.toLowerCase());
    if (!loc) {
      throw new TypeError(`Unknown locale: ${locale}`);
    }
    if (typeof data.contexts !== 'object' || typeof data.contexts[''] !== 'object') {
      throw new TypeError(`Locale '${locale}' invalid compact format`);
    }
    const ctx = data.contexts[''];
    Object.assign(loc, ctx);
  }
  /**
   * Activates a locale. Throws an error if the locale has not been previously added.
   * After setting the locale to be used, all strings marked for translations
   * will be represented by the corresponding translation in the specified locale.
   * @param locale Locale name (i.e: `'he'`, `'fr'`)
   */
  static useLocale(locale: string): StringArrayMap {
    const locale0 = locale.toLowerCase();
    const obj = locales.get(locale0);
    if (!obj) {
      throw new RangeError(`Locale '${locale}' not found`);
    }
    activeName = alias[locale0] || locale0;
    activeLocale = obj;
    return activeLocale;
  }

  /**
   * Returns the name of the active locale (i.e. 'he', 'ashkenazi', 'fr')
   */
  static getLocaleName(): string {
    return activeName;
  }

  /**
   * Returns the names of registered locales
   */
  static getLocaleNames(): string[] {
    const keys = Array.from(locales.keys());
    return keys.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Renders a number in ordinal, such as 1st, 2nd or 3rd
   * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale.
   */
  static ordinal(n: number, locale?: string): string {
    const locale1 = locale?.toLowerCase();
    const locale0 = locale1 || activeName;
    if (!locale0) {
      return this.getEnOrdinal(n);
    }
    switch (locale0) {
      case 'en':
      case 's':
      case 'a':
      case 'ashkenazi':
      case 'ashkenazi_litvish':
      case 'ashkenazi_poylish':
      case 'ashkenazi_standard':
        return this.getEnOrdinal(n);
      case 'es':
        return n + 'º';
      case 'h':
      case 'he':
      case 'he-x-nonikud':
        return String(n);
      default:
        return n + '.';
    }
  }

  private static getEnOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /**
   * Removes nekudot from Hebrew string
   */
  static hebrewStripNikkud(str: string): string {
    return str.replace(/[\u0590-\u05bd]/g, '').replace(/[\u05bf-\u05c7]/g, '');
  }
}

Locale.addLocale('en', noopLocale);
Locale.addLocale('s', noopLocale);
Locale.addLocale('', noopLocale);
Locale.useLocale('en');

/* Ashkenazic transliterations */
Locale.addLocale('ashkenazi', poAshkenazi);
Locale.addLocale('a', poAshkenazi);

/* Hebrew with nikkud */
Locale.addLocale('he', poHe);
Locale.addLocale('h', poHe);

/* Hebrew without nikkud */
const heStrs = poHe.contexts[''];
const heNoNikud: StringArrayMap = {};
for (const [key, val] of Object.entries(heStrs)) {
  heNoNikud[key] = [Locale.hebrewStripNikkud(val[0])];
}
const poHeNoNikud: LocaleData = {
  headers: poHe.headers,
  contexts: {'': heNoNikud},
};
Locale.addLocale('he-x-NoNikud', poHeNoNikud);
