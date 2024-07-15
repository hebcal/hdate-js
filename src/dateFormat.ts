import {pad2, pad4} from './pad';

const _formatters = new Map();

/**
 * @private
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
 */
export function getTimezoneOffset(tzid: string, date: Date): number {
  const utcStr = getPseudoISO('UTC', date);
  const localStr = getPseudoISO(tzid, date);
  const diffMs = new Date(utcStr).getTime() - new Date(localStr).getTime();
  return Math.ceil(diffMs / 1000 / 60);
}

/**
 * Returns YYYY-MM-DD in the local timezone
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
