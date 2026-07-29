import {hebrewStripNikkud} from './hebrewStripNikkud';
import poAshkenazi from './ashkenazi.po';
import poHe from './he.po';

/**
 * Metadata from the header block of a `.po` file. Only the two fields
 * gettext tooling emits by default are modelled; both are optional and
 * neither affects lookup in this package.
 */
export interface Headers {
  /** MIME type and charset, e.g. `'text/plain; charset=UTF-8'` */
  'content-type'?: string;
  /** gettext plural rule, e.g. `'nplurals=2; plural=(n!=1);'` */
  'plural-forms'?: string;
}

/**
 * Message IDs mapped to their translations. The value is an array
 * because gettext supports plural forms; this package reads only the
 * first element.
 */
export type StringArrayMap = Record<string, string[]>;

/**
 * Translations for a single locale, in the "compact" JSON shape produced
 * by `gettext-parser` from a `.po` file. Pass one of these to
 * {@link Locale.addLocale} or {@link Locale.addTranslations}.
 *
 * Translations live under the empty-string context; other gettext
 * contexts are ignored.
 * @example
 * import {LocaleData, Locale} from '@hebcal/hdate';
 * const poFr: LocaleData = {
 *   headers: {'plural-forms': 'nplurals=2; plural=(n>1);'},
 *   contexts: {'': {Shabbat: ['Chabbat'], Adar: ['Adar']}},
 * };
 * Locale.addLocale('fr', poFr);
 */
export interface LocaleData {
  /** Header metadata from the `.po` file */
  headers: Headers;
  /** gettext contexts; translations are read from the `''` context */
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
 *
 * The locale set that ships here covers only what this package needs:
 * month names, a handful of connective words, and the parts of speech
 * used by {@link HDate.render}. Packages built on top of it (such as
 * `@hebcal/core`) register their own holiday translations into the same
 * locales with {@link Locale.addTranslations}.
 *
 * Every method is static — `Locale` is a namespace, not something you
 * instantiate. Locale names are matched case-insensitively, and the
 * single letters `h`, `a` and `s` are accepted as aliases for `he`,
 * `ashkenazi` and `en` respectively.
 * @example
 * import {Locale, HDate, months} from '@hebcal/hdate';
 *
 * Locale.gettext('Cheshvan', 'he');        // 'חֶשְׁוָן'
 * Locale.gettext('Cheshvan', 'ashkenazi'); // 'Cheshvan'
 * Locale.ordinal(15, 'en');                // '15th'
 *
 * const hd = new HDate(15, months.CHESHVAN, 5769);
 * hd.render('en'); // '15th of Cheshvan, 5769'
 * hd.render('he'); // '15 חֶשְׁוָן, 5769'
 */
export class Locale {
  /**
   * Returns translation only if `locale` offers a non-empty translation for `id`.
   * Otherwise, returns `undefined`.
   * @param id Message ID to translate
   * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to no-op locale.
   * @example
   * Locale.lookupTranslation('Adar II', 'he-x-NoNikud'); // 'אדר ב׳'
   * Locale.lookupTranslation('Foobar', 'he-x-NoNikud');  // undefined
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
   * @example
   * Locale.gettext('Elul', 'he');          // 'אֱלוּל'
   * Locale.gettext('Tevet', 'ashkenazi');  // 'Teves'
   * Locale.gettext('Unknown', 'he');       // 'Unknown' (falls back to id)
   */
  static gettext(id: string, locale?: string): string {
    const text = this.lookupTranslation(id, locale);
    if (text === undefined) {
      return id;
    }
    return text;
  }

  /**
   * Register locale translations, replacing the locale entirely if it
   * was already registered. Use {@link Locale.addTranslations} to merge
   * into an existing locale instead.
   * @param locale Locale name (i.e.: `'he'`, `'fr'`)
   * @param data parsed data from a `.po` file.
   * @throws {TypeError} if `data` is not in the compact `.po` format
   * @example
   * import {Locale} from '@hebcal/hdate';
   * // typically `import poFr from './fr.po'` — inlined here for clarity
   * const poFr = {headers: {}, contexts: {'': {Shabbat: ['Chabbat']}}};
   * Locale.addLocale('fr', poFr);
   * Locale.gettext('Shabbat', 'fr'); // 'Chabbat'
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
   * @example
   * Locale.addTranslation('ashkenazi', 'Foobar', 'Quux');
   * Locale.gettext('Foobar', 'ashkenazi'); // 'Quux'
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
   *
   * The locale must already be registered (typically via `addLocale`);
   * to register a brand-new locale instead, call `addLocale` directly.
   * Use this method to merge an additional `.po` file (e.g. holiday
   * translations supplied by a separate `@hebcal/*` package) into an
   * existing locale.
   * @param locale Locale name (i.e: `'he'`, `'fr'`).
   * @param data parsed data from a `.po` file.
   * @throws {RangeError} if `locale` has not been registered
   * @throws {TypeError} if `data` is not in the compact `.po` format
   * @example
   * import {Locale} from '@hebcal/hdate';
   * Locale.addTranslations('ashkenazi', {
   *   headers: {},
   *   contexts: {'': {Sukkot: ['Sukkos'], Shavuot: ['Shavuos']}},
   * });
   * Locale.gettext('Sukkot', 'ashkenazi'); // 'Sukkos'
   * Locale.gettext('Tevet', 'ashkenazi');  // 'Teves' (existing translations kept)
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
   * @example
   * Locale.getLocaleNames(); // ['ashkenazi', 'en', 'he', 'he-x-nonikud']
   */
  static getLocaleNames(): string[] {
    const keys = Array.from(locales.keys());
    return keys.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Checks whether a locale has been registered
   * @param locale Locale name (i.e: `'he'`, `'fr'`).
   * @example
   * Locale.hasLocale('he'); // true
   * Locale.hasLocale('fr'); // false
   */
  static hasLocale(locale: string): boolean {
    const locale1 = checkLocale(locale);
    return locales.has(locale1);
  }

  /**
   * Renders a number in ordinal, such as 1st, 2nd or 3rd
   * @param [locale] Optional locale name (i.e: `'he'`, `'fr'`). Defaults to no-op locale.
   * @example
   * Locale.ordinal(3, 'en'); // '3rd'
   * Locale.ordinal(3, 'es'); // '3º'
   * Locale.ordinal(3, 'fr'); // '3.'
   * Locale.ordinal(3, 'he'); // '3'
   */
  static ordinal(n: number, locale?: string): string {
    const locale1 = checkLocale(locale || '');
    if (locale1 === 'en' || locale1.startsWith('ashkenazi')) {
      return getEnOrdinal(n);
    } else if (Locale.isHebrewLocale(locale1)) {
      return String(n);
    } else if (locale1 === 'es') {
      return n + 'º';
    }
    return n + '.';
  }

  /**
   * Removes nekudot from Hebrew string
   * @example
   * Locale.hebrewStripNikkud('אֱלוּל'); // 'אלול'
   */
  static hebrewStripNikkud(str: string): string {
    return hebrewStripNikkud(str);
  }

  /**
   * Returns a new `LocaleData` derived from `data` with niqqud (vowel
   * points) stripped from every translation value. The input is not
   * modified.
   *
   * This is the helper used internally to build the `he-x-NoNikud`
   * locale from `he`; call it when registering a derived "no nikud"
   * variant of a custom Hebrew-script locale.
   * @param data locale data to copy
   * @returns a new `LocaleData` with niqqud removed
   * @see {@link Locale.hebrewStripNikkud}
   * @example
   * import {Locale} from '@hebcal/hdate';
   * const withNikud = {
   *   headers: {},
   *   contexts: {'': {Elul: ['אֱלוּל']}},
   * };
   * const stripped = Locale.copyLocaleNoNikud(withNikud);
   * stripped.contexts[''].Elul[0];   // 'אלול'
   * withNikud.contexts[''].Elul[0];  // 'אֱלוּל' (input unchanged)
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

  /**
   * Returns true if `locale` is a Hebrew locale (i.e. `he` or `he-x-NoNikud`)
   * @example
   * Locale.isHebrewLocale('he');           // true
   * Locale.isHebrewLocale('he-x-NoNikud'); // true
   * Locale.isHebrewLocale('en');           // false
   */
  static isHebrewLocale(locale?: string): boolean {
    if (typeof locale !== 'string') {
      return false;
    }
    locale = alias[locale] || locale;
    locale = locale.toLowerCase();
    return locale.startsWith('he');
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
