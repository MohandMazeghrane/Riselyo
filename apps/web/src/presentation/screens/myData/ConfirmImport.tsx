import type { ReactNode } from 'react';
import { Button } from '../../components/Button';
import { fr } from '../../content/fr';

export interface ChosenFile {
  readonly name: string;
  readonly content: string;
}

interface ConfirmImportProps {
  readonly file: ChosenFile;
  readonly pending: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** Replacing everything cannot be undone: the user confirms with the file name in sight. */
export function ConfirmImport({
  file,
  pending,
  onConfirm,
  onCancel,
}: ConfirmImportProps): ReactNode {
  return (
    <div
      role="group"
      aria-label={fr.myData.importTitle}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-avoid-500"
    >
      <p>{fr.myData.importConfirm(file.name)}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {fr.myData.importCancel}
        </Button>
        <Button disabled={pending} onClick={onConfirm}>
          {pending ? fr.myData.importing : fr.myData.importReplace}
        </Button>
      </div>
    </div>
  );
}
