[**@hebcal/hdate**](../README.md) • **Docs**

***

[@hebcal/hdate](../globals.md) / omerSefira

# Function: omerSefira()

> **omerSefira**(`omerDay`, `lang`): `string`

Returns the sefira. For example, on day 8
 חֶֽסֶד שֶׁבִּגְבוּרָה
 Chesed shebiGevurah
 Lovingkindness within Might

## Parameters

• **omerDay**: `number`

the day of the omer, 1-49 inclusive

• **lang**: [`OmerLang`](../type-aliases/OmerLang.md)

`en` (English), `he` (Hebrew with nikud), or `translit` (Hebrew in Sephardic transliteration)

## Returns

`string`

a string such as `Lovingkindness within Might` or `חֶֽסֶד שֶׁבִּגְבוּרָה`

## Defined in

[omer.ts:73](https://github.com/hebcal/hdate-js/blob/285f3b584b6b2fae587a29ebff92389be73806cb/src/omer.ts#L73)
