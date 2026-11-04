import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ONBOARDING_FORM } from '../../../application/onboarding/onboardingForm';
import type { DoHabitId } from '../../../domain/entities/habit';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { FormMessage } from '../../components/FormMessage';
import { StepForm } from '../../components/StepForm';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { GoalOption } from './GoalOption';

/** Screen A5: up to 3 habits from the catalogue, each starting small. */
export function GoalsScreen(): ReactNode {
  const navigate = useNavigate();
  const goals = useGoalSelection();
  const submission = useSubmit(useContainer().onboarding.submitFirstGoals, () => {
    void navigate(ROUTES.consents);
  });
  return (
    <StepForm
      step={6}
      title={fr.goals.title}
      backTo={ROUTES.why}
      onSubmit={() => {
        submission.submit(goals.chosen);
      }}
      pending={submission.pending}
      error={submission.error}
      submitLabel={fr.goals.finish}
      submitDisabled={goals.chosen.length === 0}
    >
      <p>{fr.goals.intro}</p>
      <GoalList goals={goals} />
      {goals.tooMany && <FormMessage tone="info">{fr.goals.tooMany}</FormMessage>}
    </StepForm>
  );
}

function GoalList({ goals }: { readonly goals: GoalSelection }): ReactNode {
  return (
    <ul className="flex flex-col gap-2">
      {ONBOARDING_FORM.habitTemplateIds.map((id) => (
        <li key={id}>
          <GoalOption id={id} checked={goals.chosen.includes(id)} onToggle={goals.toggle} />
        </li>
      ))}
    </ul>
  );
}

interface GoalSelection {
  readonly chosen: readonly DoHabitId[];
  readonly tooMany: boolean;
  readonly toggle: (id: DoHabitId) => void;
}

/** A 4th pick is refused with a kind message rather than silently ignored. */
function useGoalSelection(): GoalSelection {
  const [chosen, setChosen] = useState<readonly DoHabitId[]>([]);
  const [tooMany, setTooMany] = useState(false);
  const toggle = (id: DoHabitId): void => {
    const isChosen = chosen.includes(id);
    const full = chosen.length >= ONBOARDING_FORM.maxFirstGoals;
    setTooMany(!isChosen && full);
    if (isChosen || !full) {
      setChosen(isChosen ? chosen.filter((candidate) => candidate !== id) : [...chosen, id]);
    }
  };
  return { chosen, tooMany, toggle };
}
