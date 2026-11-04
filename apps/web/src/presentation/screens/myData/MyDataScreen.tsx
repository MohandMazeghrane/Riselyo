import type { ReactNode } from 'react';
import { ROUTES } from '../../app/routes';
import { PageLayout } from '../../components/PageLayout';
import { fr } from '../../content/fr';
import { EraseSection } from './EraseSection';
import { ExportSection } from './ExportSection';
import { ImportSection } from './ImportSection';
import { StoredDataSection } from './StoredDataSection';

/** Profile → my data: transparency, access, portability and erasure (CLAUDE.md, section 12). */
export function MyDataScreen(): ReactNode {
  return (
    <PageLayout title={fr.myData.title} backTo={ROUTES.profile}>
      <StoredDataSection />
      <ExportSection />
      <ImportSection />
      <EraseSection />
    </PageLayout>
  );
}
