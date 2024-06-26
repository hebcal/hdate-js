const _formatters = new Map();

/**
 * @private
 * @param {string} tzid
 * @return {Intl.DateTimeFormat}
 */
function getFormatter(tzid: string): Intl.DateTimeFormat {
  const fmt = _formatters.get(tzid);
  if (fmt) return fmt;
  const f = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: tzid,
  });
  _formatters.set(tzid, f);
  return f;
}

const dateFormatRegex = /^(\d+).(\d+).(\d+),?\s+(\d+).(\d+).(\d+)/;

/**
 * Returns a string similar to `Date.toISOString()` but in the
 * timezone `tzid`. Contrary to the typical meaning of `Z` at the end
 * of the string, this is not actually a UTC date. 
 * @param {string} tzid
 * @param {Date} date
 * @return {string}
 */
export function getPseudoISO(tzid: string, date: Date): string {
  const str = getFormatter(tzid).format(date);
  const m = dateFormatRegex.exec(str);
  if (m === null) {
    throw new Error(`Unable to parse formatted string: ${str}`);
  }
  let hour = m[4];
  if (hour === '24') {
    hour = '00';
  }
  m[3] = pad4(parseInt(m[3], 10));
  return `${m[3]}-${m[1]}-${m[2]}T${hour}:${m[5]}:${m[6]}Z`;
}

/**
 * Returns number of minutes `tzid` is offset from UTC on date `date`.
 * @param {string} tzid
 * @param {Date} date
 * @return {number}
 */
export function getTimezoneOffset(tzid: string, date: Date): number {
  const utcStr = getPseudoISO('UTC', date);
  const localStr = getPseudoISO(tzid, date);
  const diffMs = new Date(utcStr).getTime() - new Date(localStr).getTime();
  return Math.ceil(diffMs / 1000 / 60);
}

/**
 * Formats a number with leading zeros so the resulting string is 4 digits long.
 * Similar to `string.padStart(4, '0')` but will also format
 * negative numbers similar to how the JavaScript date formats
 * negative year numbers (e.g. `-37` is formatted as `-000037`).
 * @param {number} number
 * @return {string}
 */
export function pad4(number: number): string {
  if (number < 0) {
    return '-00' + pad4(-number);
  } else if (number < 10) {
    return '000' + number;
  } else if (number < 100) {
    return '00' + number;
  } else if (number < 1000) {
    return '0' + number;
  }
  return String(number);
}

/**
 * Formats a number with leading zeros so the resulting string is 2 digits long.
 * Similar to `string.padStart(2, '0')`.
 * @param {number} number
 * @return {string}
 */
export function pad2(number: number): string {
  if (number < 10) {
    return '0' + number;
  }
  return String(number);
}

/**
 * Returns YYYY-MM-DD in the local timezone
 * @private
 * @param {Date} dt
 * @return {string}
 */
export function isoDateString(dt: Date): string {
  return (
    pad4(dt.getFullYear()) +
    '-' +
    pad2(dt.getMonth() + 1) +
    '-' +
    pad2(dt.getDate())
  );
}
