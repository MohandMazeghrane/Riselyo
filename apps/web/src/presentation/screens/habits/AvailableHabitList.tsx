import type { ReactNode } from 'react';
import type { AvailableHabit } from '../../../application/habits/getHabitPlan';
import { HABITS_FORM, toPercent } from '../../../application/habits/habitsForm';
import type { HabitAdditionCheck } from '../../../domain/entities/habitProgress';
import { useContainer } from '../../app/ContainerContext';
import { FormMessage } from '../../components/FormMessage';
import { fr } from '../../content/fr';
import { habitLabel } from '../../content/habitTexts';
import type { ActionRunner } from '../../hooks/useAction';

interface AvailableHabitListProps {
  readonly title: string;
  readonly hint?: string;
  readonly habits: readonly AvailableHabit[];
  readonly action: ActionRunner;
}

/** Habits not followed yet; when it is too early, a kind word says why instead of the buttons. */
export function AvailableHabitList(props: AvailableHabitListProps): ReactNode {
  const { title, hint, habits, action } = props;
  if (habits.length === 0) {
    return null;
  }
  const waiting = habits.find(({ check }) => !check.allowed)?.check;
  const addable = habits.filter(({ check }) => check.allowed);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint !== undefined && <p className="text-sm text-slate-600">{hint}</p>}
      {waiting !== undefined && addable.length === 0 ? (
        <FormMessage tone="info">{waitingMessage(waiting)}</FormMessage>
      ) : (
        <ul className="flex flex-col gap-2">
          {addable.map(({ templateId }) => (
            <li key={templateId}>
              <AddButton templateId={templateId} action={action} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AddButton({
  templateId,
  action,
}: Pick<AvailableHabit, 'templateId'> & {
  readonly action: ActionRunner;
}): ReactNode {
  const { habits } = useContainer();
  const label = habitLabel(templateId);
  return (
    <button
      type="button"
      disabled={action.pending}
      aria-label={fr.habitPlan.add(label)}
      onClick={() => {
        action.run(() => habits.add(templateId));
      }}
      className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-white px-4 text-left ring-1 ring-slate-300 active:bg-brand-50 disabled:opacity-60"
    >
      <span>{label}</span>
      <span className="font-semibold text-brand-700">{fr.habitPlan.addShort}</span>
    </button>
  );
}

function waitingMessage(check: HabitAdditionCheck): string {
  const { minAnsweredDays, minAdherencePercent } = HABITS_FORM;
  if (check.allowed || check.reason === 'already_active') {
    return fr.habitPlan.waitIntro;
  }
  const detail =
    check.reason === 'not_enough_data'
      ? fr.habitPlan.reasons.not_enough_data(check.answeredDays, minAnsweredDays)
      : fr.habitPlan.reasons.low_adherence(toPercent(check.adherence), minAdherencePercent);
  return `${fr.habitPlan.waitIntro} ${detail}`;
}
