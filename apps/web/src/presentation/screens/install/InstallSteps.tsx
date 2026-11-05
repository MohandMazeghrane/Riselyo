import type { ReactNode } from 'react';
import { fr } from '../../content/fr';
import type { InstallState } from '../../platform/installState';

/** What to do on this device to put Riselyo on the home screen. */
export function InstallSteps({ state }: { readonly state: InstallState }): ReactNode {
  if (state === 'installed') {
    return <p>{fr.install.installed}</p>;
  }
  if (state === 'other') {
    return <p>{fr.install.otherIntro}</p>;
  }
  return (
    <>
      <p>{fr.install.iosIntro}</p>
      <ol className="flex flex-col gap-3">
        {fr.install.iosSteps.map((step, index) => (
          <li key={step} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-slate-600">{fr.install.iosNote}</p>
    </>
  );
}
