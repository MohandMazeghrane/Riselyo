import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { ONBOARDING_FORM } from '../../../application/onboarding/onboardingForm';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { StepForm } from '../../components/StepForm';
import { TextField } from '../../components/TextField';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { WithOnboardingStatus } from './WithOnboardingStatus';

/** Screen A0. */
export function WelcomeScreen(): ReactNode {
  return (
    <WithOnboardingStatus>
      {({ profile }) => <WelcomeForm initialFirstName={profile?.firstName ?? ''} />}
    </WithOnboardingStatus>
  );
}

function WelcomeForm({ initialFirstName }: { readonly initialFirstName: string }): ReactNode {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(initialFirstName);
  const submission = useSubmit(useContainer().onboarding.submitWelcome, () => {
    void navigate(ROUTES.lifeWheel);
  });
  return (
    <StepForm
      step={1}
      title={fr.welcome.title}
      onSubmit={() => {
        submission.submit(firstName);
      }}
      pending={submission.pending}
      error={submission.error}
      invalidMessage={fr.welcome.firstNameRequired}
    >
      <p>{fr.welcome.intro}</p>
      <FirstNameField value={firstName} onChange={setFirstName} />
      <SafetyNote />
    </StepForm>
  );
}

interface FirstNameFieldProps {
  readonly value: string;
  readonly onChange: (firstName: string) => void;
}

function FirstNameField({ value, onChange }: FirstNameFieldProps): ReactNode {
  return (
    <TextField
      label={fr.welcome.firstNameLabel}
      hint={fr.welcome.firstNameHint}
      value={value}
      maxLength={ONBOARDING_FORM.firstNameMaxLength}
      autoComplete="given-name"
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
}

function SafetyNote(): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      {fr.common.notAProfessional}{' '}
      <Link
        to={ROUTES.help}
        className="inline-flex min-h-11 items-center font-medium text-brand-700 underline"
      >
        {fr.common.needHelp}
      </Link>
    </p>
  );
}
