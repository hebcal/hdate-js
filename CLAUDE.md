# CLAUDE.md

## Known issues (to revisit)

### `getMonthName(14, commonYear)` returns `undefined`

`getMonthName` in `src/hdateBase.ts` accepts `month` in the range 1-14, but
the common-year entry of the `monthNames` table only has indices 0-13 (13 is
the trailing `'Nisan'`). So for a non-leap year, month 14 falls off the end
and the function returns `undefined` despite its `MonthName` return type.

```sh
npm run build
node -e "import('./dist/esm/index.js').then(m=>console.log(
  m.getMonthName(14, 5783),  // undefined  (5783 is a common year)
  m.getMonthName(13, 5783),  // 'Nisan'
  m.getMonthName(14, 5784))) // 'Nisan'    (5784 is a leap year)"
```

Possible fixes (not yet decided):

- Tighten the range check to `1 .. monthsInYear(year) + 1`, throwing for
  month 14 in a common year; or
- Append a second trailing `'Nisan'` to the common-year table so both
  tables cover 0-14.

`HDate.monthNum` and `monthFromName` also accept up to 14, so check how
callers rely on the "month after the last month is Nisan" behavior before
choosing.
