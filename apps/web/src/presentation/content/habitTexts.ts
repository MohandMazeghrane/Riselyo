import type { HabitKind, HabitTemplateId, HabitTier } from '../../domain/entities/habit';
import type { HabitLevel } from '../../domain/entities/habitLog';
import { fr } from './fr';

interface HabitTexts {
  readonly label: string;
  readonly min?: string;
  readonly normal?: string;
  readonly excellent?: string;
}

export function habitLabel(templateId: HabitTemplateId): string {
  return fr.habits[templateId].label;
}

/** What a tier means for this habit ("30 min"); empty for a habit to reduce. */
export function tierText(templateId: HabitTemplateId, tier: HabitTier): string {
  const texts: HabitTexts = fr.habits[templateId];
  return texts[tier] ?? '';
}

/** "Minimum", "Normal"… or, for a habit to reduce, "Journée sans" / "C’est arrivé". */
export function levelText(kind: HabitKind, level: HabitLevel): string {
  if (kind === 'reduce') {
    return level === 'none' ? fr.todayHabits.reduceLevels.none : fr.todayHabits.reduceLevels.normal;
  }
  return fr.checkIn.levels[level];
}
