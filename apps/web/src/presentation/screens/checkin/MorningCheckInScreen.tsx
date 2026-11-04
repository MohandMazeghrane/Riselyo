import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import type { MorningForm } from '../../../application/checkin/checkInForm';
import type { Habit } from '../../../domain/entities/habit';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { ScaleQuestion } from './ScaleQuestion';
import { StepForm } from '../../components/StepForm';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { initialMorningForm } from './checkInDrafts';
import { PriorityPicker } from './PriorityPicker';
import { SleepTimes } from './SleepTimes';
import { WithCheckInDay } from './WithCheckInDay';

/** Morning check-in: about 20 seconds, in buttons. */
export function MorningCheckInScreen(): ReactNode {
  return (
    <WithCheckInDay>
      {(day) => <MorningFormView initial={initialMorningForm(day)} habits={day.activeHabits} />}
    </WithCheckInDay>
  );
}

interface MorningFormViewProps {
  readonly initial: MorningForm;
  readonly habits: readonly Habit[];
}

function MorningFormView({ initial, habits }: MorningFormViewProps): ReactNode {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const update = (change: Partial<MorningForm>): void => {
    setForm((previous) => ({ ...previous, ...change }));
  };
  const submission = useSubmit(useContainer().checkIn.submitMorning, () => {
    void navigate(ROUTES.today);
  });
  return (
    <StepForm
      title={fr.checkIn.morningTitle}
      backTo={ROUTES.today}
      onSubmit={() => {
        submission.submit(form);
      }}
      pending={submission.pending}
      error={submission.error}
      invalidMessage={fr.checkIn.invalid}
      submitLabel={fr.checkIn.save}
    >
      <SleepTimes bedtime={form.bedtime} wakeTime={form.wakeTime} onChange={update} />
      <MorningQuestions form={form} habits={habits} update={update} />
    </StepForm>
  );
}

interface MorningQuestionsProps {
  readonly form: MorningForm;
  readonly habits: readonly Habit[];
  readonly update: (change: Partial<MorningForm>) => void;
}

function MorningQuestions({ form, habits, update }: MorningQuestionsProps): ReactNode {
  return (
    <>
      <ScaleQuestion
        legend={fr.checkIn.sleepQuality}
        hint={fr.checkIn.sleepQualityHint}
        value={form.sleepQuality}
        onChange={(sleepQuality) => {
          update({ sleepQuality });
        }}
      />
      <ScaleQuestion
        legend={fr.checkIn.energy}
        hint={fr.checkIn.energyHint}
        value={form.energy}
        onChange={(energy) => {
          update({ energy });
        }}
      />
      <PriorityPicker
        habits={habits}
        value={form.priority}
        onChange={(priority) => {
          update({ priority });
        }}
      />
    </>
  );
}
