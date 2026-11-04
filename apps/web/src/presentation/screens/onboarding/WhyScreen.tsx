import { useId, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ONBOARDING_FORM } from '../../../application/onboarding/onboardingForm';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { HelpBannerFor } from '../../components/HelpBannerFor';
import { StepForm } from '../../components/StepForm';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { WithOnboardingStatus } from './WithOnboardingStatus';

/** Screen A4: one optional sentence, brought back on difficult days. */
export function WhyScreen(): ReactNode {
  return (
    <WithOnboardingStatus>
      {({ profile }) => <WhyForm initialWhy={profile?.why ?? ''} />}
    </WithOnboardingStatus>
  );
}

function WhyForm({ initialWhy }: { readonly initialWhy: string }): ReactNode {
  const navigate = useNavigate();
  const [why, setWhy] = useState(initialWhy);
  const submission = useSubmit(useContainer().onboarding.submitWhy, () => {
    void navigate(ROUTES.goals);
  });
  return (
    <StepForm
      step={5}
      title={fr.why.title}
      backTo={ROUTES.rhythm}
      onSubmit={() => {
        submission.submit(why);
      }}
      pending={submission.pending}
      error={submission.error}
    >
      <WhyField value={why} onChange={setWhy} />
    </StepForm>
  );
}

interface WhyFieldProps {
  readonly value: string;
  readonly onChange: (why: string) => void;
}

function WhyField({ value, onChange }: WhyFieldProps): ReactNode {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-medium">
        {fr.why.label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={4}
        maxLength={ONBOARDING_FORM.whyMaxLength}
        aria-describedby={`${id}-hint`}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="rounded-xl bg-white p-4 text-base ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-600 focus:outline-none"
      />
      <p id={`${id}-hint`} className="flex justify-between gap-3 text-sm text-slate-600">
        <span>{fr.why.hint}</span>
        <span>{fr.why.counter(value.length, ONBOARDING_FORM.whyMaxLength)}</span>
      </p>
      <HelpBannerFor text={value} />
    </div>
  );
}
