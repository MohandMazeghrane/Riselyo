import type { ReactNode } from 'react';
import { startingTierOf } from '../../../application/onboarding/onboardingForm';
import type { DoHabitId } from '../../../domain/entities/habit';
import { fr } from '../../content/fr';

interface GoalOptionProps {
  readonly id: DoHabitId;
  readonly checked: boolean;
  readonly onToggle: (id: DoHabitId) => void;
}

/** One habit of the catalogue, with the tier it will start at. */
export function GoalOption({ id, checked, onToggle }: GoalOptionProps): ReactNode {
  const habit = fr.habits[id];
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 has-checked:ring-2 has-checked:ring-brand-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {
          onToggle(id);
        }}
        className="size-5 accent-brand-600"
      />
      <span className="flex flex-col">
        <span className="font-semibold">{habit.label}</span>
        <span className="text-sm text-slate-600">
          {fr.goals.startWith(habit[startingTierOf(id)])}
        </span>
      </span>
    </label>
  );
}
