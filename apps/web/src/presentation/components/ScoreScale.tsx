import type { ReactNode } from 'react';

interface ScoreScaleProps {
  readonly name: string;
  readonly label: string;
  readonly help: string;
  readonly scores: readonly number[];
  readonly value: number | undefined;
  readonly onChange: (score: number) => void;
}

/** A score choice with no default: native radios, two rows of large targets. */
export function ScoreScale({
  name,
  label,
  help,
  scores,
  value,
  onChange,
}: ScoreScaleProps): ReactNode {
  return (
    <fieldset className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <legend className="sr-only">{label}</legend>
      <p aria-hidden="true" className="font-semibold">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-600">{help}</p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {scores.map((score) => (
          <ScoreOption
            key={score}
            name={name}
            score={score}
            checked={value === score}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

interface ScoreOptionProps {
  readonly name: string;
  readonly score: number;
  readonly checked: boolean;
  readonly onChange: (score: number) => void;
}

function ScoreOption({ name, score, checked, onChange }: ScoreOptionProps): ReactNode {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl ring-1 ring-slate-300 has-checked:bg-brand-600 has-checked:text-white has-checked:ring-brand-600 has-focus-visible:outline-2 has-focus-visible:outline-brand-600">
      <input
        type="radio"
        name={name}
        value={score}
        checked={checked}
        onChange={() => {
          onChange(score);
        }}
        className="sr-only"
      />
      {score}
    </label>
  );
}
