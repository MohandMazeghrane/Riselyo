import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { defaultRhythmForm, type RhythmForm } from '../../../application/onboarding/onboardingForm';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { FormMessage } from '../../components/FormMessage';
import { StepForm } from '../../components/StepForm';
import { TextField } from '../../components/TextField';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { SleepTargetField } from './SleepTargetField';
import { useRhythmDraft, type RhythmDraft, type TimeField } from './useRhythmDraft';
import { WeekdayPicker } from './WeekdayPicker';
import { WithOnboardingStatus } from './WithOnboardingStatus';

/** Screen A3. */
export function RhythmScreen(): ReactNode {
  return (
    <WithOnboardingStatus>
      {({ profile }) => <RhythmFormView initial={profile?.rhythm ?? defaultRhythmForm()} />}
    </WithOnboardingStatus>
  );
}

function RhythmFormView({ initial }: { readonly initial: RhythmForm }): ReactNode {
  const navigate = useNavigate();
  const draft = useRhythmDraft(initial);
  const submission = useSubmit(useContainer().onboarding.submitRhythm, () => {
    void navigate(ROUTES.why);
  });
  return (
    <StepForm
      step={4}
      title={fr.rhythm.title}
      backTo={ROUTES.measurements}
      onSubmit={() => {
        submission.submit(draft.form);
      }}
      pending={submission.pending}
      error={submission.error}
      invalidMessage={fr.rhythm.invalid}
    >
      <RhythmFields draft={draft} />
    </StepForm>
  );
}

function RhythmFields({ draft }: { readonly draft: RhythmDraft }): ReactNode {
  return (
    <>
      <TimeInput draft={draft} field="wakeTime" label={fr.rhythm.wakeTime} />
      <TimeInput draft={draft} field="bedtime" label={fr.rhythm.bedtime} />
      <SleepTargetField minutes={draft.form.sleepTargetMinutes} onChange={draft.setSleepTarget} />
      {draft.warning !== null && (
        <FormMessage tone="info">{fr.rhythm.warnings[draft.warning]}</FormMessage>
      )}
      <TimeInput draft={draft} field="eveningCheckInTime" label={fr.rhythm.eveningCheckIn} />
      <WeekdayPicker selected={draft.form.sportDays} onToggle={draft.toggleSportDay} />
    </>
  );
}

interface TimeInputProps {
  readonly draft: RhythmDraft;
  readonly field: TimeField;
  readonly label: string;
}

function TimeInput({ draft, field, label }: TimeInputProps): ReactNode {
  return (
    <TextField
      type="time"
      label={label}
      value={draft.form[field]}
      onChange={(event) => {
        draft.setTime(field, event.target.value);
      }}
    />
  );
}
