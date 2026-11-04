import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ONBOARDING_FORM } from '../../../application/onboarding/onboardingForm';
import type { LifeDomain, LifeWheel } from '../../../domain/entities/lifeWheel';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { LoadState } from '../../components/LoadState';
import { ScoreScale } from '../../components/ScoreScale';
import { StepForm } from '../../components/StepForm';
import { fr } from '../../content/fr';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useSubmit } from '../../hooks/useSubmit';

type Scores = Partial<Record<LifeDomain, number>>;

const SCORES = Array.from(
  { length: ONBOARDING_FORM.lifeWheelMaxScore - ONBOARDING_FORM.lifeWheelMinScore + 1 },
  (_, index) => ONBOARDING_FORM.lifeWheelMinScore + index,
);

/** Screen A1: the 8 domains, each one must be touched before going on. */
export function LifeWheelScreen(): ReactNode {
  const wheel = useAsyncData(useContainer().onboarding.getDayZeroLifeWheel);
  if (wheel.status !== 'ready') {
    return <LoadState status={wheel.status} onRetry={wheel.retry} />;
  }
  return <LifeWheelForm initial={wheel.data} />;
}

function LifeWheelForm({ initial }: { readonly initial: LifeWheel | null }): ReactNode {
  const navigate = useNavigate();
  const [scores, setScores] = useState<Scores>(initial?.scores ?? {});
  const submission = useSubmit(useContainer().onboarding.submitLifeWheel, () => {
    void navigate(ROUTES.lifeWheelResult);
  });
  const remaining = ONBOARDING_FORM.lifeDomains.filter((domain) => scores[domain] === undefined);
  return (
    <StepForm
      step={2}
      title={fr.lifeWheel.title}
      backTo={ROUTES.welcome}
      onSubmit={() => {
        submission.submit(scores);
      }}
      pending={submission.pending}
      error={submission.error}
      submitDisabled={remaining.length > 0}
      footerBefore={<RemainingHint count={remaining.length} />}
    >
      <p>{fr.lifeWheel.intro}</p>
      <DomainScales
        scores={scores}
        onScore={(domain, score) => {
          setScores((previous) => ({ ...previous, [domain]: score }));
        }}
      />
    </StepForm>
  );
}

function RemainingHint({ count }: { readonly count: number }): ReactNode {
  if (count === 0) {
    return null;
  }
  return <p className="text-center text-sm text-slate-600">{fr.lifeWheel.remaining(count)}</p>;
}

interface DomainScalesProps {
  readonly scores: Scores;
  readonly onScore: (domain: LifeDomain, score: number) => void;
}

function DomainScales({ scores, onScore }: DomainScalesProps): ReactNode {
  return ONBOARDING_FORM.lifeDomains.map((domain) => (
    <ScoreScale
      key={domain}
      name={domain}
      label={fr.lifeWheel.domains[domain].label}
      help={fr.lifeWheel.domains[domain].help}
      scores={SCORES}
      value={scores[domain]}
      onChange={(score) => {
        onScore(domain, score);
      }}
    />
  ));
}
