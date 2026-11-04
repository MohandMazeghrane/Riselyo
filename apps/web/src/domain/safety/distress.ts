import { DISTRESS_TYPO_MAX_DISTANCE, DISTRESS_TYPO_MIN_KEYWORD_LENGTH } from '../config/safety';
import { DISTRESS_KEYWORDS, DISTRESS_PHRASES, FUSED_J_VERBS } from './distressPhrases';

const FUSED_J = new RegExp(`\\bj(${FUSED_J_VERBS.join('|')})\\b`, 'g');

/**
 * Lower case, no accents, letters only, repeated letters collapsed ("mouriiir", "mourrir"),
 * "jveux" split: the same treatment is applied to the text and to the phrases.
 */
export function normalizeForDetection(text: string): string {
  const letters = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z]+/g, ' ')
    .replace(FUSED_J, 'j $1');
  return letters.replace(/([a-z])\1+/g, '$1').trim();
}

const PHRASES = DISTRESS_PHRASES.map(normalizeForDetection);
const KEYWORDS = DISTRESS_KEYWORDS.map(normalizeForDetection).filter(
  (keyword) => keyword.length >= DISTRESS_TYPO_MIN_KEYWORD_LENGTH,
);

/**
 * Local, offline detection of distress in a text the user wrote. Never sent anywhere.
 * A false alarm only shows the help lines, so the list leans towards catching too much.
 */
export function containsDistress(text: string): boolean {
  const normalized = ` ${normalizeForDetection(text)}`;
  if (PHRASES.some((phrase) => normalized.includes(` ${phrase}`))) {
    return true;
  }
  return normalized.split(' ').some((word) => KEYWORDS.some((keyword) => isCloseTo(word, keyword)));
}

function isCloseTo(word: string, keyword: string): boolean {
  if (Math.abs(word.length - keyword.length) > DISTRESS_TYPO_MAX_DISTANCE) {
    return false;
  }
  return editDistance(word, keyword) <= DISTRESS_TYPO_MAX_DISTANCE;
}

/** Levenshtein distance, on short words only. */
function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      current.push(Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, substitution));
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
}
