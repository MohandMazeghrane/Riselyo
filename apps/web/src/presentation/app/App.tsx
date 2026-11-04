import type { ReactNode } from 'react';
import { fr } from '../content/fr';
import { useCurrentDayLabel } from '../hooks/useCurrentDayLabel';

export function App(): ReactNode {
  const dayLabel = useCurrentDayLabel();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-[max(env(safe-area-inset-top),2rem)] pb-[max(env(safe-area-inset-bottom),2rem)]">
      <header>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-500">{fr.appName}</p>
        <h1 className="mt-1 text-3xl font-bold">{fr.home.greeting}</h1>
        <p className="mt-1 text-slate-600 first-letter:uppercase dark:text-slate-300">{dayLabel}</p>
      </header>
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        <p>{fr.home.upcoming}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{fr.home.offlineReady}</p>
      </section>
    </main>
  );
}
