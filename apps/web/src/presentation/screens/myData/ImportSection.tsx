import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { backupRefusalOf } from '../../../application/privacy/backupRefusal';
import type { DomainError } from '../../../domain/shared/domainError';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { FormMessage } from '../../components/FormMessage';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { BackupFilePicker } from './BackupFilePicker';
import { ConfirmImport, type ChosenFile } from './ConfirmImport';

/** Restores a backup: choose a file, confirm, then every current record is replaced. */
export function ImportSection(): ReactNode {
  const navigate = useNavigate();
  const [chosen, setChosen] = useState<ChosenFile | null>(null);
  const submission = useSubmit(useContainer().privacy.importBackup, () => {
    void navigate(ROUTES.today);
  });
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{fr.myData.importTitle}</h2>
      <p>{fr.myData.importIntro}</p>
      <BackupFilePicker onChosen={setChosen} />
      {chosen !== null && (
        <ConfirmImport
          file={chosen}
          pending={submission.pending}
          onConfirm={() => {
            submission.submit(chosen.content);
          }}
          onCancel={() => {
            setChosen(null);
          }}
        />
      )}
      {submission.error !== null && (
        <FormMessage tone="error">{importErrorText(submission.error)}</FormMessage>
      )}
    </section>
  );
}

function importErrorText(error: DomainError): string {
  const refusal = backupRefusalOf(error);
  return refusal === null ? fr.myData.importFailed : fr.myData.refusals[refusal];
}
