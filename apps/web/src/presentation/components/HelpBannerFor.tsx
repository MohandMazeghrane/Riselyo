import type { ReactNode } from 'react';
import { textNeedsHelp } from '../../application/safety/needsHelp';
import { HelpBanner } from './HelpBanner';

/** Shows the help banner under a field as soon as what is typed signals distress. */
export function HelpBannerFor({ text }: { readonly text: string }): ReactNode {
  return textNeedsHelp(text) ? <HelpBanner /> : null;
}
