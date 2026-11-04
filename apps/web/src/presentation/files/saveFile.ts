import type { DownloadFile } from '../../application/privacy/downloadFile';

/** Hands a file built on the phone to the browser; nothing goes over the network. */
export function saveFile({ fileName, mimeType, content }: DownloadFile): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
