[**@hebcal/hdate**](../README.md) • **Docs**

***

[@hebcal/hdate](../globals.md) / getPseudoISO

# Function: getPseudoISO()

> **getPseudoISO**(`tzid`, `date`): `string`

Returns a string similar to `Date.toISOString()` but in the
timezone `tzid`. Contrary to the typical meaning of `Z` at the end
of the string, this is not actually a UTC date.

## Parameters

• **tzid**: `string`

• **date**: `Date`

## Returns

`string`

## Defined in

[dateFormat.ts:30](https://github.com/hebcal/hdate-js/blob/0598d33c365bb80f37dc49c0f800617668c63a8d/src/dateFormat.ts#L30)
