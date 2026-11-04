import { useState } from 'react';
import type { DownloadFile } from '../../application/privacy/downloadFile';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { saveFile } from '../files/saveFile';

export interface Download {
  readonly download: (build: () => Promise<Result<DownloadFile, DomainError>>) => void;
  readonly pending: boolean;
  readonly failed: boolean;
}

/** Builds a file with a use case, then hands it to the browser to save. */
export function useDownload(): Download {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const download: Download['download'] = (build) => {
    setPending(true);
    setFailed(false);
    void build().then((file) => {
      setPending(false);
      if (file.ok) {
        saveFile(file.value);
        return;
      }
      setFailed(true);
    });
  };

  return { download, pending, failed };
}
