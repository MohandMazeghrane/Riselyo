import type { ReactNode } from 'react';
import { ROUTES } from '../../app/routes';
import { HelpLines } from '../../components/HelpLines';
import { PageLayout } from '../../components/PageLayout';
import { fr } from '../../content/fr';

/** Static on purpose: works offline and never depends on the AI (CLAUDE.md, section 10). */
export function HelpScreen(): ReactNode {
  return (
    <PageLayout title={fr.help.title} backTo={ROUTES.today}>
      <p>{fr.help.intro}</p>
      <HelpLines />
      <p className="text-sm text-slate-600">{fr.common.notAProfessional}</p>
    </PageLayout>
  );
}
