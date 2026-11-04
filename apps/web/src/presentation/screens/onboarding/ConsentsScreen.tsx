import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
  CONSENT_FORM,
  noConsentChoices,
  withChoice,
} from '../../../application/privacy/consentForm';
import type { ConsentChoices } from '../../../domain/entities/consent';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { FormMessage } from '../../components/FormMessage';
import { StepForm } from '../../components/StepForm';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { ConsentList } from '../privacy/ConsentList';

/** Screen A6: everything off by default, one switch per processing. */
export function ConsentsScreen(): ReactNode {
  const navigate = useNavigate();
  const [choices, setChoices] = useState<ConsentChoices>(noConsentChoices());
  const submission = useSubmit(useContainer().onboarding.submitConsents, () => {
    void navigate(ROUTES.today, { replace: true });
  });
  return (
    <StepForm
      step={7}
      title={fr.consents.onboardingTitle}
      backTo={ROUTES.goals}
      onSubmit={() => {
        submission.submit(choices);
      }}
      pending={submission.pending}
      error={submission.error}
      submitLabel={fr.consents.confirm}
    >
      <p>{fr.consents.intro}</p>
      <FormMessage tone="info">{fr.consents.localTracking}</FormMessage>
      <ConsentList
        items={CONSENT_FORM.purposes.map((purpose) => ({ purpose, granted: choices[purpose] }))}
        onChange={(purpose, granted) => {
          setChoices((previous) => withChoice(previous, purpose, granted));
        }}
      />
      <p className="text-sm text-slate-600">{fr.consents.upcoming}</p>
    </StepForm>
  );
}
