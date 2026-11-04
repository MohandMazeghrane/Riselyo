import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { LoadState } from '../components/LoadState';
import { TabBar } from '../components/TabBar';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { STEP_ROUTES } from './routes';

/** Frame of the five tabs. Until the onboarding is finished, it sends the user back where they left it. */
export function TabLayout(): ReactNode {
  const status = useOnboardingStatus();
  if (status.status !== 'ready') {
    return <LoadState status={status.status} onRetry={status.retry} />;
  }
  const { nextStep, profile } = status.data;
  if (nextStep !== 'done' || profile === null) {
    return <Navigate to={STEP_ROUTES[nextStep === 'done' ? 'welcome' : nextStep]} replace />;
  }
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  );
}
