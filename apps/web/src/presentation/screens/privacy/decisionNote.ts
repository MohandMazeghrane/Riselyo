import type { ConsentDecision } from '../../../domain/entities/consent';
import { fr } from '../../content/fr';

const DECISION_DATE = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Paris',
});

/** « Activé le 4 novembre 2026 », « Désactivé le … » or « Pas encore choisi ». */
export function decisionNote(decision: ConsentDecision): string {
  if (decision.decidedAt === null) {
    return fr.consents.status.undecided;
  }
  const date = DECISION_DATE.format(decision.decidedAt);
  return decision.granted ? fr.consents.status.granted(date) : fr.consents.status.refused(date);
}
