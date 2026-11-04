import { describe, expect, it } from 'vitest';
import { containsDistress } from './distress';

describe('containsDistress', () => {
  it.each([
    'Je pense au suicide',
    'j’ai envie de me suicider',
    'je veux mourir',
    'Je voudrais mourir ce soir',
    'J’ai plus envie de vivre',
    'je n’ai plus envie de vivre',
    'je veux en finir',
    'envie d’en finir avec la vie',
    'mettre fin à mes jours',
    'je vais me faire du mal',
    'Je veux DISPARAÎTRE',
    'personne ne me regretterait',
    'tout le monde serait mieux sans moi',
    'j’ai des idées noires',
    'je n’en peux plus',
    'je vais me foutre en l’air',
    'sauter par la fenêtre',
  ])('detects %j', (text) => {
    expect(containsDistress(text)).toBe(true);
  });

  it.each([
    'jveux mourir',
    'j en peux plu',
    'envi de mourrir',
    'je veux mouriiir',
    'sucide',
    'suicde',
    'idee noire',
    'je veux me tue',
  ])('detects the variant or typo %j', (text) => {
    expect(containsDistress(text)).toBe(true);
  });

  it.each([
    '',
    'J’ai marché 30 minutes',
    'mort de rire',
    'je meurs de faim',
    'tuer le temps',
    'sauter du lit à 6 h',
    'en finir avec le grignotage',
    'j’ai enfin fini mon dossier',
    'décidé à continuer',
    'Appeler Léa',
  ])('does not flag the everyday sentence %j', (text) => {
    expect(containsDistress(text)).toBe(false);
  });
});
