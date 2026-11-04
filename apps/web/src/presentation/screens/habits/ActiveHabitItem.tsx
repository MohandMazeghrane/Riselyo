import { useId, type ReactNode } from 'react';
import { targetTiersFor } from '../../../application/habits/habitsForm';
import type { Habit } from '../../../domain/entities/habit';
import { useContainer } from '../../app/ContainerContext';
import { ChoiceGroup } from '../../components/ChoiceGroup';
import { fr } from '../../content/fr';
import { habitLabel, tierText } from '../../content/habitTexts';
import type { ActionRunner } from '../../hooks/useAction';
import { StopHabitButton } from './StopHabitButton';

interface ActiveHabitItemProps {
  readonly habit: Habit;
  readonly action: ActionRunner;
}

/** A followed habit: its target tier (habits to build only) and a confirmed "stop". */
export function ActiveHabitItem({ habit, action }: ActiveHabitItemProps): ReactNode {
  const { habits } = useContainer();
  const label = habitLabel(habit.templateId);
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <h3 id={titleId} className="font-semibold">
        {label}
      </h3>
      {habit.kind === 'do' ? (
        <TargetTierChoice habit={habit} action={action} />
      ) : (
        <p className="text-sm text-slate-600">{fr.habitPlan.reduceHint}</p>
      )}
      <StopHabitButton
        label={label}
        pending={action.pending}
        onConfirm={() => {
          action.run(() => habits.stop(habit.templateId));
        }}
      />
    </article>
  );
}

function TargetTierChoice({ habit, action }: ActiveHabitItemProps): ReactNode {
  const { habits } = useContainer();
  const { templateId } = habit;
  return (
    <ChoiceGroup
      legend={fr.habitPlan.target(habitLabel(templateId))}
      choices={targetTiersFor(templateId).map((tier) => ({
        value: tier,
        label: `${fr.checkIn.levels[tier]} : ${tierText(templateId, tier)}`,
        content: (
          <span className="flex flex-col py-1">
            <span>{fr.checkIn.levels[tier]}</span>
            <span className="text-xs">{tierText(templateId, tier)}</span>
          </span>
        ),
      }))}
      value={habit.tier}
      onChange={(tier) => {
        action.run(() => habits.changeTarget(templateId, tier));
      }}
    />
  );
}
