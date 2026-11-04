import { useState, type ReactNode } from 'react';
import { CHECK_IN_FORM } from '../../../application/checkin/checkInForm';
import type { DailyPriority } from '../../../domain/entities/dayEntry';
import type { Habit } from '../../../domain/entities/habit';
import { TextField } from '../../components/TextField';
import { fr } from '../../content/fr';
import { habitLabel } from '../../content/habitTexts';

interface PriorityPickerProps {
  readonly habits: readonly Habit[];
  readonly value: DailyPriority | null;
  readonly onChange: (priority: DailyPriority | null) => void;
}

interface PriorityOption {
  readonly key: string;
  readonly label: string;
  readonly priority: DailyPriority | null;
}

/** One action for the day: one of the goals, something else, or none at all. */
export function PriorityPicker({ habits, value, onChange }: PriorityPickerProps): ReactNode {
  const [freeText, setFreeText] = useState(value?.kind === 'free' ? value.text : '');
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-semibold">{fr.checkIn.priority}</legend>
      <p className="text-sm text-slate-600">{fr.checkIn.priorityHint}</p>
      {priorityOptions(habits, freeText).map((option) => (
        <PriorityRadio
          key={option.key}
          option={option}
          checked={keyOf(value) === option.key}
          onChange={onChange}
        />
      ))}
      {value?.kind === 'free' && (
        <TextField
          label={fr.checkIn.priorityFreeLabel}
          value={freeText}
          maxLength={CHECK_IN_FORM.priorityMaxLength}
          onChange={(event) => {
            setFreeText(event.target.value);
            onChange({ kind: 'free', text: event.target.value });
          }}
        />
      )}
    </fieldset>
  );
}

function priorityOptions(habits: readonly Habit[], freeText: string): PriorityOption[] {
  return [
    ...habits.map(({ templateId }) => ({
      key: templateId,
      label: habitLabel(templateId),
      priority: { kind: 'habit', templateId } as const,
    })),
    { key: 'free', label: fr.checkIn.priorityFree, priority: { kind: 'free', text: freeText } },
    { key: 'none', label: fr.checkIn.priorityNone, priority: null },
  ];
}

interface PriorityRadioProps {
  readonly option: PriorityOption;
  readonly checked: boolean;
  readonly onChange: (priority: DailyPriority | null) => void;
}

function PriorityRadio({ option, checked, onChange }: PriorityRadioProps): ReactNode {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-white px-4 ring-1 ring-slate-300 has-checked:ring-2 has-checked:ring-brand-600">
      <input
        type="radio"
        name="priority"
        checked={checked}
        onChange={() => {
          onChange(option.priority);
        }}
        className="size-5 accent-brand-600"
      />
      {option.label}
    </label>
  );
}

function keyOf(priority: DailyPriority | null): string {
  if (priority === null) {
    return 'none';
  }
  return priority.kind === 'habit' ? priority.templateId : 'free';
}
