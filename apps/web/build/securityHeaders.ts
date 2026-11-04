import { readFileSync } from 'node:fs';

const HEADERS_FILE = new URL('../public/_headers', import.meta.url);
const GLOBAL_RULE = '/*';
const HEADER_LINE = /^\s+([A-Za-z-]+):\s*(.+)$/;

/**
 * Reads the headers Cloudflare Pages applies to every route, from public/_headers.
 * Shared by the Vite preview server and the tests so local checks match production.
 */
export function readGlobalSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  let inGlobalRule = false;
  for (const line of readFileSync(HEADERS_FILE, 'utf8').split(/\r?\n/)) {
    if (!line.startsWith(' ') && line.trim() !== '') {
      inGlobalRule = line.trim() === GLOBAL_RULE;
      continue;
    }
    const match = HEADER_LINE.exec(line);
    if (inGlobalRule && match?.[1] !== undefined && match[2] !== undefined) {
      headers[match[1]] = match[2].trim();
    }
  }
  return headers;
}
