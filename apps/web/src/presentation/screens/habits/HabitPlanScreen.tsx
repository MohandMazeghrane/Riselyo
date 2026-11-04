import type { ReactNode } from 'react';
import type { HabitPlan } from '../../../application/habits/getHabitPlan';
import { HABITS_FORM } from '../../../application/habits/habitsForm';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { FormMessage } from '../../components/FormMessage';
import { LoadState } from '../../components/LoadState';
import { PageLayout } from '../../components/PageLayout';
import { fr } from '../../content/fr';
import { useAction, type ActionRunner } from '../../hooks/useAction';
import { useAsyncData } from '../../hooks/useAsyncData';
import { ActiveHabitItem } from './ActiveHabitItem';
import { AvailableHabitList } from './AvailableHabitList';

/** Profile → my habits: target tiers, stopping a habit, adding one when the time is right. */
export function HabitPlanScreen(): ReactNode {
  const plan = useAsyncData(useContainer().habits.getPlan);
  const action = useAction(plan.reload);
  return (
    <PageLayout title={fr.habitPlan.title} backTo={ROUTES.profile}>
      {plan.status === 'ready' ? (
        <PlanContent plan={plan.data} action={action} />
      ) : (
        <LoadState status={plan.status} onRetry={plan.retry} />
      )}
    </PageLayout>
  );
}

function PlanContent({ plan, action }: { plan: HabitPlan; action: ActionRunner }): ReactNode {
  const isToBuild = (id: string): boolean => HABITS_FORM.toBuild.some((other) => other === id);
  return (
    <>
      {action.error !== null && <FormMessage tone="error">{fr.common.saveError}</FormMessage>}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{fr.habitPlan.activeTitle}</h2>
        {plan.active.length === 0 && <p className="text-slate-600">{fr.habitPlan.noneActive}</p>}
        <ul className="flex flex-col gap-3">
          {plan.active.map((habit) => (
            <li key={habit.templateId}>
              <ActiveHabitItem habit={habit} action={action} />
            </li>
          ))}
        </ul>
      </section>
      <AvailableHabitList
        title={fr.habitPlan.toBuildTitle}
        habits={plan.available.filter(({ templateId }) => isToBuild(templateId))}
        action={action}
      />
      <AvailableHabitList
        title={fr.habitPlan.toReduceTitle}
        hint={fr.habitPlan.toReduceHint}
        habits={plan.available.filter(({ templateId }) => !isToBuild(templateId))}
        action={action}
      />
    </>
  );
}
