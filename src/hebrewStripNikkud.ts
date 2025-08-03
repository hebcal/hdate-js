/**
 * Removes nekudot from Hebrew string
 */
export function hebrewStripNikkud(str: string): string {
  const a = str.normalize();
  // now strip out niqqud and trope
  return a.replace(/[\u0590-\u05bd]/g, '').replace(/[\u05bf-\u05c7]/g, '');
}
