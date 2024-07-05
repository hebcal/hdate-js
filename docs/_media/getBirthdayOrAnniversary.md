[**@hebcal/hdate**](../README.md) • **Docs**

***

[@hebcal/hdate](../globals.md) / getBirthdayOrAnniversary

# Function: getBirthdayOrAnniversary()

> **getBirthdayOrAnniversary**(`hyear`, `date`): `Date` \| `undefined`

Calculates a birthday or anniversary (non-yahrzeit).
`hyear` must be after original `date` of anniversary.
Returns `undefined` when requested year preceeds or is same as original year.

Hebcal uses the algorithm defined in "Calendrical Calculations"
by Edward M. Reingold and Nachum Dershowitz.

The birthday of someone born in Adar of an ordinary year or Adar II of
a leap year is also always in the last month of the year, be that Adar
or Adar II. The birthday in an ordinary year of someone born during the
first 29 days of Adar I in a leap year is on the corresponding day of Adar;
in a leap year, the birthday occurs in Adar I, as expected.

Someone born on the thirtieth day of Marcheshvan, Kislev, or Adar I
has his birthday postponed until the first of the following month in
years where that day does not occur. [Calendrical Calculations p. 111]

## Parameters

• **hyear**: `number`

Hebrew year

• **date**: `Date` \| [`SimpleHebrewDate`](../type-aliases/SimpleHebrewDate.md)

Gregorian or Hebrew date of event

## Returns

`Date` \| `undefined`

anniversary occurring in `hyear`

## Example

```ts
import {getBirthdayOrAnniversary} from '@hebcal/hdate';
const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
const anniversary = getBirthdayOrAnniversary(5780, dt); // '3/26/2020' == '1 Nisan 5780'
```

## Defined in

[anniversary.ts:172](https://github.com/hebcal/hdate-js/blob/0598d33c365bb80f37dc49c0f800617668c63a8d/src/anniversary.ts#L172)
