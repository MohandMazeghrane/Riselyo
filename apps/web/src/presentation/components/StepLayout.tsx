import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ONBOARDING_SCREEN_COUNT } from '../app/routes';
import { fr } from '../content/fr';

interface StepLayoutProps {
  /** Onboarding progress; omitted on one-off screens such as the check-ins. */
  readonly step?: number;
  readonly title: string;
  readonly backTo?: string;
  readonly children: ReactNode;
}

/** Frame of a form screen: optional progress and back link, title and content. */
export function StepLayout({ step, title, backTo, children }: StepLayoutProps): ReactNode {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      <div className="flex min-h-11 items-center justify-between text-sm text-slate-600">
        {backTo === undefined ? (
          <span />
        ) : (
          <Link to={backTo} className="flex min-h-11 items-center font-medium text-brand-700">
            {fr.common.back}
          </Link>
        )}
        {step !== undefined && <span>{fr.common.step(step, ONBOARDING_SCREEN_COUNT)}</span>}
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </main>
  );
}
