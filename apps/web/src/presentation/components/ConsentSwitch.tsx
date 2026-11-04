import { useId, type ReactNode } from 'react';

interface ConsentSwitchProps {
  readonly label: string;
  readonly description: string;
  readonly checked: boolean;
  readonly disabled?: boolean;
  /** Under the description: the date of the decision, or why the switch is locked. */
  readonly note?: string;
  readonly onChange: (checked: boolean) => void;
}

/** One processing, one switch (CLAUDE.md, section 12). */
export function ConsentSwitch(props: ConsentSwitchProps): ReactNode {
  const { label, description, note } = props;
  const id = useId();
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-1 flex-col gap-1">
        <span id={`${id}-label`} className="font-semibold">
          {label}
        </span>
        <span id={`${id}-description`} className="text-sm text-slate-600">
          {description}
        </span>
        {note !== undefined && <span className="text-sm font-medium text-slate-700">{note}</span>}
      </div>
      <SwitchButton {...props} id={id} />
    </div>
  );
}

function SwitchButton({
  id,
  checked,
  disabled = false,
  onChange,
}: ConsentSwitchProps & { readonly id: string }): ReactNode {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-description`}
      disabled={disabled}
      onClick={() => {
        onChange(!checked);
      }}
      className="group flex min-h-11 min-w-14 shrink-0 items-center disabled:opacity-40"
    >
      <span className="flex h-8 w-14 items-center rounded-full bg-slate-300 p-1 transition-colors group-aria-checked:bg-brand-600">
        <span className="size-6 rounded-full bg-white shadow transition-transform group-aria-checked:translate-x-6" />
      </span>
    </button>
  );
}
