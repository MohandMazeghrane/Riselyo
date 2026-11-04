import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router';
import { ROUTES, STEP_ROUTES } from '../../app/routes';
import { LoadState } from '../../components/LoadState';
import { fr } from '../../content/fr';
import { useCurrentDayLabel } from '../../hooks/useCurrentDayLabel';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';

/** Home. Until the onboarding is finished, it sends the user back where they left it. */
export function TodayScreen(): ReactNode {
  const status = useOnboardingStatus();
  if (status.status !== 'ready') {
    return <LoadState status={status.status} onRetry={status.retry} />;
  }
  const { nextStep, profile } = status.data;
  if (nextStep !== 'done' || profile === null) {
    return <Navigate to={STEP_ROUTES[nextStep === 'done' ? 'welcome' : nextStep]} replace />;
  }
  return <TodayContent firstName={profile.firstName} />;
}

function TodayContent({ firstName }: { readonly firstName: string }): ReactNode {
  const dayLabel = useCurrentDayLabel();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-[max(env(safe-area-inset-top),2rem)] pb-[max(env(safe-area-inset-bottom),2rem)]">
      <header>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-brand-600">{fr.appName}</p>
          <Link
            to={ROUTES.profile}
            className="flex min-h-11 items-center font-medium text-brand-700"
          >
            {fr.home.profile}
          </Link>
        </div>
        <h1 className="mt-1 text-3xl font-bold">{fr.home.greeting(firstName)}</h1>
        <p className="mt-1 text-slate-600 first-letter:uppercase">{dayLabel}</p>
      </header>
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p>{fr.home.upcoming}</p>
        <p className="mt-2 text-sm text-slate-600">{fr.home.offlineReady}</p>
      </section>
    </main>
  );
}
