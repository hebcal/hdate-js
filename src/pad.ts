/**
 * Formats a number with leading zeros so the resulting string is 4 digits long.
 * Similar to `string.padStart(4, '0')` but will also format
 * negative numbers similar to how the JavaScript date formats
 * negative year numbers (e.g. `-37` is formatted as `-000037`).
 */
export function pad4(num: number): string {
  if (num < 0) {
    return '-00' + pad4(-num);
  } else if (num < 10) {
    return '000' + num;
  } else if (num < 100) {
    return '00' + num;
  } else if (num < 1000) {
    return '0' + num;
  }
  return String(num);
}

/**
 * Formats a number with leading zeros so the resulting string is 2 digits long.
 * Similar to `string.padStart(2, '0')`.
 */
export function pad2(num: number): string {
  if (num >= 0 && num < 10) {
    return '0' + num;
  }
  return String(num);
}
