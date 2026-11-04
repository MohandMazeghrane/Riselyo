import type { ReactNode } from 'react';
import { ROUTES } from '../../app/routes';
import { PageLayout } from '../../components/PageLayout';
import { fr } from '../../content/fr';
import { EraseSection } from './EraseSection';
import { ExportSection } from './ExportSection';
import { ImportSection } from './ImportSection';

/** Profile → my data: access and portability (CLAUDE.md, section 12). Works offline. */
export function MyDataScreen(): ReactNode {
  return (
    <PageLayout title={fr.myData.title} backTo={ROUTES.profile}>
      <ExportSection />
      <ImportSection />
      <EraseSection />
    </PageLayout>
  );
}
