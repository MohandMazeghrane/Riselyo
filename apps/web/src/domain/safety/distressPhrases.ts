/**
 * Phrases that signal distress, as people write them (French, without accents or punctuation).
 * They are matched at the start of a word, so "me tue" also covers "me tuer".
 * Hyperboles ("mort de rire", "tuer le temps") are deliberately left out.
 */
export const DISTRESS_PHRASES: readonly string[] = [
  'suicid',
  'me tue',
  'me buter',
  'me foutre en l air',
  'mettre fin a mes jours',
  'mettre fin a ma vie',
  'finir avec la vie',
  'veux en finir',
  'vais en finir',
  'envie d en finir',
  'envi d en finir',
  'veux mourir',
  'voudrais mourir',
  'aimerais mourir',
  'prefere mourir',
  'envie de mourir',
  'envi de mourir',
  'plus envie de vivre',
  'plus envi de vivre',
  'pas envie de vivre',
  'marre de vivre',
  'plus la force de vivre',
  'plus de raison de vivre',
  'vie n a plus de sens',
  'veux disparaitre',
  'envie de disparaitre',
  'me faire du mal',
  'me scarifie',
  'me pendre',
  'me jeter sous',
  'me jeter du',
  'sauter du pont',
  'sauter d un pont',
  'sauter du toit',
  'sauter par la fenetre',
  'overdose',
  'idees noir',
  'idee noir',
  'personne ne me regretterait',
  'mieux sans moi',
  'en peux plu',
];

/** Single words caught even with one typo ("sucide", "suicde"). */
export const DISTRESS_KEYWORDS: readonly string[] = [
  'suicide',
  'suicider',
  'suicidaire',
  'scarifier',
  'scarification',
  'overdose',
];

/** Short verbs often fused with "j" in quick typing ("jveux" for "je veux"). */
export const FUSED_J_VERBS: readonly string[] = ['veux', 'ai', 'en', 'me', 'vais', 'voudrais'];
