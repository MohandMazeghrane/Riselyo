import type { DaysCsvLabels } from '../../../application/privacy/daysCsv';
import { habitKindOf } from '../../../application/habits/habitsForm';
import { priorityLabel } from '../checkin/checkInDrafts';
import { fr } from '../../content/fr';
import { habitLabel, levelText } from '../../content/habitTexts';

/** French headers and values of the days CSV. */
export const DAYS_CSV_LABELS: DaysCsvLabels = {
  columns: fr.myData.csv,
  habitName: habitLabel,
  habitLevel: (templateId, level) => levelText(habitKindOf(templateId), level),
  priority: priorityLabel,
  yes: fr.checkIn.yes,
  no: fr.checkIn.no,
};
