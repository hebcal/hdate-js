[**@hebcal/hdate**](../README.md) • **Docs**

***

[@hebcal/hdate](../globals.md) / getYahrzeit

# Function: getYahrzeit()

> **getYahrzeit**(`hyear`, `date`): `Date` \| `undefined`

Calculates yahrzeit.
`hyear` must be after original `date` of death.
Returns `undefined` when requested year preceeds or is same as original year.

Hebcal uses the algorithm defined in "Calendrical Calculations"
by Edward M. Reingold and Nachum Dershowitz.

The customary anniversary date of a death is more complicated and depends
also on the character of the year in which the first anniversary occurs.
There are several cases:

* If the date of death is Marcheshvan 30, the anniversary in general depends
  on the first anniversary; if that first anniversary was not Marcheshvan 30,
  use the day before Kislev 1.
* If the date of death is Kislev 30, the anniversary in general again depends
  on the first anniversary — if that was not Kislev 30, use the day before
  Tevet 1.
* If the date of death is Adar II, the anniversary is the same day in the
  last month of the Hebrew year (Adar or Adar II).
* If the date of death is Adar I 30, the anniversary in a Hebrew year that
  is not a leap year (in which Adar only has 29 days) is the last day in
  Shevat.
* In all other cases, use the normal (that is, same month number) anniversary
  of the date of death. [Calendrical Calculations p. 113]

## Parameters

• **hyear**: `number`

Hebrew year

• **date**: `number` \| `Date` \| [`SimpleHebrewDate`](../type-aliases/SimpleHebrewDate.md)

Gregorian or Hebrew date of death

## Returns

`Date` \| `undefined`

anniversary occurring in `hyear`

## Example

```ts
import {getYahrzeit} from '@hebcal/hdate';
const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
const anniversary = getYahrzeit(5780, dt); // '2/25/2020' == '30 Sh\'vat 5780'
```

## Defined in

[anniversary.ts:86](https://github.com/hebcal/hdate-js/blob/0598d33c365bb80f37dc49c0f800617668c63a8d/src/anniversary.ts#L86)
