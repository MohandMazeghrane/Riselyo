import type { ReactNode } from 'react';
import { CHECK_IN_FORM, type EveningForm } from '../../../application/checkin/checkInForm';
import type { CheckInDay } from '../../../application/checkin/getCheckInDay';
import { ChoiceGroup, type Choice } from '../../components/ChoiceGroup';
import { MoodFace } from '../../components/MoodFace';
import { TextField } from '../../components/TextField';
import { fr } from '../../content/fr';
import { priorityLabel } from './checkInDrafts';
import { HabitLevelsField } from './HabitLevelsField';
import { ScaleQuestion } from './ScaleQuestion';
import { SCALE_CHOICES } from './scaleChoices';

const MOOD_CHOICES: readonly Choice<number>[] = SCALE_CHOICES.map(({ value }, index) => ({
  value,
  label: fr.checkIn.moods[index] ?? String(value),
  content: <MoodFace mood={value} />,
}));

const YES_NO: readonly Choice<'yes' | 'no'>[] = [
  { value: 'yes', label: fr.checkIn.yes },
  { value: 'no', label: fr.checkIn.no },
];

export interface EveningFieldsProps {
  readonly form: EveningForm;
  readonly day: CheckInDay;
  readonly update: (change: Partial<EveningForm>) => void;
}

export function EveningFields(props: EveningFieldsProps): ReactNode {
  const { form, day, update } = props;
  return (
    <>
      <FeelingFields {...props} />
      <HabitLevelsField
        habits={day.activeHabits}
        answers={form.habitLevels}
        onChange={(habitLevels) => {
          update({ habitLevels });
        }}
      />
      <PriorityKeptField {...props} />
      <TextField
        label={fr.checkIn.victory}
        hint={fr.checkIn.victoryHint}
        value={form.victory}
        maxLength={CHECK_IN_FORM.victoryMaxLength}
        onChange={(event) => {
          update({ victory: event.target.value });
        }}
      />
    </>
  );
}

function FeelingFields({ form, update }: EveningFieldsProps): ReactNode {
  return (
    <>
      <ChoiceGroup
        legend={fr.checkIn.mood}
        choices={MOOD_CHOICES}
        value={form.mood}
        onChange={(mood) => {
          update({ mood });
        }}
      />
      <ScaleQuestion
        legend={fr.checkIn.stress}
        hint={fr.checkIn.stressHint}
        value={form.stress}
        onChange={(stress) => {
          update({ stress });
        }}
      />
    </>
  );
}

function PriorityKeptField({ form, day, update }: EveningFieldsProps): ReactNode {
  const priority = day.entry.morning?.priority ?? null;
  if (priority === null) {
    return null;
  }
  const value = form.priorityKept === null ? undefined : form.priorityKept ? 'yes' : 'no';
  return (
    <ChoiceGroup
      legend={fr.checkIn.priorityKept(priorityLabel(priority))}
      choices={YES_NO}
      value={value}
      onChange={(answer) => {
        update({ priorityKept: answer === 'yes' });
      }}
    />
  );
}
