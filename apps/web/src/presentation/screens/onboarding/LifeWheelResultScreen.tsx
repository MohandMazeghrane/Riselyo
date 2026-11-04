import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ONBOARDING_FORM } from '../../../application/onboarding/onboardingForm';
import type { LifeWheel } from '../../../domain/entities/lifeWheel';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { Button } from '../../components/Button';
import { FooterActions } from '../../components/FooterActions';
import { LifeWheelRadar } from '../../components/LifeWheelRadar';
import { LoadState } from '../../components/LoadState';
import { StepLayout } from '../../components/StepLayout';
import { fr } from '../../content/fr';
import { useAsyncData } from '../../hooks/useAsyncData';

/** End of screen A1: the starting point on a radar. */
export function LifeWheelResultScreen(): ReactNode {
  const wheel = useAsyncData(useContainer().onboarding.getDayZeroLifeWheel);
  if (wheel.status !== 'ready') {
    return <LoadState status={wheel.status} onRetry={wheel.retry} />;
  }
  return <LifeWheelResult wheel={wheel.data} />;
}

function LifeWheelResult({ wheel }: { readonly wheel: LifeWheel | null }): ReactNode {
  const navigate = useNavigate();
  const axes = ONBOARDING_FORM.lifeDomains.map((domain) => ({
    label: fr.lifeWheel.domains[domain].label,
    score: wheel?.scores[domain] ?? 0,
  }));
  return (
    <StepLayout step={2} title={fr.lifeWheel.resultTitle} backTo={ROUTES.lifeWheel}>
      <p>{fr.lifeWheel.resultText}</p>
      <LifeWheelRadar
        axes={axes}
        maxScore={ONBOARDING_FORM.lifeWheelMaxScore}
        title={fr.lifeWheel.radarLabel}
      />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {axes.map((axis) => (
          <li key={axis.label}>{fr.lifeWheel.scoreLabel(axis.label, axis.score)}</li>
        ))}
      </ul>
      <FooterActions>
        <Button onClick={() => void navigate(ROUTES.measurements)}>{fr.common.next}</Button>
      </FooterActions>
    </StepLayout>
  );
}
