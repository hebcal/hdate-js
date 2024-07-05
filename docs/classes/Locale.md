[**@hebcal/hdate**](../README.md) • **Docs**

***

[@hebcal/hdate](../globals.md) / Locale

# Class: Locale

A locale in Hebcal is used for translations/transliterations of
holidays. `@hebcal/hdate` supports four locales by default
* `en` - default, Sephardic transliterations (e.g. "Shabbat")
* `ashkenazi` - Ashkenazi transliterations (e.g. "Shabbos")
* `he` - Hebrew (e.g. "שַׁבָּת")
* `he-x-NoNikud` - Hebrew without nikud (e.g. "שבת")

## Constructors

### new Locale()

> **new Locale**(): [`Locale`](Locale.md)

#### Returns

[`Locale`](Locale.md)

## Methods

### addLocale()

> `static` **addLocale**(`locale`, `data`): `void`

Register locale translations.

#### Parameters

• **locale**: `string`

Locale name (i.e.: `'he'`, `'fr'`)

• **data**: [`LocaleData`](../interfaces/LocaleData.md)

parsed data from a `.po` file.

#### Returns

`void`

#### Defined in

[locale.ts:83](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L83)

***

### addTranslation()

> `static` **addTranslation**(`locale`, `id`, `translation`): `void`

Adds a translation to `locale`, replacing any previous translation.

#### Parameters

• **locale**: `string`

Locale name (i.e: `'he'`, `'fr'`).

• **id**: `string`

Message ID to translate

• **translation**: `string` \| `string`[]

Translation text

#### Returns

`void`

#### Defined in

[locale.ts:99](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L99)

***

### addTranslations()

> `static` **addTranslations**(`locale`, `data`): `void`

Adds multiple translations to `locale`, replacing any previous translations.

#### Parameters

• **locale**: `string`

Locale name (i.e: `'he'`, `'fr'`).

• **data**: [`LocaleData`](../interfaces/LocaleData.md)

parsed data from a `.po` file.

#### Returns

`void`

#### Defined in

[locale.ts:126](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L126)

***

### getLocaleName()

> `static` **getLocaleName**(): `string`

Returns the name of the active locale (i.e. 'he', 'ashkenazi', 'fr')

#### Returns

`string`

#### Defined in

[locale.ts:160](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L160)

***

### getLocaleNames()

> `static` **getLocaleNames**(): `string`[]

Returns the names of registered locales

#### Returns

`string`[]

#### Defined in

[locale.ts:167](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L167)

***

### gettext()

> `static` **gettext**(`id`, `locale`?): `string`

By default, if no translation was found, returns `id`.

#### Parameters

• **id**: `string`

Message ID to translate

• **locale?**: `string`

Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale.

#### Returns

`string`

#### Defined in

[locale.ts:70](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L70)

***

### hebrewStripNikkud()

> `static` **hebrewStripNikkud**(`str`): `string`

Removes nekudot from Hebrew string

#### Parameters

• **str**: `string`

#### Returns

`string`

#### Defined in

[locale.ts:211](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L211)

***

### lookupTranslation()

> `static` **lookupTranslation**(`id`, `locale`?): `string`

Returns translation only if `locale` offers a non-empty translation for `id`.
Otherwise, returns `undefined`.

#### Parameters

• **id**: `string`

Message ID to translate

• **locale?**: `string`

Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale.

#### Returns

`string`

#### Defined in

[locale.ts:56](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L56)

***

### ordinal()

> `static` **ordinal**(`n`, `locale`?): `string`

Renders a number in ordinal, such as 1st, 2nd or 3rd

#### Parameters

• **n**: `number`

• **locale?**: `string`

Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale.

#### Returns

`string`

#### Defined in

[locale.ts:176](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L176)

***

### useLocale()

> `static` **useLocale**(`locale`): [`StringArrayMap`](../interfaces/StringArrayMap.md)

Activates a locale. Throws an error if the locale has not been previously added.
After setting the locale to be used, all strings marked for translations
will be represented by the corresponding translation in the specified locale.

#### Parameters

• **locale**: `string`

Locale name (i.e: `'he'`, `'fr'`)

#### Returns

[`StringArrayMap`](../interfaces/StringArrayMap.md)

#### Defined in

[locale.ts:146](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/locale.ts#L146)
