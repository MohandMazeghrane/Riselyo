import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { fr } from '../content/fr';

interface PageLayoutProps {
  readonly title: string;
  readonly backTo: string;
  readonly children: ReactNode;
}

/** Frame of a secondary page (profile, privacy, help): back link, title, content. */
export function PageLayout({ title, backTo, children }: PageLayoutProps): ReactNode {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      <Link
        to={backTo}
        className="flex min-h-11 items-center self-start font-medium text-brand-700"
      >
        {fr.common.back}
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </main>
  );
}
