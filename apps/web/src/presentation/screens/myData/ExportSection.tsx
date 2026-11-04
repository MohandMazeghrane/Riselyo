import type { ReactNode } from 'react';
import { useContainer } from '../../app/ContainerContext';
import { Button } from '../../components/Button';
import { FormMessage } from '../../components/FormMessage';
import { fr } from '../../content/fr';
import { useDownload } from '../../hooks/useDownload';
import { DAYS_CSV_LABELS } from './daysCsvLabels';

/** Downloads everything (JSON, to restore later) or the days as a table (CSV). */
export function ExportSection(): ReactNode {
  const { privacy } = useContainer();
  const { download, pending, failed } = useDownload();
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{fr.myData.exportTitle}</h2>
      <p>{fr.myData.exportIntro}</p>
      <Button
        disabled={pending}
        onClick={() => {
          download(privacy.exportBackup);
        }}
      >
        {fr.myData.exportBackup}
      </Button>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => {
          download(() => privacy.exportDaysCsv(DAYS_CSV_LABELS));
        }}
      >
        {fr.myData.exportCsv}
      </Button>
      <p className="text-sm text-slate-600">{fr.myData.exportWarning}</p>
      {failed && <FormMessage tone="error">{fr.myData.exportError}</FormMessage>}
    </section>
  );
}
