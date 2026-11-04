import type { ReactNode } from 'react';
import { TextField } from '../../components/TextField';
import { fr } from '../../content/fr';

const MINUTES_PER_HOUR = 60;
const MAX_HOURS = 24;
const MAX_MINUTES = 59;

interface SleepTargetFieldProps {
  readonly minutes: number;
  readonly onChange: (minutes: number) => void;
}

/** Hours and minutes typed separately, stored as a number of minutes. */
export function SleepTargetField({ minutes, onChange }: SleepTargetFieldProps): ReactNode {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <legend className="mb-1 font-medium">{fr.rhythm.sleepTarget}</legend>
      <WholeNumberField
        label={fr.rhythm.hours}
        value={hours}
        max={MAX_HOURS}
        onChange={(value) => {
          onChange(value * MINUTES_PER_HOUR + rest);
        }}
      />
      <WholeNumberField
        label={fr.rhythm.minutes}
        value={rest}
        max={MAX_MINUTES}
        onChange={(value) => {
          onChange(hours * MINUTES_PER_HOUR + value);
        }}
      />
    </fieldset>
  );
}

interface WholeNumberFieldProps {
  readonly label: string;
  readonly value: number;
  readonly max: number;
  readonly onChange: (value: number) => void;
}

function WholeNumberField({ label, value, max, onChange }: WholeNumberFieldProps): ReactNode {
  return (
    <TextField
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      label={label}
      value={value}
      onChange={(event) => {
        const text = event.target.value;
        onChange(text === '' ? 0 : Math.trunc(Number(text)));
      }}
    />
  );
}
