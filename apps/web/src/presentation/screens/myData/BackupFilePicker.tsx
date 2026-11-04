import { useId, type ChangeEvent, type ReactNode } from 'react';
import { fr } from '../../content/fr';
import type { ChosenFile } from './ConfirmImport';

interface BackupFilePickerProps {
  readonly onChosen: (file: ChosenFile) => void;
}

/** A native file input styled as a button; the file is read on the phone only. */
export function BackupFilePicker({ onChosen }: BackupFilePickerProps): ReactNode {
  const inputId = useId();
  const choose = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file !== undefined) {
      void file.text().then((content) => {
        onChosen({ name: file.name, content });
      });
    }
  };
  return (
    <label
      htmlFor={inputId}
      className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-white px-5 font-semibold text-brand-700 ring-1 ring-slate-300 has-focus-visible:outline-2 has-focus-visible:outline-brand-600"
    >
      {fr.myData.importChoose}
      <input
        id={inputId}
        type="file"
        accept=".json,application/json"
        onChange={choose}
        className="sr-only"
      />
    </label>
  );
}
