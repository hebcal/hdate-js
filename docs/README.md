**@hebcal/hdate** • [**Docs**](globals.md)

***

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

- [greg](_media/README.md)

## Enumerations

- [months](_media/months.md)

## Classes

- [HDate](_media/HDate.md)
- [Locale](_media/Locale.md)

## Interfaces

- [Headers](_media/Headers.md)
- [LocaleData](_media/LocaleData.md)
- [StringArrayMap](_media/StringArrayMap.md)

## Type Aliases

- [Molad](_media/Molad.md)
- [OmerLang](_media/OmerLang.md)
- [SimpleHebrewDate](_media/SimpleHebrewDate.md)

## Functions

- [abs2hebrew](_media/abs2hebrew.md)
- [daysInMonth](_media/daysInMonth.md)
- [daysInYear](_media/daysInYear.md)
- [elapsedDays](_media/elapsedDays.md)
- [gematriya](_media/gematriya.md)
- [gematriyaStrToNum](_media/gematriyaStrToNum.md)
- [getBirthdayHD](_media/getBirthdayHD.md)
- [getBirthdayOrAnniversary](_media/getBirthdayOrAnniversary.md)
- [getMonthName](_media/getMonthName.md)
- [getPseudoISO](_media/getPseudoISO.md)
- [getTimezoneOffset](_media/getTimezoneOffset.md)
- [getYahrzeit](_media/getYahrzeit.md)
- [getYahrzeitHD](_media/getYahrzeitHD.md)
- [hd2abs](_media/hd2abs.md)
- [hebrew2abs](_media/hebrew2abs.md)
- [isLeapYear](_media/isLeapYear.md)
- [longCheshvan](_media/longCheshvan.md)
- [molad](_media/molad.md)
- [monthFromName](_media/monthFromName.md)
- [monthsInYear](_media/monthsInYear.md)
- [omerEmoji](_media/omerEmoji.md)
- [omerSefira](_media/omerSefira.md)
- [omerTodayIs](_media/omerTodayIs.md)
- [pad2](_media/pad2.md)
- [pad4](_media/pad4.md)
- [shortKislev](_media/shortKislev.md)
