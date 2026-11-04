import type { ReactNode } from 'react';
import { fr } from '../content/fr';
import { HelpLines } from './HelpLines';

/** The help lines, shown right away and before anything else (CLAUDE.md, section 10). */
export function HelpBanner(): ReactNode {
  return (
    <section
      role="alert"
      aria-label={fr.help.bannerTitle}
      className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100"
    >
      <h2 className="font-semibold">{fr.help.bannerTitle}</h2>
      <p>{fr.help.bannerText}</p>
      <HelpLines />
      <p className="text-sm text-slate-600">{fr.help.bannerPrivacy}</p>
    </section>
  );
}
