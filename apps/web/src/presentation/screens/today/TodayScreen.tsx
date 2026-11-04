import type { ReactNode } from 'react';
import { LoadState } from '../../components/LoadState';
import { fr } from '../../content/fr';
import { useCurrentDayLabel } from '../../hooks/useCurrentDayLabel';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import { DayCheckIns } from './DayCheckIns';
import { TodayHabitsSection } from './TodayHabitsSection';
import { WellbeingCard } from './WellbeingCard';

/** The "Aujourd'hui" tab. Score, level, streak and focus appear with the tasks that compute them. */
export function TodayScreen(): ReactNode {
  const status = useOnboardingStatus();
  if (status.status !== 'ready') {
    return <LoadState status={status.status} onRetry={status.retry} />;
  }
  return <TodayContent firstName={status.data.profile?.firstName ?? ''} />;
}

function TodayContent({ firstName }: { readonly firstName: string }): ReactNode {
  const dayLabel = useCurrentDayLabel();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-[max(env(safe-area-inset-top),2rem)] pb-[calc(env(safe-area-inset-bottom)+6rem)]">
      <header>
        <p className="text-sm font-medium text-brand-600">{fr.appName}</p>
        <h1 className="mt-1 text-3xl font-bold">{fr.home.greeting(firstName)}</h1>
        <p className="mt-1 text-slate-600 first-letter:uppercase">{dayLabel}</p>
      </header>
      <WellbeingCard />
      <DayCheckIns />
      <TodayHabitsSection />
      <p className="text-sm text-slate-600">{fr.home.offlineReady}</p>
    </main>
  );
}
