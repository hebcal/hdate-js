[**@hebcal/hdate**](../README.md) • **Docs**

***

[@hebcal/hdate](../globals.md) / gematriya

# Function: gematriya()

> **gematriya**(`num`): `string`

Converts a numerical value to a string of Hebrew letters.

When specifying years of the Hebrew calendar in the present millennium,
we omit the thousands (which is presently 5 [ה]).

## Parameters

• **num**: `string` \| `number`

## Returns

`string`

## Example

```ts
gematriya(5774) // 'תשע״ד' - cropped to 774
gematriya(25) // 'כ״ה'
gematriya(60) // 'ס׳'
gematriya(3761) // 'ג׳תשס״א'
gematriya(1123) // 'א׳קכ״ג'
```

## Defined in

[gematriya.ts:68](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/gematriya.ts#L68)
