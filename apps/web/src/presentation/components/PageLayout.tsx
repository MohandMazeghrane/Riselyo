import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { fr } from '../content/fr';

interface PageLayoutProps {
  readonly title: string;
  /** A sub-page has a back link; a tab has none. */
  readonly backTo?: string;
  /** Leaves room for the tab bar at the bottom. */
  readonly withTabBar?: boolean;
  readonly children: ReactNode;
}

const BOTTOM_PADDING = {
  plain: 'pb-[max(env(safe-area-inset-bottom),1.5rem)]',
  tabBar: 'pb-[calc(env(safe-area-inset-bottom)+6rem)]',
} as const;

/** Frame of a page (tab, profile, privacy…): optional back link, title, content. */
export function PageLayout(props: PageLayoutProps): ReactNode {
  const { title, backTo, withTabBar = false, children } = props;
  const bottom = withTabBar ? BOTTOM_PADDING.tabBar : BOTTOM_PADDING.plain;
  return (
    <main
      className={`mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-[max(env(safe-area-inset-top),1.5rem)] ${bottom}`}
    >
      {backTo !== undefined && (
        <Link
          to={backTo}
          className="flex min-h-11 items-center self-start font-medium text-brand-700"
        >
          {fr.common.back}
        </Link>
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </main>
  );
}
