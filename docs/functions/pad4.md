[**@hebcal/hdate**](../README.md) • **Docs**

***

[@hebcal/hdate](../globals.md) / pad4

# Function: pad4()

> **pad4**(`number`): `string`

Formats a number with leading zeros so the resulting string is 4 digits long.
Similar to `string.padStart(4, '0')` but will also format
negative numbers similar to how the JavaScript date formats
negative year numbers (e.g. `-37` is formatted as `-000037`).

## Parameters

• **number**: `number`

## Returns

`string`

## Defined in

[dateFormat.ts:60](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/dateFormat.ts#L60)
