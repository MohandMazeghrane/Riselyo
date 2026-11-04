import type { ReactNode } from 'react';

export type TabIconName = 'today' | 'coach' | 'progress' | 'reviews' | 'profile';

/** Line icons, never emoji (docs/cahier-des-charges.md, section 11). */
const PATHS: Readonly<Record<TabIconName, readonly string[]>> = {
  today: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  ],
  coach: ['M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z'],
  progress: ['M3 20h18', 'M5 16l4-5 4 3 6-8'],
  reviews: ['M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M14 3v5h5', 'M9 13h6M9 17h4'],
  profile: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
};

export function TabIcon({ name }: { readonly name: TabIconName }): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
