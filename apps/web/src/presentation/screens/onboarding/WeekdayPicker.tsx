import type { ReactNode } from 'react';
import { ONBOARDING_FORM } from '../../../application/onboarding/onboardingForm';
import type { Weekday } from '../../../domain/entities/rhythm';
import { fr } from '../../content/fr';

interface WeekdayPickerProps {
  readonly selected: readonly Weekday[];
  readonly onToggle: (day: Weekday) => void;
}

/** Seven toggle buttons, Monday to Sunday; none selected by default. */
export function WeekdayPicker({ selected, onToggle }: WeekdayPickerProps): ReactNode {
  return (
    <fieldset>
      <legend className="mb-2 font-medium">{fr.rhythm.sportDays}</legend>
      {/* One row from 375 px; wraps on narrower screens so that each target keeps 44 px. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1">
        {ONBOARDING_FORM.weekdays.map((day) => (
          <button
            key={day}
            type="button"
            aria-pressed={selected.includes(day)}
            aria-label={fr.rhythm.weekdays[day].long}
            onClick={() => {
              onToggle(day);
            }}
            className="min-h-11 rounded-xl font-semibold ring-1 ring-slate-300 aria-pressed:bg-brand-600 aria-pressed:text-white aria-pressed:ring-brand-600"
          >
            {fr.rhythm.weekdays[day].short}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
