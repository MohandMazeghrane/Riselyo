import type { ReactNode } from 'react';
import type { OnboardingStatus } from '../../../application/onboarding/getOnboardingStatus';
import { LoadState } from '../../components/LoadState';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';

interface WithOnboardingStatusProps {
  readonly children: (status: OnboardingStatus) => ReactNode;
}

/** Loads what was already answered, so that coming back to a screen keeps the answers. */
export function WithOnboardingStatus({ children }: WithOnboardingStatusProps): ReactNode {
  const status = useOnboardingStatus();
  if (status.status !== 'ready') {
    return <LoadState status={status.status} onRetry={status.retry} />;
  }
  return children(status.data);
}
