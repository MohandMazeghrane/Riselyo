import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import type { EveningForm } from '../../../application/checkin/checkInForm';
import type { CheckInDay } from '../../../application/checkin/getCheckInDay';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { StepForm } from '../../components/StepForm';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { initialEveningForm } from './checkInDrafts';
import { EveningFields } from './EveningFields';
import { WithCheckInDay } from './WithCheckInDay';

/** Evening check-in: about 30 seconds, in buttons. */
export function EveningCheckInScreen(): ReactNode {
  return <WithCheckInDay>{(day) => <EveningFormView day={day} />}</WithCheckInDay>;
}

function EveningFormView({ day }: { readonly day: CheckInDay }): ReactNode {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => initialEveningForm(day));
  const update = (change: Partial<EveningForm>): void => {
    setForm((previous) => ({ ...previous, ...change }));
  };
  const submission = useSubmit(useContainer().checkIn.submitEvening, () => {
    void navigate(ROUTES.today);
  });
  return (
    <StepForm
      title={fr.checkIn.eveningTitle}
      backTo={ROUTES.today}
      onSubmit={() => {
        submission.submit(form);
      }}
      pending={submission.pending}
      error={submission.error}
      invalidMessage={fr.checkIn.invalid}
      submitLabel={fr.checkIn.save}
    >
      <EveningFields form={form} day={day} update={update} />
    </StepForm>
  );
}
