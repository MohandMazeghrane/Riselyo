import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { ROUTES } from '../app/routes';
import { fr } from '../content/fr';
import { TabIcon, type TabIconName } from './TabIcon';

const TABS: readonly { readonly name: TabIconName; readonly to: string }[] = [
  { name: 'today', to: ROUTES.today },
  { name: 'coach', to: ROUTES.coach },
  { name: 'progress', to: ROUTES.progress },
  { name: 'reviews', to: ROUTES.reviews },
  { name: 'profile', to: ROUTES.profile },
];

/** The five tabs, fixed at the bottom within reach of the thumb. */
export function TabBar(): ReactNode {
  return (
    <nav
      aria-label={fr.tabs.label}
      className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ name, to }) => (
          <li key={name}>
            <NavLink
              to={to}
              end={to === ROUTES.today}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium ${
                  isActive ? 'text-brand-600' : 'text-slate-500'
                }`
              }
            >
              <TabIcon name={name} />
              {fr.tabs[name]}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
