import {
  HIGH_STRESS_LEVEL,
  HIGH_STRESS_MIN_EVENINGS,
  LOW_MOOD_MAX,
  LOW_MOOD_MIN_ANSWERED_EVENINGS,
  WELLBEING_WINDOW_DAYS,
} from '../config/safety';
import type { DayEntry, EveningCheckIn } from '../entities/dayEntry';
import { daysBefore, type DayKey } from '../shared/dayKey';

export type WellbeingSignal = 'low_mood' | 'high_stress';

/**
 * Whether to show the caring card (invite to talk to someone close or a doctor).
 * Only answered evenings of the last 7 days count: an unanswered day never triggers anything.
 */
export function wellbeingSignal(
  entries: readonly DayEntry[],
  today: DayKey,
): WellbeingSignal | null {
  const week = new Set<DayKey>([today, ...daysBefore(today, WELLBEING_WINDOW_DAYS - 1)]);
  const evenings = entries
    .filter((entry) => week.has(entry.day))
    .map((entry) => entry.evening)
    .filter((evening): evening is EveningCheckIn => evening !== null);
  const lowMood =
    evenings.length >= LOW_MOOD_MIN_ANSWERED_EVENINGS &&
    evenings.every((evening) => evening.mood <= LOW_MOOD_MAX);
  if (lowMood) {
    return 'low_mood';
  }
  const stressedEvenings = evenings.filter((evening) => evening.stress >= HIGH_STRESS_LEVEL);
  return stressedEvenings.length >= HIGH_STRESS_MIN_EVENINGS ? 'high_stress' : null;
}
