import type { EveningForm, MorningForm } from '../../../application/checkin/checkInForm';
import type { CheckInDay } from '../../../application/checkin/getCheckInDay';
import { defaultRhythmForm } from '../../../application/onboarding/onboardingForm';
import type { DailyPriority } from '../../../domain/entities/dayEntry';
import type { HabitLevelAnswers } from '../../../domain/entities/habitLog';
import { fr } from '../../content/fr';

/** Today's answers if the check-in was already done, otherwise the usual rhythm. */
export function initialMorningForm({ entry, rhythm }: CheckInDay): MorningForm {
  const usual = rhythm ?? defaultRhythmForm();
  const morning = entry.morning;
  return {
    bedtime: morning?.bedtime ?? usual.bedtime,
    wakeTime: morning?.wakeTime ?? usual.wakeTime,
    sleepQuality: morning?.sleepQuality,
    energy: morning?.energy,
    priority: morning?.priority ?? null,
  };
}

export function initialEveningForm({ entry, habitLogs }: CheckInDay): EveningForm {
  const evening = entry.evening;
  const habitLevels: HabitLevelAnswers = Object.fromEntries(
    habitLogs.map((log) => [log.templateId, log.level]),
  );
  return {
    mood: evening?.mood,
    stress: evening?.stress,
    priorityKept: evening?.priorityKept ?? null,
    victory: evening?.victory ?? '',
    habitLevels,
  };
}

/** How the morning priority is named in the evening question. */
export function priorityLabel(priority: DailyPriority): string {
  return priority.kind === 'habit' ? fr.habits[priority.templateId].label : priority.text;
}
