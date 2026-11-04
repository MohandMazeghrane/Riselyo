import { useState } from 'react';
import {
  sleepWarning,
  suggestSleepMinutes,
  type RhythmForm,
} from '../../../application/onboarding/onboardingForm';
import type { SleepWarning, Weekday } from '../../../domain/entities/rhythm';

export type TimeField = 'wakeTime' | 'bedtime' | 'eveningCheckInTime';

export interface RhythmDraft {
  readonly form: RhythmForm;
  readonly warning: SleepWarning | null;
  readonly setTime: (field: TimeField, value: string) => void;
  readonly setSleepTarget: (minutes: number) => void;
  readonly toggleSportDay: (day: Weekday) => void;
}

/**
 * The sleep target follows bedtime and wake time ("calculée") until the user
 * sets it by hand ("modifiable").
 */
export function useRhythmDraft(initial: RhythmForm): RhythmDraft {
  const [form, setForm] = useState(initial);
  const [targetSetByHand, setTargetSetByHand] = useState(
    suggestSleepMinutes(initial.bedtime, initial.wakeTime) !== initial.sleepTargetMinutes,
  );
  const setTime = (field: TimeField, value: string): void => {
    setForm((previous) => {
      const next = { ...previous, [field]: value };
      const suggested = suggestSleepMinutes(next.bedtime, next.wakeTime);
      return targetSetByHand || suggested === null
        ? next
        : { ...next, sleepTargetMinutes: suggested };
    });
  };
  const setSleepTarget = (minutes: number): void => {
    setTargetSetByHand(true);
    setForm((previous) => ({ ...previous, sleepTargetMinutes: minutes }));
  };
  const toggleSportDay = (day: Weekday): void => {
    setForm((previous) => ({ ...previous, sportDays: toggle(previous.sportDays, day) }));
  };
  return {
    form,
    warning: sleepWarning(form.sleepTargetMinutes),
    setTime,
    setSleepTarget,
    toggleSportDay,
  };
}

function toggle(days: readonly Weekday[], day: Weekday): Weekday[] {
  return days.includes(day) ? days.filter((candidate) => candidate !== day) : [...days, day];
}
