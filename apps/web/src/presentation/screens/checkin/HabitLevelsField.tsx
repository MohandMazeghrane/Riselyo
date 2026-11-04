import type { ReactNode } from 'react';
import { habitLevelsFor } from '../../../application/checkin/checkInForm';
import type { Habit } from '../../../domain/entities/habit';
import type { HabitLevelAnswers } from '../../../domain/entities/habitLog';
import { ChoiceGroup } from '../../components/ChoiceGroup';
import { fr } from '../../content/fr';

interface HabitLevelsFieldProps {
  readonly habits: readonly Habit[];
  readonly answers: HabitLevelAnswers;
  readonly onChange: (answers: HabitLevelAnswers) => void;
}

/** Not done, minimum, normal or excellent: doing the minimum already counts. */
export function HabitLevelsField({ habits, answers, onChange }: HabitLevelsFieldProps): ReactNode {
  if (habits.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold">{fr.checkIn.habitsTitle}</h2>
      {habits.map(({ templateId }) => (
        <ChoiceGroup
          key={templateId}
          legend={fr.habits[templateId].label}
          choices={habitLevelsFor(templateId).map((level) => ({
            value: level,
            label: fr.checkIn.levels[level],
          }))}
          value={answers[templateId]}
          onChange={(level) => {
            onChange({ ...answers, [templateId]: level });
          }}
        />
      ))}
    </section>
  );
}
