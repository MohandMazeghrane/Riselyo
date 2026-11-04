/**
 * Reads a number typed on a French keyboard ("78,5"). Empty means "not given";
 * anything unreadable becomes NaN so that the use case rejects it.
 */
export function parseNumberInput(text: string): number | undefined {
  const trimmed = text.trim();
  if (trimmed === '') {
    return undefined;
  }
  return Number(trimmed.replace(',', '.'));
}
