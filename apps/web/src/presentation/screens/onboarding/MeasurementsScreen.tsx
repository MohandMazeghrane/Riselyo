import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { FormMessage } from '../../components/FormMessage';
import { StepForm } from '../../components/StepForm';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { MeasurementFields } from './MeasurementFields';
import {
  draftToValues,
  EMPTY_MEASUREMENTS_DRAFT,
  type MeasurementsDraft,
} from './measurementsForm';

/** Screen A2: everything optional, "Passer" always visible. */
export function MeasurementsScreen(): ReactNode {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<MeasurementsDraft>(EMPTY_MEASUREMENTS_DRAFT);
  const submission = useSubmit(useContainer().onboarding.submitMeasurements, () => {
    void navigate(ROUTES.rhythm);
  });
  return (
    <StepForm
      step={3}
      title={fr.measurements.title}
      backTo={ROUTES.lifeWheelResult}
      onSubmit={() => {
        submission.submit(draftToValues(draft));
      }}
      pending={submission.pending}
      error={submission.error}
      invalidMessage={fr.measurements.invalid}
      onSkip={() => {
        submission.submit({});
      }}
    >
      <p>{fr.measurements.intro}</p>
      <MeasurementFields draft={draft} onChange={setDraft} />
      <FormMessage tone="info">{fr.measurements.privacy}</FormMessage>
    </StepForm>
  );
}
