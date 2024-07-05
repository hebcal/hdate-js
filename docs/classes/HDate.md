[**@hebcal/hdate**](../README.md) • **Docs**

***

[@hebcal/hdate](../globals.md) / HDate

# Class: HDate

Represents a Hebrew date

## Constructors

### new HDate()

> **new HDate**(`day`?, `month`?, `year`?): [`HDate`](HDate.md)

Create a Hebrew date. There are 3 basic forms for the `HDate()` constructor.

1. No parameters - represents the current Hebrew date at time of instantiation
2. One parameter
   * `Date` - represents the Hebrew date corresponding to the Gregorian date using
      local time. Hours, minutes, seconds and milliseconds are ignored.
   * `HDate` - clones a copy of the given Hebrew date
   * `number` - Converts absolute R.D. days to Hebrew date.
      R.D. 1 == the imaginary date January 1, 1 (Gregorian)
3. Three parameters: Hebrew day, Hebrew month, Hebrew year. Hebrew day should
   be a number between 1-30, Hebrew month can be a number or string, and
   Hebrew year is always a number.

#### Parameters

• **day?**: `number` \| `Date` \| [`SimpleHebrewDate`](../type-aliases/SimpleHebrewDate.md) \| [`HDate`](HDate.md)

Day of month (1-30) if a `number`.
  If a `Date` is specified, represents the Hebrew date corresponding to the
  Gregorian date using local time.
  If an `HDate` is specified, clones a copy of the given Hebrew date.

• **month?**: `string` \| `number`

Hebrew month of year (1=NISAN, 7=TISHREI)

• **year?**: `number`

Hebrew year

#### Returns

[`HDate`](HDate.md)

#### Example

```ts
import {HDate, months} from '@hebcal/hdate';

const hd1 = new HDate();
const hd2 = new HDate(new Date(2008, 10, 13));
const hd3 = new HDate(15, 'Cheshvan', 5769);
const hd4 = new HDate(15, months.CHESHVAN, 5769);
const hd5 = new HDate(733359); // ==> 15 Cheshvan 5769
const monthName = 'אייר';
const hd6 = new HDate(5, monthName, 5773);
```

#### Defined in

[hdate.ts:89](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L89)

## Properties

### dd

> **dd**: `number`

Hebrew day within the month (1-30)

#### Defined in

[hdate.ts:55](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L55)

***

### mm

> **mm**: `number`

Hebrew month of year (1=NISAN, 7=TISHREI)

#### Defined in

[hdate.ts:53](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L53)

***

### rd?

> `optional` **rd**: `number`

absolute Rata Die (R.D.) days

#### Defined in

[hdate.ts:57](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L57)

***

### yy

> **yy**: `number`

Hebrew year, 1-9999

#### Defined in

[hdate.ts:51](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L51)

## Methods

### abs()

> **abs**(): `number`

Returns R.D. (Rata Die) fixed days.
R.D. 1 == Monday, January 1, 1 (Gregorian)
Note also that R.D. = Julian Date − 1,721,424.5
https://en.wikipedia.org/wiki/Rata_Die#Dershowitz_and_Reingold

#### Returns

`number`

#### Defined in

[hdate.ts:193](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L193)

***

### add()

> **add**(`amount`, `units`): [`HDate`](HDate.md)

Returns a cloned `HDate` object with a specified amount of time added

Units are case insensitive, and support plural and short forms.
Note, short forms are case sensitive.

| Unit | Shorthand | Description
| --- | --- | --- |
| `day` | `d` | days |
| `week` | `w` | weeks |
| `month` | `M` | months |
| `year` | `y` | years |

#### Parameters

• **amount**: `string` \| `number`

• **units**: `string` = `'d'`

#### Returns

[`HDate`](HDate.md)

#### Defined in

[hdate.ts:351](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L351)

***

### after()

> **after**(`dow`): [`HDate`](HDate.md)

Returns an `HDate` representing the a dayNumber after the current date.
Sunday=0, Saturday=6

#### Parameters

• **dow**: `number`

day of week

#### Returns

[`HDate`](HDate.md)

#### Example

```ts
new HDate(new Date('Wednesday February 19, 2014')).after(6).greg() // Sat Feb 22 2014
new HDate(new Date('Saturday February 22, 2014')).after(6).greg() // Sat Mar 01 2014
new HDate(new Date('Sunday February 23, 2014')).after(6).greg() // Sat Mar 01 2014
```

#### Defined in

[hdate.ts:320](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L320)

***

### before()

> **before**(`dow`): [`HDate`](HDate.md)

Returns an `HDate` representing the a dayNumber before the current date.
Sunday=0, Saturday=6

#### Parameters

• **dow**: `number`

day of week

#### Returns

[`HDate`](HDate.md)

#### Example

```ts
new HDate(new Date('Wednesday February 19, 2014')).before(6).greg() // Sat Feb 15 2014
```

#### Defined in

[hdate.ts:269](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L269)

***

### daysInMonth()

> **daysInMonth**(): `number`

Number of days in the month of this Hebrew date

#### Returns

`number`

#### Defined in

[hdate.ts:162](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L162)

***

### deltaDays()

> **deltaDays**(`other`): `number`

Returns the difference in days between the two given HDates.

The result is positive if `this` date is comes chronologically
after the `other` date, and negative
if the order of the two dates is reversed.

The result is zero if the two dates are identical.

#### Parameters

• **other**: [`HDate`](HDate.md)

Hebrew date to compare

#### Returns

`number`

#### Example

```ts
import {HDate, months} from '@hebcal/hdate';

const hd1 = new HDate(25, months.KISLEV, 5770);
const hd2 = new HDate(15, months.CHESHVAN, 5769);
const days = hd1.deltaDays(hd2); // 394
```

#### Defined in

[hdate.ts:415](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L415)

***

### getDate()

> **getDate**(): `number`

Gets the day within the month (1-30)

#### Returns

`number`

#### Defined in

[hdate.ts:169](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L169)

***

### getDay()

> **getDay**(): `number`

Gets the day of the week. 0=Sunday, 6=Saturday

#### Returns

`number`

#### Defined in

[hdate.ts:176](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L176)

***

### getFullYear()

> **getFullYear**(): `number`

Gets the Hebrew year of this Hebrew date

#### Returns

`number`

#### Defined in

[hdate.ts:133](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L133)

***

### getMonth()

> **getMonth**(): `number`

Gets the Hebrew month (1=NISAN, 7=TISHREI) of this Hebrew date

#### Returns

`number`

#### Defined in

[hdate.ts:147](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L147)

***

### getMonthName()

> **getMonthName**(): `string`

Returns a transliterated Hebrew month name, e.g. `'Elul'` or `'Cheshvan'`.

#### Returns

`string`

#### Defined in

[hdate.ts:215](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L215)

***

### getTishreiMonth()

> **getTishreiMonth**(): `number`

The Tishrei-based month of the date. 1 is Tishrei, 7 is Nisan, 13 is Elul in a leap year

#### Returns

`number`

#### Defined in

[hdate.ts:154](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L154)

***

### greg()

> **greg**(): `Date`

Converts to Gregorian date

#### Returns

`Date`

#### Defined in

[hdate.ts:183](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L183)

***

### isLeapYear()

> **isLeapYear**(): `boolean`

Tests if this date occurs during a leap year

#### Returns

`boolean`

#### Defined in

[hdate.ts:140](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L140)

***

### isSameDate()

> **isSameDate**(`other`): `boolean`

Compares this date to another date, returning `true` if the dates match.

#### Parameters

• **other**: [`HDate`](HDate.md)

Hebrew date to compare

#### Returns

`boolean`

#### Defined in

[hdate.ts:426](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L426)

***

### nearest()

> **nearest**(`dow`): [`HDate`](HDate.md)

Returns an `HDate` representing the nearest dayNumber to the current date
Sunday=0, Saturday=6

#### Parameters

• **dow**: `number`

day of week

#### Returns

[`HDate`](HDate.md)

#### Example

```ts
new HDate(new Date('Wednesday February 19, 2014')).nearest(6).greg() // Sat Feb 22 2014
new HDate(new Date('Tuesday February 18, 2014')).nearest(6).greg() // Sat Feb 15 2014
```

#### Defined in

[hdate.ts:294](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L294)

***

### next()

> **next**(): [`HDate`](HDate.md)

Returns the next Hebrew date

#### Returns

[`HDate`](HDate.md)

#### Defined in

[hdate.ts:327](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L327)

***

### onOrAfter()

> **onOrAfter**(`dow`): [`HDate`](HDate.md)

Returns an `HDate` representing the a dayNumber on or after the current date.
Sunday=0, Saturday=6

#### Parameters

• **dow**: `number`

day of week

#### Returns

[`HDate`](HDate.md)

#### Example

```ts
new HDate(new Date('Wednesday February 19, 2014')).onOrAfter(6).greg() // Sat Feb 22 2014
new HDate(new Date('Saturday February 22, 2014')).onOrAfter(6).greg() // Sat Feb 22 2014
new HDate(new Date('Sunday February 23, 2014')).onOrAfter(6).greg() // Sat Mar 01 2014
```

#### Defined in

[hdate.ts:307](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L307)

***

### onOrBefore()

> **onOrBefore**(`dow`): [`HDate`](HDate.md)

Returns an `HDate` representing the a dayNumber on or before the current date.
Sunday=0, Saturday=6

#### Parameters

• **dow**: `number`

day of week

#### Returns

[`HDate`](HDate.md)

#### Example

```ts
new HDate(new Date('Wednesday February 19, 2014')).onOrBefore(6).greg() // Sat Feb 15 2014
new HDate(new Date('Saturday February 22, 2014')).onOrBefore(6).greg() // Sat Feb 22 2014
new HDate(new Date('Sunday February 23, 2014')).onOrBefore(6).greg() // Sat Feb 22 2014
```

#### Defined in

[hdate.ts:282](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L282)

***

### prev()

> **prev**(): [`HDate`](HDate.md)

Returns the previous Hebrew date

#### Returns

[`HDate`](HDate.md)

#### Defined in

[hdate.ts:334](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L334)

***

### render()

> **render**(`locale`?, `showYear`?): `string`

Renders this Hebrew date as a translated or transliterated string,
including ordinal e.g. `'15th of Cheshvan, 5769'`.

#### Parameters

• **locale?**: `string`

Optional locale name (defaults to active locale).

• **showYear?**: `boolean` = `true`

Display year (defaults to true).

#### Returns

`string`

#### Example

```ts
import {HDate, months} from '@hebcal/hdate';

const hd = new HDate(15, months.CHESHVAN, 5769);
console.log(hd.render('en')); // '15th of Cheshvan, 5769'
console.log(hd.render('he')); // '15 חֶשְׁוָן, 5769'
```

#### Defined in

[hdate.ts:231](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L231)

***

### renderGematriya()

> **renderGematriya**(`suppressNikud`): `string`

Renders this Hebrew date in Hebrew gematriya, regardless of locale.

#### Parameters

• **suppressNikud**: `boolean` = `false`

#### Returns

`string`

#### Example

```ts
import {HDate, months} from '@hebcal/hdate';
const hd = new HDate(15, months.CHESHVAN, 5769);
console.log(hd.renderGematriya()); // 'ט״ו חֶשְׁוָן תשס״ט'
```

#### Defined in

[hdate.ts:254](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L254)

***

### subtract()

> **subtract**(`amount`, `units`): [`HDate`](HDate.md)

Returns a cloned `HDate` object with a specified amount of time subracted

Units are case insensitive, and support plural and short forms.
Note, short forms are case sensitive.

| Unit | Shorthand | Description
| --- | --- | --- |
| `day` | `d` | days |
| `week` | `w` | weeks |
| `month` | `M` | months |
| `year` | `y` | years |

#### Parameters

• **amount**: `number`

• **units**: `string` = `'d'`

#### Returns

[`HDate`](HDate.md)

#### Example

```ts
import {HDate, months} from '@hebcal/hdate';

const hd1 = new HDate(15, months.CHESHVAN, 5769);
const hd2 = hd1.add(1, 'weeks'); // 7 Kislev 5769
const hd3 = hd1.add(-3, 'M'); // 30 Av 5768
```

#### Defined in

[hdate.ts:395](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L395)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Defined in

[hdate.ts:435](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L435)

***

### dayOnOrBefore()

> `static` **dayOnOrBefore**(`dayOfWeek`, `absdate`): `number`

Note: Applying this function to d+6 gives us the DAYNAME on or after an
absolute day d. Similarly, applying it to d+3 gives the DAYNAME nearest to
absolute date d, applying it to d-1 gives the DAYNAME previous to absolute
date d, and applying it to d+7 gives the DAYNAME following absolute date d.

#### Parameters

• **dayOfWeek**: `number`

• **absdate**: `number`

#### Returns

`number`

#### Defined in

[hdate.ts:537](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L537)

***

### daysInMonth()

> `static` **daysInMonth**(`month`, `year`): `number`

Number of days in Hebrew month in a given year (29 or 30)

#### Parameters

• **month**: `number`

Hebrew month (e.g. months.TISHREI)

• **year**: `number`

Hebrew year

#### Returns

`number`

#### Defined in

[hdate.ts:463](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L463)

***

### daysInYear()

> `static` **daysInYear**(`year`): `number`

Number of days in the hebrew YEAR

#### Parameters

• **year**: `number`

Hebrew year

#### Returns

`number`

#### Defined in

[hdate.ts:497](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L497)

***

### fromGematriyaString()

> `static` **fromGematriyaString**(`str`, `currentThousands`): [`HDate`](HDate.md)

Construct a new instance of `HDate` from a Gematriya-formatted string

#### Parameters

• **str**: `string`

• **currentThousands**: `number` = `5000`

#### Returns

[`HDate`](HDate.md)

#### Example

```ts
HDate.fromGematriyaString('כ״ז בְּתַמּוּז תשפ״ג') // 27 Tamuz 5783
 HDate.fromGematriyaString('כ׳ סיון תש״ד') // 20 Sivan 5704
 HDate.fromGematriyaString('ה׳ אִיָיר תש״ח') // 5 Iyyar 5708
```

#### Defined in

[hdate.ts:560](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L560)

***

### getMonthName()

> `static` **getMonthName**(`month`, `year`): `string`

Returns a transliterated string name of Hebrew month in year,
for example 'Elul' or 'Cheshvan'.

#### Parameters

• **month**: `number`

Hebrew month (e.g. months.TISHREI)

• **year**: `number`

Hebrew year

#### Returns

`string`

#### Defined in

[hdate.ts:473](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L473)

***

### hebrew2abs()

> `static` **hebrew2abs**(`year`, `month`, `day`): `number`

Converts Hebrew date to R.D. (Rata Die) fixed days.
R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
Calendar.

#### Parameters

• **year**: `number`

Hebrew year

• **month**: `number`

Hebrew month

• **day**: `number`

Hebrew date (1-30)

#### Returns

`number`

#### Defined in

[hdate.ts:208](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L208)

***

### isHDate()

> `static` **isHDate**(`obj`): `boolean`

Tests if the object is an instance of `HDate`

#### Parameters

• **obj**: `any`

#### Returns

`boolean`

#### Defined in

[hdate.ts:544](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L544)

***

### isLeapYear()

> `static` **isLeapYear**(`year`): `boolean`

Returns true if Hebrew year is a leap year

#### Parameters

• **year**: `number`

Hebrew year

#### Returns

`boolean`

#### Defined in

[hdate.ts:446](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L446)

***

### longCheshvan()

> `static` **longCheshvan**(`year`): `boolean`

true if Cheshvan is long in Hebrew year

#### Parameters

• **year**: `number`

Hebrew year

#### Returns

`boolean`

#### Defined in

[hdate.ts:505](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L505)

***

### monthFromName()

> `static` **monthFromName**(`monthName`): `number`

Converts Hebrew month string name to numeric

#### Parameters

• **monthName**: `string` \| `number`

#### Returns

`number`

#### Defined in

[hdate.ts:520](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L520)

***

### monthNum()

> `static` **monthNum**(`month`): `number`

Returns the Hebrew month number (NISAN=1, TISHREI=7)

#### Parameters

• **month**: `string` \| `number`

A number, or Hebrew month name string

#### Returns

`number`

#### Defined in

[hdate.ts:481](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L481)

***

### monthsInYear()

> `static` **monthsInYear**(`year`): `number`

Number of months in this Hebrew year (either 12 or 13 depending on leap year)

#### Parameters

• **year**: `number`

Hebrew year

#### Returns

`number`

#### Defined in

[hdate.ts:454](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L454)

***

### shortKislev()

> `static` **shortKislev**(`year`): `boolean`

true if Kislev is short in Hebrew year

#### Parameters

• **year**: `number`

Hebrew year

#### Returns

`boolean`

#### Defined in

[hdate.ts:513](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/hdate.ts#L513)
