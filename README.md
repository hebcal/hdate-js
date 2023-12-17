# @hebcal/hdate
converts between Hebrew and Gregorian dates

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

## Members

<dl>
<dt><a href="#greg">greg</a></dt>
<dd><p>Gregorian date helper functions.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#hebrew2abs">hebrew2abs(year, month, day)</a> ⇒ <code>number</code></dt>
<dd><p>Converts Hebrew date to R.D. (Rata Die) fixed days.
R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
Calendar.</p>
</dd>
<dt><a href="#abs2hebrew">abs2hebrew(abs)</a> ⇒ <code>SimpleHebrewDate</code></dt>
<dd><p>Converts absolute R.D. days to Hebrew date</p>
</dd>
<dt><a href="#isLeapYear">isLeapYear(year)</a> ⇒ <code>boolean</code></dt>
<dd><p>Returns true if Hebrew year is a leap year</p>
</dd>
<dt><a href="#monthsInYear">monthsInYear(year)</a> ⇒ <code>number</code></dt>
<dd><p>Number of months in this Hebrew year (either 12 or 13 depending on leap year)</p>
</dd>
<dt><a href="#daysInMonth">daysInMonth(month, year)</a> ⇒ <code>number</code></dt>
<dd><p>Number of days in Hebrew month in a given year (29 or 30)</p>
</dd>
<dt><a href="#getMonthName">getMonthName(month, year)</a></dt>
<dd><p>Returns a transliterated string name of Hebrew month in year,
for example &#39;Elul&#39; or &#39;Cheshvan&#39;.</p>
</dd>
<dt><a href="#elapsedDays">elapsedDays(year)</a> ⇒ <code>number</code></dt>
<dd><p>Days from sunday prior to start of Hebrew calendar to mean
conjunction of Tishrei in Hebrew YEAR</p>
</dd>
<dt><a href="#daysInYear">daysInYear(year)</a> ⇒ <code>number</code></dt>
<dd><p>Number of days in the hebrew YEAR.
A common Hebrew calendar year can have a length of 353, 354 or 355 days
A leap Hebrew calendar year can have a length of 383, 384 or 385 days</p>
</dd>
<dt><a href="#longCheshvan">longCheshvan(year)</a> ⇒ <code>boolean</code></dt>
<dd><p>true if Cheshvan is long in Hebrew year</p>
</dd>
<dt><a href="#shortKislev">shortKislev(year)</a> ⇒ <code>boolean</code></dt>
<dd><p>true if Kislev is short in Hebrew year</p>
</dd>
<dt><a href="#monthFromName">monthFromName(monthName)</a> ⇒ <code>number</code></dt>
<dd><p>Converts Hebrew month string name to numeric</p>
</dd>
<dt><a href="#getYahrzeit">getYahrzeit(hyear, date)</a> ⇒ <code>Date</code></dt>
<dd><p>Calculates yahrzeit.
<code>hyear</code> must be after original <code>date</code> of death.
Returns <code>undefined</code> when requested year preceeds or is same as original year.</p>
<p>Hebcal uses the algorithm defined in &quot;Calendrical Calculations&quot;
by Edward M. Reingold and Nachum Dershowitz.</p>
<p>The customary anniversary date of a death is more complicated and depends
also on the character of the year in which the first anniversary occurs.
There are several cases:</p>
<ul>
<li>If the date of death is Marcheshvan 30, the anniversary in general depends
on the first anniversary; if that first anniversary was not Marcheshvan 30,
use the day before Kislev 1.</li>
<li>If the date of death is Kislev 30, the anniversary in general again depends
on the first anniversary — if that was not Kislev 30, use the day before
Tevet 1.</li>
<li>If the date of death is Adar II, the anniversary is the same day in the
last month of the Hebrew year (Adar or Adar II).</li>
<li>If the date of death is Adar I 30, the anniversary in a Hebrew year that
is not a leap year (in which Adar only has 29 days) is the last day in
Shevat.</li>
<li>In all other cases, use the normal (that is, same month number) anniversary
of the date of death. [Calendrical Calculations p. 113]</li>
</ul>
</dd>
<dt><a href="#getBirthdayOrAnniversary">getBirthdayOrAnniversary(hyear, date)</a> ⇒ <code>Date</code></dt>
<dd><p>Calculates a birthday or anniversary (non-yahrzeit).
<code>hyear</code> must be after original <code>date</code> of anniversary.
Returns <code>undefined</code> when requested year preceeds or is same as original year.</p>
<p>Hebcal uses the algorithm defined in &quot;Calendrical Calculations&quot;
by Edward M. Reingold and Nachum Dershowitz.</p>
<p>The birthday of someone born in Adar of an ordinary year or Adar II of
a leap year is also always in the last month of the year, be that Adar
or Adar II. The birthday in an ordinary year of someone born during the
first 29 days of Adar I in a leap year is on the corresponding day of Adar;
in a leap year, the birthday occurs in Adar I, as expected.</p>
<p>Someone born on the thirtieth day of Marcheshvan, Kislev, or Adar I
has his birthday postponed until the first of the following month in
years where that day does not occur. [Calendrical Calculations p. 111]</p>
</dd>
<dt><a href="#gematriya">gematriya(num)</a> ⇒ <code>string</code></dt>
<dd><p>Converts a numerical value to a string of Hebrew letters.</p>
<p>When specifying years of the Hebrew calendar in the present millennium,
we omit the thousands (which is presently 5 [ה]).</p>
</dd>
<dt><a href="#gematriyaStrToNum">gematriyaStrToNum(str)</a> ⇒ <code>number</code></dt>
<dd><p>Converts a string of Hebrew letters to a numerical value.</p>
<p>Only considers the value of Hebrew letters <code>א</code> through <code>ת</code>.
Ignores final Hebrew letters such as <code>ך</code> (kaf sofit) or <code>ם</code> (mem sofit)
and vowels (nekudot).</p>
</dd>
</dl>

<a name="greg"></a>

## greg
Gregorian date helper functions.

**Kind**: global variable  
<a name="greg.monthNames"></a>

### greg.monthNames : <code>Array.&lt;string&gt;</code>
Long names of the Gregorian months (1='January', 12='December')

**Kind**: static property of [<code>greg</code>](#greg)  
**Read only**: true  
<a name="months"></a>

## months : <code>enum</code>
Hebrew months of the year (NISAN=1, TISHREI=7)

**Kind**: global enum  
**Read only**: true  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| NISAN | <code>number</code> | <code>1</code> | Nissan / ניסן |
| IYYAR | <code>number</code> | <code>2</code> | Iyyar / אייר |
| SIVAN | <code>number</code> | <code>3</code> | Sivan / סיון |
| TAMUZ | <code>number</code> | <code>4</code> | Tamuz (sometimes Tammuz) / תמוז |
| AV | <code>number</code> | <code>5</code> | Av / אב |
| ELUL | <code>number</code> | <code>6</code> | Elul / אלול |
| TISHREI | <code>number</code> | <code>7</code> | Tishrei / תִּשְׁרֵי |
| CHESHVAN | <code>number</code> | <code>8</code> | Cheshvan / חשון |
| KISLEV | <code>number</code> | <code>9</code> | Kislev / כסלו |
| TEVET | <code>number</code> | <code>10</code> | Tevet / טבת |
| SHVAT | <code>number</code> | <code>11</code> | Sh'vat / שבט |
| ADAR_I | <code>number</code> | <code>12</code> | Adar or Adar Rishon / אדר |
| ADAR_II | <code>number</code> | <code>13</code> | Adar Sheini (only on leap years) / אדר ב׳ |

<a name="hebrew2abs"></a>

## hebrew2abs(year, month, day) ⇒ <code>number</code>
Converts Hebrew date to R.D. (Rata Die) fixed days.
R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
Calendar.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |
| month | <code>number</code> | Hebrew month |
| day | <code>number</code> | Hebrew date (1-30) |

<a name="abs2hebrew"></a>

## abs2hebrew(abs) ⇒ <code>SimpleHebrewDate</code>
Converts absolute R.D. days to Hebrew date

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| abs | <code>number</code> | absolute R.D. days |

<a name="isLeapYear"></a>

## isLeapYear(year) ⇒ <code>boolean</code>
Returns true if Hebrew year is a leap year

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="monthsInYear"></a>

## monthsInYear(year) ⇒ <code>number</code>
Number of months in this Hebrew year (either 12 or 13 depending on leap year)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="daysInMonth"></a>

## daysInMonth(month, year) ⇒ <code>number</code>
Number of days in Hebrew month in a given year (29 or 30)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>number</code> | Hebrew month (e.g. months.TISHREI) |
| year | <code>number</code> | Hebrew year |

<a name="getMonthName"></a>

## getMonthName(month, year)
Returns a transliterated string name of Hebrew month in year,
for example 'Elul' or 'Cheshvan'.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>number</code> | Hebrew month (e.g. months.TISHREI) |
| year | <code>number</code> | Hebrew year |

<a name="elapsedDays"></a>

## elapsedDays(year) ⇒ <code>number</code>
Days from sunday prior to start of Hebrew calendar to mean
conjunction of Tishrei in Hebrew YEAR

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="daysInYear"></a>

## daysInYear(year) ⇒ <code>number</code>
Number of days in the hebrew YEAR.
A common Hebrew calendar year can have a length of 353, 354 or 355 days
A leap Hebrew calendar year can have a length of 383, 384 or 385 days

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="longCheshvan"></a>

## longCheshvan(year) ⇒ <code>boolean</code>
true if Cheshvan is long in Hebrew year

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="shortKislev"></a>

## shortKislev(year) ⇒ <code>boolean</code>
true if Kislev is short in Hebrew year

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="monthFromName"></a>

## monthFromName(monthName) ⇒ <code>number</code>
Converts Hebrew month string name to numeric

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| monthName | <code>string</code> | monthName |

<a name="getYahrzeit"></a>

## getYahrzeit(hyear, date) ⇒ <code>Date</code>
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

**Kind**: global function  
**Returns**: <code>Date</code> - anniversary occurring in `hyear`  

| Param | Type | Description |
| --- | --- | --- |
| hyear | <code>number</code> | Hebrew year |
| date | <code>Date</code> \| <code>SimpleHebrewDate</code> \| <code>number</code> | Gregorian or Hebrew date of death |

**Example**  
```js
import {getYahrzeit} from '@hebcal/hdate';
const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
const anniversary = getYahrzeit(5780, dt); // '2/25/2020' == '30 Sh\'vat 5780'
```
<a name="getBirthdayOrAnniversary"></a>

## getBirthdayOrAnniversary(hyear, date) ⇒ <code>Date</code>
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

**Kind**: global function  
**Returns**: <code>Date</code> - anniversary occurring in `hyear`  

| Param | Type | Description |
| --- | --- | --- |
| hyear | <code>number</code> | Hebrew year |
| date | <code>Date</code> \| <code>SimpleHebrewDate</code> \| <code>number</code> | Gregorian or Hebrew date of event |

**Example**  
```js
import {getBirthdayOrAnniversary} from '@hebcal/hdate';
const dt = new Date(2014, 2, 2); // '2014-03-02' == '30 Adar I 5774'
const anniversary = getBirthdayOrAnniversary(5780, dt); // '3/26/2020' == '1 Nisan 5780'
```
<a name="gematriya"></a>

## gematriya(num) ⇒ <code>string</code>
Converts a numerical value to a string of Hebrew letters.

When specifying years of the Hebrew calendar in the present millennium,
we omit the thousands (which is presently 5 [ה]).

**Kind**: global function  

| Param | Type |
| --- | --- |
| num | <code>number</code> | 

**Example**  
```js
gematriya(5774) // 'תשע״ד' - cropped to 774
gematriya(25) // 'כ״ה'
gematriya(60) // 'ס׳'
gematriya(3761) // 'ג׳תשס״א'
gematriya(1123) // 'א׳קכ״ג'
```
<a name="gematriyaStrToNum"></a>

## gematriyaStrToNum(str) ⇒ <code>number</code>
Converts a string of Hebrew letters to a numerical value.

Only considers the value of Hebrew letters `א` through `ת`.
Ignores final Hebrew letters such as `ך` (kaf sofit) or `ם` (mem sofit)
and vowels (nekudot).

**Kind**: global function  

| Param | Type |
| --- | --- |
| str | <code>string</code> | 

