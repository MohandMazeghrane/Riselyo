import type { ReactNode } from 'react';
import { ROUTES } from '../../app/routes';
import { PageLayout } from '../../components/PageLayout';
import { fr } from '../../content/fr';
import { useInstallState } from '../../hooks/useInstallState';
import { InstallSteps } from './InstallSteps';

/** Profile → install on the iPhone: the guide, always reachable, works offline. */
export function InstallScreen(): ReactNode {
  return (
    <PageLayout title={fr.install.title} backTo={ROUTES.profile}>
      <InstallSteps state={useInstallState()} />
    </PageLayout>
  );
}
