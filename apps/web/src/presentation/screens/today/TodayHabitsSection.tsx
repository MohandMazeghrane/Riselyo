import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { TodayHabits } from '../../../application/habits/getTodayHabits';
import { levelAfterTap } from '../../../application/habits/habitsForm';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { FormMessage } from '../../components/FormMessage';
import { LoadState } from '../../components/LoadState';
import { fr } from '../../content/fr';
import { useAction, type ActionRunner } from '../../hooks/useAction';
import { useAsyncData } from '../../hooks/useAsyncData';
import { HabitTapButton } from './HabitTapButton';
import { QuickButtons } from './QuickButtons';

/** The day's habits (tap to change the level) and the quick buttons. */
export function TodayHabitsSection(): ReactNode {
  const { habits } = useContainer();
  const today = useAsyncData(habits.getToday);
  const action = useAction(today.reload);
  if (today.status !== 'ready') {
    return <LoadState status={today.status} onRetry={today.retry} />;
  }
  return (
    <>
      <section className="flex flex-col gap-3">
        <HabitListHeader />
        <HabitTapList today={today.data} action={action} />
      </section>
      <QuickButtons
        counts={today.data.quick}
        disabled={action.pending}
        onAdjust={(quickAction, adjustment) => {
          action.run(() => habits.adjustQuickCount(quickAction, adjustment));
        }}
      />
      {action.error !== null && (
        <FormMessage tone="error">
          {action.error.code === 'invalid_input' ? fr.quick.limit : fr.common.saveError}
        </FormMessage>
      )}
    </>
  );
}

function HabitListHeader(): ReactNode {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-semibold">{fr.todayHabits.title}</h2>
      <Link
        to={ROUTES.habits}
        className="flex min-h-11 items-center text-sm font-medium text-brand-700"
      >
        {fr.todayHabits.manage}
      </Link>
    </div>
  );
}

interface HabitTapListProps {
  readonly today: TodayHabits;
  readonly action: ActionRunner;
}

function HabitTapList({ today, action }: HabitTapListProps): ReactNode {
  const { habits } = useContainer();
  if (today.habits.length === 0) {
    return <p className="text-slate-600">{fr.todayHabits.empty}</p>;
  }
  return (
    <>
      <p className="text-sm text-slate-600">{fr.todayHabits.hint}</p>
      <ul className="flex flex-col gap-2">
        {today.habits.map((item) => {
          const { templateId } = item.habit;
          const next = levelAfterTap(templateId, item.level);
          return (
            <li key={templateId}>
              <HabitTapButton
                item={item}
                disabled={action.pending}
                onTap={() => {
                  action.run(() => habits.logLevel(templateId, next));
                }}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
