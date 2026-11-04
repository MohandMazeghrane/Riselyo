import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../app/routes';
import { PageLayout } from '../../components/PageLayout';
import { fr } from '../../content/fr';

const ENTRIES = [
  { to: ROUTES.habits, label: fr.profile.habits, hint: fr.profile.habitsHint },
  { to: ROUTES.privacy, label: fr.profile.privacy, hint: fr.profile.privacyHint },
  { to: ROUTES.help, label: fr.profile.help, hint: fr.profile.helpHint },
] as const;

/** The Profile tab; settings and data come with later tasks. */
export function ProfileScreen(): ReactNode {
  return (
    <PageLayout title={fr.profile.title} withTabBar>
      <ul className="flex flex-col gap-3">
        {ENTRIES.map((entry) => (
          <li key={entry.to}>
            <Link
              to={entry.to}
              className="flex min-h-16 flex-col justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <span className="font-semibold">{entry.label}</span>
              <span className="text-sm text-slate-600">{entry.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
