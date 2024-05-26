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

## Classes

<dl>
<dt><a href="#HDate">HDate</a></dt>
<dd><p>Represents a Hebrew date</p>
</dd>
<dt><a href="#Locale">Locale</a></dt>
<dd><p>A locale in Hebcal is used for translations/transliterations of
holidays. <code>@hebcal/hdate</code> supports four locales by default</p>
<ul>
<li><code>en</code> - default, Sephardic transliterations (e.g. &quot;Shabbat&quot;)</li>
<li><code>ashkenazi</code> - Ashkenazi transliterations (e.g. &quot;Shabbos&quot;)</li>
<li><code>he</code> - Hebrew (e.g. &quot;שַׁבָּת&quot;)</li>
<li><code>he-x-NoNikud</code> - Hebrew without nikud (e.g. &quot;שבת&quot;)</li>
</ul>
</dd>
</dl>

## Members

<dl>
<dt><a href="#greg">greg</a></dt>
<dd><p>Gregorian date helper functions.</p>
</dd>
</dl>

## Functions

<dl>
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
<dt><a href="#getPseudoISO">getPseudoISO(tzid, date)</a> ⇒ <code>string</code></dt>
<dd><p>Returns a string similar to <code>Date.toISOString()</code> but in the
timezone <code>tzid</code>. Contrary to the typical meaning of <code>Z</code> at the end
of the string, this is not actually a UTC date.</p>
</dd>
<dt><a href="#getTimezoneOffset">getTimezoneOffset(tzid, date)</a> ⇒ <code>number</code></dt>
<dd><p>Returns number of minutes <code>tzid</code> is offset from UTC on date <code>date</code>.</p>
</dd>
<dt><a href="#pad4">pad4(number)</a> ⇒ <code>string</code></dt>
<dd><p>Formats a number with leading zeros so the resulting string is 4 digits long.
Similar to <code>string.padStart(4, &#39;0&#39;)</code> but will also format
negative numbers similar to how the JavaScript date formats
negative year numbers (e.g. <code>-37</code> is formatted as <code>-000037</code>).</p>
</dd>
<dt><a href="#pad2">pad2(number)</a> ⇒ <code>string</code></dt>
<dd><p>Formats a number with leading zeros so the resulting string is 2 digits long.
Similar to <code>string.padStart(2, &#39;0&#39;)</code>.</p>
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
<dt><a href="#hebrew2abs">hebrew2abs(year, month, day)</a> ⇒ <code>number</code></dt>
<dd><p>Converts Hebrew date to R.D. (Rata Die) fixed days.
R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
Calendar.</p>
</dd>
<dt><a href="#hd2abs">hd2abs()</a></dt>
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
<dt><a href="#molad">molad()</a></dt>
<dd><p>Calculates the molad for a Hebrew month</p>
</dd>
<dt><a href="#omerSefira">omerSefira(omerDay, lang)</a> ⇒</dt>
<dd><p>Returns the sefira. For example, on day 8
 חֶֽסֶד שֶׁבִּגְבוּרָה
 Chesed shebiGevurah
 Lovingkindness within Might</p>
</dd>
<dt><a href="#omerTodayIs">omerTodayIs(omerDay, lang)</a> ⇒</dt>
<dd><p>Returns a sentence with that evening&#39;s omer count</p>
</dd>
<dt><a href="#omerEmoji">omerEmoji(omerDay)</a> ⇒</dt>
<dd><p>Returns an emoji number symbol with a circle, for example <code>㊲</code>
 from the “Enclosed CJK Letters and Months” block of the Unicode standard</p>
</dd>
</dl>

<a name="HDate"></a>

## HDate
Represents a Hebrew date

**Kind**: global class  

* [HDate](#HDate)
    * [new HDate([day], [month], [year])](#new_HDate_new)
    * _instance_
        * [.getFullYear()](#HDate+getFullYear) ⇒ <code>number</code>
        * [.isLeapYear()](#HDate+isLeapYear) ⇒ <code>boolean</code>
        * [.getMonth()](#HDate+getMonth) ⇒ <code>number</code>
        * [.getTishreiMonth()](#HDate+getTishreiMonth) ⇒ <code>number</code>
        * [.daysInMonth()](#HDate+daysInMonth) ⇒ <code>number</code>
        * [.getDate()](#HDate+getDate) ⇒ <code>number</code>
        * [.getDay()](#HDate+getDay) ⇒ <code>number</code>
        * [.greg()](#HDate+greg) ⇒ <code>Date</code>
        * [.abs()](#HDate+abs) ⇒ <code>number</code>
        * [.getMonthName()](#HDate+getMonthName) ⇒ <code>string</code>
        * [.render([locale], [showYear])](#HDate+render) ⇒ <code>string</code>
        * [.renderGematriya([suppressNikud])](#HDate+renderGematriya) ⇒ <code>string</code>
        * [.before(dow)](#HDate+before) ⇒ [<code>HDate</code>](#HDate)
        * [.onOrBefore(dow)](#HDate+onOrBefore) ⇒ [<code>HDate</code>](#HDate)
        * [.nearest(dow)](#HDate+nearest) ⇒ [<code>HDate</code>](#HDate)
        * [.onOrAfter(dow)](#HDate+onOrAfter) ⇒ [<code>HDate</code>](#HDate)
        * [.after(dow)](#HDate+after) ⇒ [<code>HDate</code>](#HDate)
        * [.next()](#HDate+next) ⇒ [<code>HDate</code>](#HDate)
        * [.prev()](#HDate+prev) ⇒ [<code>HDate</code>](#HDate)
        * [.add(amount, [units])](#HDate+add) ⇒ [<code>HDate</code>](#HDate)
        * [.subtract(amount, [units])](#HDate+subtract) ⇒ [<code>HDate</code>](#HDate)
        * [.deltaDays(other)](#HDate+deltaDays) ⇒ <code>number</code>
        * [.isSameDate(other)](#HDate+isSameDate) ⇒ <code>boolean</code>
        * [.toString()](#HDate+toString) ⇒ <code>string</code>
    * _static_
        * [.hebrew2abs(year, month, day)](#HDate.hebrew2abs) ⇒ <code>number</code>
        * [.isLeapYear(year)](#HDate.isLeapYear) ⇒ <code>boolean</code>
        * [.monthsInYear(year)](#HDate.monthsInYear) ⇒ <code>number</code>
        * [.daysInMonth(month, year)](#HDate.daysInMonth) ⇒ <code>number</code>
        * [.getMonthName(month, year)](#HDate.getMonthName) ⇒ <code>string</code>
        * [.monthNum(month)](#HDate.monthNum) ⇒ <code>number</code>
        * [.daysInYear(year)](#HDate.daysInYear) ⇒ <code>number</code>
        * [.longCheshvan(year)](#HDate.longCheshvan) ⇒ <code>boolean</code>
        * [.shortKislev(year)](#HDate.shortKislev) ⇒ <code>boolean</code>
        * [.monthFromName(monthName)](#HDate.monthFromName) ⇒ <code>number</code>
        * [.dayOnOrBefore(dayOfWeek, absdate)](#HDate.dayOnOrBefore) ⇒ <code>number</code>
        * [.isHDate(obj)](#HDate.isHDate) ⇒ <code>boolean</code>
        * [.fromGematriyaString(str, currentThousands)](#HDate.fromGematriyaString) ⇒ [<code>HDate</code>](#HDate)

<a name="new_HDate_new"></a>

### new HDate([day], [month], [year])
Create a Hebrew date. There are 3 basic forms for the `HDate()` constructor.

1. No parameters - represents the current Hebrew date at time of instantiation
2. One parameter
   * `Date` - represents the Hebrew date corresponding to the Gregorian date using
      local time. Hours, minutes, seconds and milliseconds are ignored.
   * `HDate` - clones a copy of the given Hebrew date
   * `number` - Converts absolute R.D. days to Hebrew date.
      R.D. 1 == the imaginary date January 1, 1 (Gregorian)
3. Three parameters: Hebrew day, Hebrew month, Hebrew year. Hebrew day should
   be a number between 1-30, Hebrew month can be a number or string, and
   Hebrew year is always a number.


| Param | Type | Description |
| --- | --- | --- |
| [day] | <code>number</code> \| <code>Date</code> \| [<code>HDate</code>](#HDate) | Day of month (1-30) if a `number`.   If a `Date` is specified, represents the Hebrew date corresponding to the   Gregorian date using local time.   If an `HDate` is specified, clones a copy of the given Hebrew date. |
| [month] | <code>number</code> \| <code>string</code> | Hebrew month of year (1=NISAN, 7=TISHREI) |
| [year] | <code>number</code> | Hebrew year |

**Example**  
```js
import {HDate, months} from '@hebcal/hdate';

const hd1 = new HDate();
const hd2 = new HDate(new Date(2008, 10, 13));
const hd3 = new HDate(15, 'Cheshvan', 5769);
const hd4 = new HDate(15, months.CHESHVAN, 5769);
const hd5 = new HDate(733359); // ==> 15 Cheshvan 5769
const monthName = 'אייר';
const hd6 = new HDate(5, monthName, 5773);
```
<a name="HDate+getFullYear"></a>

### hDate.getFullYear() ⇒ <code>number</code>
Gets the Hebrew year of this Hebrew date

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+isLeapYear"></a>

### hDate.isLeapYear() ⇒ <code>boolean</code>
Tests if this date occurs during a leap year

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+getMonth"></a>

### hDate.getMonth() ⇒ <code>number</code>
Gets the Hebrew month (1=NISAN, 7=TISHREI) of this Hebrew date

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+getTishreiMonth"></a>

### hDate.getTishreiMonth() ⇒ <code>number</code>
The Tishrei-based month of the date. 1 is Tishrei, 7 is Nisan, 13 is Elul in a leap year

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+daysInMonth"></a>

### hDate.daysInMonth() ⇒ <code>number</code>
Number of days in the month of this Hebrew date

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+getDate"></a>

### hDate.getDate() ⇒ <code>number</code>
Gets the day within the month (1-30)

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+getDay"></a>

### hDate.getDay() ⇒ <code>number</code>
Gets the day of the week. 0=Sunday, 6=Saturday

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+greg"></a>

### hDate.greg() ⇒ <code>Date</code>
Converts to Gregorian date

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+abs"></a>

### hDate.abs() ⇒ <code>number</code>
Returns R.D. (Rata Die) fixed days.
R.D. 1 == Monday, January 1, 1 (Gregorian)
Note also that R.D. = Julian Date − 1,721,424.5
https://en.wikipedia.org/wiki/Rata_Die#Dershowitz_and_Reingold

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+getMonthName"></a>

### hDate.getMonthName() ⇒ <code>string</code>
Returns a transliterated Hebrew month name, e.g. `'Elul'` or `'Cheshvan'`.

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+render"></a>

### hDate.render([locale], [showYear]) ⇒ <code>string</code>
Renders this Hebrew date as a translated or transliterated string,
including ordinal e.g. `'15th of Cheshvan, 5769'`.

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [locale] | <code>string</code> |  | Optional locale name (defaults to active locale). |
| [showYear] | <code>boolean</code> | <code>true</code> | Display year (defaults to true). |

**Example**  
```js
import {HDate, months} from '@hebcal/hdate';

const hd = new HDate(15, months.CHESHVAN, 5769);
console.log(hd.render('en')); // '15th of Cheshvan, 5769'
console.log(hd.render('he')); // '15 חֶשְׁוָן, 5769'
```
<a name="HDate+renderGematriya"></a>

### hDate.renderGematriya([suppressNikud]) ⇒ <code>string</code>
Renders this Hebrew date in Hebrew gematriya, regardless of locale.

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Default |
| --- | --- | --- |
| [suppressNikud] | <code>boolean</code> | <code>false</code> | 

**Example**  
```js
import {HDate, months} from '@hebcal/hdate';
const hd = new HDate(15, months.CHESHVAN, 5769);
console.log(hd.renderGematriya()); // 'ט״ו חֶשְׁוָן תשס״ט'
```
<a name="HDate+before"></a>

### hDate.before(dow) ⇒ [<code>HDate</code>](#HDate)
Returns an `HDate` representing the a dayNumber before the current date.
Sunday=0, Saturday=6

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| dow | <code>number</code> | day of week |

**Example**  
```js
new HDate(new Date('Wednesday February 19, 2014')).before(6).greg() // Sat Feb 15 2014
```
<a name="HDate+onOrBefore"></a>

### hDate.onOrBefore(dow) ⇒ [<code>HDate</code>](#HDate)
Returns an `HDate` representing the a dayNumber on or before the current date.
Sunday=0, Saturday=6

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| dow | <code>number</code> | day of week |

**Example**  
```js
new HDate(new Date('Wednesday February 19, 2014')).onOrBefore(6).greg() // Sat Feb 15 2014
new HDate(new Date('Saturday February 22, 2014')).onOrBefore(6).greg() // Sat Feb 22 2014
new HDate(new Date('Sunday February 23, 2014')).onOrBefore(6).greg() // Sat Feb 22 2014
```
<a name="HDate+nearest"></a>

### hDate.nearest(dow) ⇒ [<code>HDate</code>](#HDate)
Returns an `HDate` representing the nearest dayNumber to the current date
Sunday=0, Saturday=6

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| dow | <code>number</code> | day of week |

**Example**  
```js
new HDate(new Date('Wednesday February 19, 2014')).nearest(6).greg() // Sat Feb 22 2014
new HDate(new Date('Tuesday February 18, 2014')).nearest(6).greg() // Sat Feb 15 2014
```
<a name="HDate+onOrAfter"></a>

### hDate.onOrAfter(dow) ⇒ [<code>HDate</code>](#HDate)
Returns an `HDate` representing the a dayNumber on or after the current date.
Sunday=0, Saturday=6

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| dow | <code>number</code> | day of week |

**Example**  
```js
new HDate(new Date('Wednesday February 19, 2014')).onOrAfter(6).greg() // Sat Feb 22 2014
new HDate(new Date('Saturday February 22, 2014')).onOrAfter(6).greg() // Sat Feb 22 2014
new HDate(new Date('Sunday February 23, 2014')).onOrAfter(6).greg() // Sat Mar 01 2014
```
<a name="HDate+after"></a>

### hDate.after(dow) ⇒ [<code>HDate</code>](#HDate)
Returns an `HDate` representing the a dayNumber after the current date.
Sunday=0, Saturday=6

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| dow | <code>number</code> | day of week |

**Example**  
```js
new HDate(new Date('Wednesday February 19, 2014')).after(6).greg() // Sat Feb 22 2014
new HDate(new Date('Saturday February 22, 2014')).after(6).greg() // Sat Mar 01 2014
new HDate(new Date('Sunday February 23, 2014')).after(6).greg() // Sat Mar 01 2014
```
<a name="HDate+next"></a>

### hDate.next() ⇒ [<code>HDate</code>](#HDate)
Returns the next Hebrew date

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+prev"></a>

### hDate.prev() ⇒ [<code>HDate</code>](#HDate)
Returns the previous Hebrew date

**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate+add"></a>

### hDate.add(amount, [units]) ⇒ [<code>HDate</code>](#HDate)
Returns a cloned `HDate` object with a specified amount of time added

Units are case insensitive, and support plural and short forms.
Note, short forms are case sensitive.

| Unit | Shorthand | Description
| --- | --- | --- |
| `day` | `d` | days |
| `week` | `w` | weeks |
| `month` | `M` | months |
| `year` | `y` | years |

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Default |
| --- | --- | --- |
| amount | <code>number</code> |  | 
| [units] | <code>string</code> | <code>&quot;d&quot;</code> | 

<a name="HDate+subtract"></a>

### hDate.subtract(amount, [units]) ⇒ [<code>HDate</code>](#HDate)
Returns a cloned `HDate` object with a specified amount of time subracted

Units are case insensitive, and support plural and short forms.
Note, short forms are case sensitive.

| Unit | Shorthand | Description
| --- | --- | --- |
| `day` | `d` | days |
| `week` | `w` | weeks |
| `month` | `M` | months |
| `year` | `y` | years |

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Default |
| --- | --- | --- |
| amount | <code>number</code> |  | 
| [units] | <code>string</code> | <code>&quot;d&quot;</code> | 

**Example**  
```js
import {HDate, months} from '@hebcal/hdate';

const hd1 = new HDate(15, months.CHESHVAN, 5769);
const hd2 = hd1.add(1, 'weeks'); // 7 Kislev 5769
const hd3 = hd1.add(-3, 'M'); // 30 Av 5768
```
<a name="HDate+deltaDays"></a>

### hDate.deltaDays(other) ⇒ <code>number</code>
Returns the difference in days between the two given HDates.

The result is positive if `this` date is comes chronologically
after the `other` date, and negative
if the order of the two dates is reversed.

The result is zero if the two dates are identical.

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>HDate</code>](#HDate) | Hebrew date to compare |

**Example**  
```js
import {HDate, months} from '@hebcal/hdate';

const hd1 = new HDate(25, months.KISLEV, 5770);
const hd2 = new HDate(15, months.CHESHVAN, 5769);
const days = hd1.deltaDays(hd2); // 394
```
<a name="HDate+isSameDate"></a>

### hDate.isSameDate(other) ⇒ <code>boolean</code>
Compares this date to another date, returning `true` if the dates match.

**Kind**: instance method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>HDate</code>](#HDate) | Hebrew date to compare |

<a name="HDate+toString"></a>

### hDate.toString() ⇒ <code>string</code>
**Kind**: instance method of [<code>HDate</code>](#HDate)  
<a name="HDate.hebrew2abs"></a>

### HDate.hebrew2abs(year, month, day) ⇒ <code>number</code>
Converts Hebrew date to R.D. (Rata Die) fixed days.
R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
Calendar.

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |
| month | <code>number</code> | Hebrew month |
| day | <code>number</code> | Hebrew date (1-30) |

<a name="HDate.isLeapYear"></a>

### HDate.isLeapYear(year) ⇒ <code>boolean</code>
Returns true if Hebrew year is a leap year

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="HDate.monthsInYear"></a>

### HDate.monthsInYear(year) ⇒ <code>number</code>
Number of months in this Hebrew year (either 12 or 13 depending on leap year)

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="HDate.daysInMonth"></a>

### HDate.daysInMonth(month, year) ⇒ <code>number</code>
Number of days in Hebrew month in a given year (29 or 30)

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>number</code> | Hebrew month (e.g. months.TISHREI) |
| year | <code>number</code> | Hebrew year |

<a name="HDate.getMonthName"></a>

### HDate.getMonthName(month, year) ⇒ <code>string</code>
Returns a transliterated string name of Hebrew month in year,
for example 'Elul' or 'Cheshvan'.

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>number</code> | Hebrew month (e.g. months.TISHREI) |
| year | <code>number</code> | Hebrew year |

<a name="HDate.monthNum"></a>

### HDate.monthNum(month) ⇒ <code>number</code>
Returns the Hebrew month number (NISAN=1, TISHREI=7)

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>number</code> \| <code>string</code> | A number, or Hebrew month name string |

<a name="HDate.daysInYear"></a>

### HDate.daysInYear(year) ⇒ <code>number</code>
Number of days in the hebrew YEAR

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="HDate.longCheshvan"></a>

### HDate.longCheshvan(year) ⇒ <code>boolean</code>
true if Cheshvan is long in Hebrew year

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="HDate.shortKislev"></a>

### HDate.shortKislev(year) ⇒ <code>boolean</code>
true if Kislev is short in Hebrew year

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| year | <code>number</code> | Hebrew year |

<a name="HDate.monthFromName"></a>

### HDate.monthFromName(monthName) ⇒ <code>number</code>
Converts Hebrew month string name to numeric

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Description |
| --- | --- | --- |
| monthName | <code>string</code> \| <code>number</code> | monthName |

<a name="HDate.dayOnOrBefore"></a>

### HDate.dayOnOrBefore(dayOfWeek, absdate) ⇒ <code>number</code>
Note: Applying this function to d+6 gives us the DAYNAME on or after an
absolute day d. Similarly, applying it to d+3 gives the DAYNAME nearest to
absolute date d, applying it to d-1 gives the DAYNAME previous to absolute
date d, and applying it to d+7 gives the DAYNAME following absolute date d.

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type |
| --- | --- |
| dayOfWeek | <code>number</code> | 
| absdate | <code>number</code> | 

<a name="HDate.isHDate"></a>

### HDate.isHDate(obj) ⇒ <code>boolean</code>
Tests if the object is an instance of `HDate`

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type |
| --- | --- |
| obj | <code>any</code> | 

<a name="HDate.fromGematriyaString"></a>

### HDate.fromGematriyaString(str, currentThousands) ⇒ [<code>HDate</code>](#HDate)
Construct a new instance of `HDate` from a Gematriya-formatted string

**Kind**: static method of [<code>HDate</code>](#HDate)  

| Param | Type | Default |
| --- | --- | --- |
| str | <code>string</code> |  | 
| currentThousands | <code>number</code> | <code>5000</code> | 

**Example**  
```js
HDate.fromGematriyaString('כ״ז בְּתַמּוּז תשפ״ג') // 27 Tamuz 5783
 HDate.fromGematriyaString('כ׳ סיון תש״ד') // 20 Sivan 5704
 HDate.fromGematriyaString('ה׳ אִיָיר תש״ח') // 5 Iyyar 5708
```
<a name="Locale"></a>

## Locale
A locale in Hebcal is used for translations/transliterations of
holidays. `@hebcal/hdate` supports four locales by default
* `en` - default, Sephardic transliterations (e.g. "Shabbat")
* `ashkenazi` - Ashkenazi transliterations (e.g. "Shabbos")
* `he` - Hebrew (e.g. "שַׁבָּת")
* `he-x-NoNikud` - Hebrew without nikud (e.g. "שבת")

**Kind**: global class  

* [Locale](#Locale)
    * [.lookupTranslation(id, [locale])](#Locale.lookupTranslation) ⇒ <code>string</code>
    * [.gettext(id, [locale])](#Locale.gettext) ⇒ <code>string</code>
    * [.addLocale(locale, data)](#Locale.addLocale)
    * [.addTranslation(locale, id, translation)](#Locale.addTranslation)
    * [.addTranslations(locale, data)](#Locale.addTranslations)
    * [.useLocale(locale)](#Locale.useLocale)
    * [.getLocaleName()](#Locale.getLocaleName) ⇒ <code>string</code>
    * [.getLocaleNames()](#Locale.getLocaleNames) ⇒ <code>Array.&lt;string&gt;</code>
    * [.ordinal(n, [locale])](#Locale.ordinal) ⇒ <code>string</code>
    * [.hebrewStripNikkud(str)](#Locale.hebrewStripNikkud) ⇒ <code>string</code>

<a name="Locale.lookupTranslation"></a>

### Locale.lookupTranslation(id, [locale]) ⇒ <code>string</code>
Returns translation only if `locale` offers a non-empty translation for `id`.
Otherwise, returns `undefined`.

**Kind**: static method of [<code>Locale</code>](#Locale)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Message ID to translate |
| [locale] | <code>string</code> | Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale. |

<a name="Locale.gettext"></a>

### Locale.gettext(id, [locale]) ⇒ <code>string</code>
By default, if no translation was found, returns `id`.

**Kind**: static method of [<code>Locale</code>](#Locale)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Message ID to translate |
| [locale] | <code>string</code> | Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale. |

<a name="Locale.addLocale"></a>

### Locale.addLocale(locale, data)
Register locale translations.

**Kind**: static method of [<code>Locale</code>](#Locale)  

| Param | Type | Description |
| --- | --- | --- |
| locale | <code>string</code> | Locale name (i.e.: `'he'`, `'fr'`) |
| data | <code>LocaleData</code> | parsed data from a `.po` file. |

<a name="Locale.addTranslation"></a>

### Locale.addTranslation(locale, id, translation)
Adds a translation to `locale`, replacing any previous translation.

**Kind**: static method of [<code>Locale</code>](#Locale)  

| Param | Type | Description |
| --- | --- | --- |
| locale | <code>string</code> | Locale name (i.e: `'he'`, `'fr'`). |
| id | <code>string</code> | Message ID to translate |
| translation | <code>string</code> | Translation text |

<a name="Locale.addTranslations"></a>

### Locale.addTranslations(locale, data)
Adds multiple translations to `locale`, replacing any previous translations.

**Kind**: static method of [<code>Locale</code>](#Locale)  

| Param | Type | Description |
| --- | --- | --- |
| locale | <code>string</code> | Locale name (i.e: `'he'`, `'fr'`). |
| data | <code>LocaleData</code> | parsed data from a `.po` file. |

<a name="Locale.useLocale"></a>

### Locale.useLocale(locale)
Activates a locale. Throws an error if the locale has not been previously added.
After setting the locale to be used, all strings marked for translations
will be represented by the corresponding translation in the specified locale.

**Kind**: static method of [<code>Locale</code>](#Locale)  

| Param | Type | Description |
| --- | --- | --- |
| locale | <code>string</code> | Locale name (i.e: `'he'`, `'fr'`) |

<a name="Locale.getLocaleName"></a>

### Locale.getLocaleName() ⇒ <code>string</code>
Returns the name of the active locale (i.e. 'he', 'ashkenazi', 'fr')

**Kind**: static method of [<code>Locale</code>](#Locale)  
<a name="Locale.getLocaleNames"></a>

### Locale.getLocaleNames() ⇒ <code>Array.&lt;string&gt;</code>
Returns the names of registered locales

**Kind**: static method of [<code>Locale</code>](#Locale)  
<a name="Locale.ordinal"></a>

### Locale.ordinal(n, [locale]) ⇒ <code>string</code>
**Kind**: static method of [<code>Locale</code>](#Locale)  

| Param | Type | Description |
| --- | --- | --- |
| n | <code>number</code> |  |
| [locale] | <code>string</code> | Optional locale name (i.e: `'he'`, `'fr'`). Defaults to active locale. |

<a name="Locale.hebrewStripNikkud"></a>

### Locale.hebrewStripNikkud(str) ⇒ <code>string</code>
Removes nekudot from Hebrew string

**Kind**: static method of [<code>Locale</code>](#Locale)  

| Param | Type |
| --- | --- |
| str | <code>string</code> | 

<a name="greg"></a>

## greg
Gregorian date helper functions.

**Kind**: global variable  
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
<a name="getPseudoISO"></a>

## getPseudoISO(tzid, date) ⇒ <code>string</code>
Returns a string similar to `Date.toISOString()` but in the
timezone `tzid`. Contrary to the typical meaning of `Z` at the end
of the string, this is not actually a UTC date.

**Kind**: global function  

| Param | Type |
| --- | --- |
| tzid | <code>string</code> | 
| date | <code>Date</code> | 

<a name="getTimezoneOffset"></a>

## getTimezoneOffset(tzid, date) ⇒ <code>number</code>
Returns number of minutes `tzid` is offset from UTC on date `date`.

**Kind**: global function  

| Param | Type |
| --- | --- |
| tzid | <code>string</code> | 
| date | <code>Date</code> | 

<a name="pad4"></a>

## pad4(number) ⇒ <code>string</code>
Formats a number with leading zeros so the resulting string is 4 digits long.
Similar to `string.padStart(4, '0')` but will also format
negative numbers similar to how the JavaScript date formats
negative year numbers (e.g. `-37` is formatted as `-000037`).

**Kind**: global function  

| Param | Type |
| --- | --- |
| number | <code>number</code> | 

<a name="pad2"></a>

## pad2(number) ⇒ <code>string</code>
Formats a number with leading zeros so the resulting string is 2 digits long.
Similar to `string.padStart(2, '0')`.

**Kind**: global function  

| Param | Type |
| --- | --- |
| number | <code>number</code> | 

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

<a name="hd2abs"></a>

## hd2abs()
Converts Hebrew date to R.D. (Rata Die) fixed days.
R.D. 1 is the imaginary date Monday, January 1, 1 on the Gregorian
Calendar.

**Kind**: global function  
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

<a name="molad"></a>

## molad()
Calculates the molad for a Hebrew month

**Kind**: global function  
<a name="omerSefira"></a>

## omerSefira(omerDay, lang) ⇒
Returns the sefira. For example, on day 8
 חֶֽסֶד שֶׁבִּגְבוּרָה
 Chesed shebiGevurah
 Lovingkindness within Might

**Kind**: global function  
**Returns**: a string such as `Lovingkindness within Might` or `חֶֽסֶד שֶׁבִּגְבוּרָה`  

| Param | Description |
| --- | --- |
| omerDay | the day of the omer, 1-49 inclusive |
| lang | `en` (English), `he` (Hebrew with nikud), or `translit` (Hebrew in Sephardic transliteration) |

<a name="omerTodayIs"></a>

## omerTodayIs(omerDay, lang) ⇒
Returns a sentence with that evening's omer count

**Kind**: global function  
**Returns**: a string such as `Today is 10 days, which is 1 week and 3 days of the Omer`
 or `הַיוֹם עֲשָׂרָה יָמִים, שְׁהֵם שָׁבוּעַ אֶחָד וְשְׁלוֹשָׁה יָמִים לָעוֹמֶר`  

| Param | Description |
| --- | --- |
| omerDay | the day of the omer, 1-49 inclusive |
| lang | `en` (English), `he` (Hebrew with nikud) |

<a name="omerEmoji"></a>

## omerEmoji(omerDay) ⇒
Returns an emoji number symbol with a circle, for example `㊲`
 from the “Enclosed CJK Letters and Months” block of the Unicode standard

**Kind**: global function  
**Returns**: a single Unicode character from `①` through `㊾`  

| Param | Description |
| --- | --- |
| omerDay | the day of the omer, 1-49 inclusive |

