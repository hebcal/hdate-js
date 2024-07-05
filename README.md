# @hebcal/hdate
converts between Hebrew and Gregorian dates using Rata Die (R.D.) algorithm by Dershowitz and Reingold

[![Build Status](https://github.com/hebcal/hdate-js/actions/workflows/node.js.yml/badge.svg)](https://github.com/hebcal/hdate-js/actions/workflows/node.js.yml)

## Installation
```bash
$ npm install @hebcal/hdate
```

## Synopsis
```javascript
import {greg, abs2hebrew} from '@hebcal/hdate';

const date = new Date(2008, 10, 13); // 13 November 2008
const abs = greg.greg2abs(date);
const hdate = abs2hebrew(abs); // {yy: 5769, mm: CHESHVAN, dd: 15}
```

## Namespaces

- [greg](docs/namespaces/greg/README.md)

## Enumerations

- [months](docs/enumerations/months.md)

## Classes

- [HDate](docs/classes/HDate.md)
- [Locale](docs/classes/Locale.md)

## Interfaces

- [Headers](docs/interfaces/Headers.md)
- [LocaleData](docs/interfaces/LocaleData.md)
- [StringArrayMap](docs/interfaces/StringArrayMap.md)

## Type Aliases

- [Molad](docs/type-aliases/Molad.md)
- [OmerLang](docs/type-aliases/OmerLang.md)
- [SimpleHebrewDate](docs/type-aliases/SimpleHebrewDate.md)

## Functions

- [abs2hebrew](docs/functions/abs2hebrew.md)
- [daysInMonth](docs/functions/daysInMonth.md)
- [daysInYear](docs/functions/daysInYear.md)
- [elapsedDays](docs/functions/elapsedDays.md)
- [gematriya](docs/functions/gematriya.md)
- [gematriyaStrToNum](docs/functions/gematriyaStrToNum.md)
- [getBirthdayHD](docs/functions/getBirthdayHD.md)
- [getBirthdayOrAnniversary](docs/functions/getBirthdayOrAnniversary.md)
- [getMonthName](docs/functions/getMonthName.md)
- [getPseudoISO](docs/functions/getPseudoISO.md)
- [getTimezoneOffset](docs/functions/getTimezoneOffset.md)
- [getYahrzeit](docs/functions/getYahrzeit.md)
- [getYahrzeitHD](docs/functions/getYahrzeitHD.md)
- [hd2abs](docs/functions/hd2abs.md)
- [hebrew2abs](docs/functions/hebrew2abs.md)
- [isLeapYear](docs/functions/isLeapYear.md)
- [longCheshvan](docs/functions/longCheshvan.md)
- [molad](docs/functions/molad.md)
- [monthFromName](docs/functions/monthFromName.md)
- [monthsInYear](docs/functions/monthsInYear.md)
- [omerEmoji](docs/functions/omerEmoji.md)
- [omerSefira](docs/functions/omerSefira.md)
- [omerTodayIs](docs/functions/omerTodayIs.md)
- [pad2](docs/functions/pad2.md)
- [pad4](docs/functions/pad4.md)
- [shortKislev](docs/functions/shortKislev.md)
