# @hebcal/hdate

Converts between Hebrew and Gregorian dates using the Rata Die (R.D.) algorithm by Dershowitz and Reingold.

[![Build Status](https://github.com/hebcal/hdate-js/actions/workflows/node.js.yml/badge.svg)](https://github.com/hebcal/hdate-js/actions/workflows/node.js.yml)

This is the calendar core that the rest of the [Hebcal](https://github.com/hebcal)
ecosystem is built on. It deliberately does one thing: the arithmetic of the
Hebrew calendar and its correspondence to the Gregorian calendar. Holidays,
candle-lighting times, Torah readings and zmanim live in
[@hebcal/core](https://github.com/hebcal/hebcal-es6) and its siblings, which
depend on this package.

## Installation

```bash
$ npm install @hebcal/hdate
```

## Synopsis

```javascript
import {HDate, months} from '@hebcal/hdate';

const hd = new HDate(new Date(2008, 10, 13)); // 13 November 2008
hd.toString(); // '15 Cheshvan 5769'
hd.getFullYear(); // 5769
hd.getMonthName(); // 'Cheshvan'
hd.render('he'); // '15 חֶשְׁוָן, 5769'

const purim = new HDate(14, months.ADAR_II, 5784);
purim.greg(); // Sun Mar 24 2024
```

## What's in the package

### 1. Hebrew and Gregorian date conversion

The [HDate](https://hebcal.github.io/api/hdate/classes/HDate.html) class is the
main entry point. An `HDate` is a year, month and day in the Hebrew calendar —
no time of day, no location, no time zone. It converts to and from a JavaScript
`Date`, does calendar arithmetic, and renders itself in several languages.

```javascript
import {HDate, months} from '@hebcal/hdate';

const hd = new HDate(15, months.CHESHVAN, 5769);
hd.greg(); // Thu Nov 13 2008
hd.abs(); // 733359 (R.D. day number)
hd.getDay(); // 4 (Thursday)
hd.daysInMonth(); // 29

hd.add(1, 'year').toString(); // '15 Cheshvan 5770'
hd.subtract(1, 'weeks').toString(); // '8 Cheshvan 5769'
hd.onOrBefore(6).greg(); // the Shabbat on or before, Sat Nov 08 2008
hd.deltaDays(new HDate(new Date())); // difference in days
```

Underneath, everything is expressed in **Rata Die** (R.D.) day numbers — a plain
count of days where R.D. 1 is Monday, 1 January 1. R.D. is the common currency
between the two calendars, and the low-level functions are exported for code
that wants to skip the object wrapper:

```javascript
import {hebrew2abs, abs2hebrew, greg2abs, abs2greg, months} from '@hebcal/hdate';

const abs = greg2abs(new Date(2008, 10, 13)); // 733359
abs2hebrew(abs); // {yy: 5769, mm: 8, dd: 15}
hebrew2abs(5769, months.CHESHVAN, 15); // 733359
abs2greg(733359); // Thu Nov 13 2008
```

Alongside these are the predicates and counts that describe the shape of a
Hebrew year — `isLeapYear`, `monthsInYear`, `daysInYear`, `daysInMonth`,
`longCheshvan`, `shortKislev`, `getMonthName` and `monthFromName`. The Hebrew
year is lunisolar: 7 years in each 19-year Metonic cycle gain a 13th month, and
a year runs 353–355 days (383–385 in a leap year) depending on which of Cheshvan
and Kislev is lengthened or shortened.

```javascript
import {isLeapYear, daysInYear, getMonthName, months} from '@hebcal/hdate';

isLeapYear(5784); // true
daysInYear(5784); // 383
getMonthName(months.ADAR_I, 5784); // 'Adar I' (leap year)
getMonthName(months.ADAR_I, 5783); // 'Adar'   (common year)
```

### 2. Yahrzeit and anniversary calculations, and why they differ

A yahrzeit (the anniversary of a death) and a birthday are **not** the same
calculation, even though both find "the same Hebrew date in a later year".
Hebcal implements both as defined in *Calendrical Calculations* by Reingold and
Dershowitz.

The difference shows up when the original date does not exist in the target
year — the 30th of a month that has only 29 days that year, or Adar I in a year
with no Adar I:

- a **yahrzeit** moves **earlier**, to the last day of the preceding month, so
  the observance is never later than the day itself;
- a **birthday** is **postponed**, to the first of the following month.

Someone who died on 30 Adar I 5774 has a yahrzeit on 30 Sh'vat in the common
year 5780; someone born that day has their birthday on 1 Nisan 5780 — nearly a
month apart:

```javascript
import {yahrzeit, birthdayOrAnniversary} from '@hebcal/hdate';

const dt = new Date(2014, 2, 2); // 30 Adar I 5774

yahrzeit(5780, dt).toString(); // '30 Sh\'vat 5780'
birthdayOrAnniversary(5780, dt).toString(); // '1 Nisan 5780'
```

There is one more asymmetry, and it follows from what the two things actually
are. `birthdayOrAnniversary()` accepts the original year and returns the
original date, because a person's birth date is a meaningful day in its own
right — it is the day they were born, not merely the zeroth anniversary of it.
A death has no counterpart to that. A yahrzeit *is* an anniversary; the earliest
one that exists is the first, and the day of the death itself is not a yahrzeit.
So there is nothing for a "zeroth" yahrzeit to denote, and `yahrzeit()` returns
`undefined` for the year of death:

```javascript
const dt = new Date(2014, 2, 2); // 30 Adar I 5774

birthdayOrAnniversary(5774, dt).toString(); // '30 Adar I 5774' — the birth date
yahrzeit(5774, dt); // undefined — no such thing as a yahrzeit in the year of death
yahrzeit(5775, dt).toString(); // '30 Sh\'vat 5775' — the first yahrzeit
```

Both functions accept a Gregorian `Date`, a `{yy, mm, dd}` object, an `HDate`,
or an R.D. day number, and neither modifies the value you pass, so one original
date can generate a run of years:

```javascript
import {HDate, months, yahrzeit} from '@hebcal/hdate';

const death = new HDate(15, months.ADAR_II, 5784);
[5785, 5786, 5787].map(year => yahrzeit(year, death).toString());
// ['15 Adar 5785', '15 Adar 5786', '15 Adar II 5787']
```

`yahrzeit()` and `birthdayOrAnniversary()` return an `HDate`. The
`SimpleHebrewDate` variants `getYahrzeitHD()` and `getBirthdayHD()` return plain
`{yy, mm, dd}` objects and carry the full description of the algorithm and its
edge cases. The older `getYahrzeit()` and `getBirthdayOrAnniversary()`, which
return a Gregorian `Date`, are deprecated.

### 3. Locale

`Locale` holds translations and transliterations. Four locales are registered
out of the box:

| Locale | Description | `Locale.gettext('Tevet', …)` |
| --- | --- | --- |
| `en` | default, Sephardic transliterations | `Tevet` |
| `ashkenazi` | Ashkenazi transliterations | `Teves` |
| `he` | Hebrew with nikud | `טֵבֵת` |
| `he-x-NoNikud` | Hebrew without nikud | `טבת` |

```javascript
import {HDate, Locale, months} from '@hebcal/hdate';

Locale.gettext('Cheshvan', 'he'); // 'חֶשְׁוָן'
Locale.ordinal(15, 'en'); // '15th'

const hd = new HDate(15, months.TEVET, 5769);
hd.render('en'); // '15th of Tevet, 5769'
hd.render('ashkenazi'); // '15th of Teves, 5769'
hd.render('he'); // '15 טֵבֵת, 5769'
hd.renderGematriya(); // 'ט״ו טֵבֵת תשס״ט'
```

What ships here covers only what this package needs — month names and the words
used to render a date. Packages built on top register their own translations
into the same locales with `Locale.addLocale()` and `Locale.addTranslations()`.

Hebrew numerals are available directly through `gematriya()` and
`gematriyaStrToNum()`, and `HDate.fromGematriyaString()` parses a date written
in Hebrew letters.

```javascript
import {gematriya, gematriyaStrToNum, HDate} from '@hebcal/hdate';

gematriya(5769); // 'תשס״ט' (thousands omitted in the current millennium)
gematriyaStrToNum('תשס״ט'); // 769
HDate.fromGematriyaString('כ״ז בְּתַמּוּז תשפ״ג').toString(); // '27 Tamuz 5783'
```

### 4. Helper utilities

A few date and string helpers that Hebcal needed internally are exported rather
than duplicated in every downstream package. They have nothing to do with the
Hebrew calendar, but they are here and supported:

```javascript
import {getTimezoneOffset, getPseudoISO, isoDateString, pad2, pad4} from '@hebcal/hdate';

const dt = new Date(Date.UTC(2020, 0, 15, 12));

// minutes a time zone is offset from UTC on a given date, DST included
getTimezoneOffset('America/New_York', dt); // 300 (UTC-5)
getTimezoneOffset('Asia/Jerusalem', dt); // -120 (UTC+2)

// like toISOString(), but in the named time zone rather than UTC.
// the trailing Z is a lie kept for shape compatibility
getPseudoISO('America/New_York', dt); // '2020-01-15T07:00:00Z'

// YYYY-MM-DD from a date's *local* fields, unlike toISOString(),
// which is in UTC and can report the previous or next day
isoDateString(new Date(2008, 10, 13)); // '2008-11-13'

// zero-padding that also handles negative years the way Date does
pad2(3); // '03'
pad4(2024); // '2024'
pad4(-37); // '-000037'
```

## The proleptic Gregorian calendar

Hebcal uses the **proleptic Gregorian calendar**: the Gregorian leap-year rules
are applied uniformly to every year, including years long before the Gregorian
calendar existed. This matters for historical dates.

The Gregorian calendar was introduced by Pope Gregory XIII in 1582 to correct
the drift the Julian calendar had accumulated. Ten days were dropped: in the
countries that adopted it immediately, Thursday 4 October 1582 was followed by
Friday 15 October 1582. Adoption elsewhere took centuries — Britain and its
colonies did not switch until September 1752, by which point the correction had
grown to eleven days, and Wednesday 2 September 1752 was followed by Thursday
14 September 1752.

**Hebcal does not take this into account.** There is no ten-day (or eleven-day)
discontinuity anywhere in the sequence, and no date is rejected as
non-existent. R.D. 1 is Monday, 1 January 1 on the proleptic Gregorian calendar,
and every day since has a consecutive number.

The practical consequence: for dates before a given country's adoption of the
Gregorian calendar, the Gregorian dates this library reports will **not** match
dates as they were written at the time, which were Julian. Around 1582 the
difference is ten days, shrinking as you go further back. Hebrew dates
themselves are unaffected — the Hebrew calendar has its own arithmetic, and only
its projection onto the Gregorian calendar is at issue.

This is the same convention JavaScript's own `Date` uses, so `new Date(1582, 9,
4)` and this library agree with each other; both are proleptic.

## Rata Die

Everything reduces to R.D. day numbers, so a conversion between calendars is
just two lookups against a shared integer. R.D. 1 is the imaginary date Monday,
1 January 1 (proleptic Gregorian); the Hebrew epoch, 1 Tishrei of year 1, falls
on 7 September −3760.

```javascript
import {greg2abs, hebrew2abs, months} from '@hebcal/hdate';

greg2abs(new Date(2008, 10, 13)); // 733359
hebrew2abs(5769, months.CHESHVAN, 15); // 733359 — the same day
```

Note that an R.D. number identifies a **daytime** date. The Hebrew day begins at
sundown the previous evening: 15 Cheshvan 5769 began at sundown on 12 November
2008 and ran through 13 November 2008, and this library reports the 13th. Use
`Zmanim` from `@hebcal/core` if you need the actual sundown.

See <https://en.wikipedia.org/wiki/Rata_Die>.

## [API Documentation](https://hebcal.github.io/api/hdate/index.html)
