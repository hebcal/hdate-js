import {monthsInYear} from './hdate';

/**
 * Represents a molad, the moment when the new moon is "born"
 */
export type Molad = {
  /** Hebrew year */
  readonly year: number;
  /** Hebrew month */
  readonly month: number;
  /** Day of Week (0=Sunday, 6=Saturday) */
  readonly dayOfWeek: number;
  /** hour of day (0-23) */
  readonly hour: number;
  /** minutes past hour (0-59) */
  readonly minutes: number;
  /** parts of a minute (0-17) */
  readonly chalakim: number;
};

/**
 * Calculates the molad for a Hebrew month
 */
export function molad(year: number, month: number): Molad {
  let m_adj = month - 7;
  if (m_adj < 0) {
    m_adj += monthsInYear(year);
  }

  const mElapsed =
    235 * Math.floor((year - 1) / 19) + // Months in complete 19 year lunar (Metonic) cycles so far
    12 * ((year - 1) % 19) + // Regular months in this cycle
    Math.floor((7 * ((year - 1) % 19) + 1) / 19) + // Leap months this cycle
    m_adj; // add elapsed months till the start of the molad of the month

  const pElapsed = 204 + Math.floor(793 * (mElapsed % 1080));

  const hElapsed =
    5 +
    12 * mElapsed +
    793 * Math.floor(mElapsed / 1080) +
    Math.floor(pElapsed / 1080) -
    6;

  const parts = (pElapsed % 1080) + 1080 * (hElapsed % 24);

  const chalakim = parts % 1080;

  const day = 1 + 29 * mElapsed + Math.floor(hElapsed / 24);

  return {
    year,
    month,
    dayOfWeek: day % 7,
    hour: hElapsed % 24,
    minutes: Math.floor(chalakim / 18),
    chalakim: chalakim % 18,
  };
}
