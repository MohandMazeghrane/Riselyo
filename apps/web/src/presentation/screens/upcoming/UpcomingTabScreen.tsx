import type { ReactNode } from 'react';
import { PageLayout } from '../../components/PageLayout';
import { fr } from '../../content/fr';

interface UpcomingTabScreenProps {
  readonly tab: 'coach' | 'progress' | 'reviews';
}

/** A tab whose screen comes in a later phase: says what it will hold, never an empty page. */
export function UpcomingTabScreen({ tab }: UpcomingTabScreenProps): ReactNode {
  const texts = fr.upcoming[tab];
  return (
    <PageLayout title={texts.title} withTabBar>
      <p className="self-start rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
        {fr.upcoming.badge}
      </p>
      <p>{texts.text}</p>
      <p className="text-slate-600">{fr.upcoming.meanwhile}</p>
    </PageLayout>
  );
}
