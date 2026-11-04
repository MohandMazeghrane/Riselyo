import { containsDistress } from '../../domain/safety/distress';

/**
 * Whether a text the user is typing should bring up the help lines (3114, 15, 112).
 * Runs on the phone only, with no network and no AI (CLAUDE.md, section 10).
 */
export function textNeedsHelp(text: string): boolean {
  return containsDistress(text);
}
