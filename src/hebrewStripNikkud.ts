/**
 * Removes niqqud from Hebrew string
 * @example
 * hebrewStripNikkud('אֱלוּל');     // 'אלול'
 * hebrewStripNikkud('חֶשְׁוָן');   // 'חשון'
 */
export function hebrewStripNikkud(str: string): string {
  if (typeof str !== 'string') {
    throw new TypeError(`bad nikkud str: ${str}`);
  }
  const a = str.normalize();
  // now strip out niqqud and trope
  return a.replace(/[\u0590-\u05bd]/g, '').replace(/[\u05bf-\u05c7]/g, '');
}
