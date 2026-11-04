/** A file built on the phone and handed to the browser to save; nothing is sent anywhere. */
export interface DownloadFile {
  readonly fileName: string;
  readonly mimeType: string;
  readonly content: string;
}
