import { useId, type ReactNode } from 'react';

export interface Choice<T extends string | number> {
  readonly value: T;
  /** Accessible name; also the visible text unless `content` is given. */
  readonly label: string;
  readonly content?: ReactNode;
}

interface ChoiceGroupProps<T extends string | number> {
  readonly legend: string;
  readonly hint?: string;
  readonly choices: readonly Choice<T>[];
  readonly value: T | undefined;
  readonly onChange: (value: T) => void;
}

/** A row of large native radios with no default answer: one tap, one answer. */
export function ChoiceGroup<T extends string | number>(props: ChoiceGroupProps<T>): ReactNode {
  const { legend, hint, choices } = props;
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-semibold">{legend}</legend>
      {hint !== undefined && <p className="text-sm text-slate-600">{hint}</p>}
      <div className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-2">
        {choices.map((choice) => (
          <ChoiceOption key={choice.value} name={name} choice={choice} {...props} />
        ))}
      </div>
    </fieldset>
  );
}

interface ChoiceOptionProps<T extends string | number> extends ChoiceGroupProps<T> {
  readonly name: string;
  readonly choice: Choice<T>;
}

function ChoiceOption<T extends string | number>(props: ChoiceOptionProps<T>): ReactNode {
  const { name, choice, value, onChange } = props;
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-white px-2 text-center text-sm ring-1 ring-slate-300 has-checked:bg-brand-600 has-checked:text-white has-checked:ring-brand-600 has-focus-visible:outline-2 has-focus-visible:outline-brand-600">
      <input
        type="radio"
        name={name}
        aria-label={choice.label}
        checked={value === choice.value}
        onChange={() => {
          onChange(choice.value);
        }}
        className="sr-only"
      />
      {choice.content ?? choice.label}
    </label>
  );
}
