import type { ReactNode } from 'react';
import { HABITS_FORM } from '../../../application/habits/habitsForm';
import type {
  QuickAction,
  QuickAdjustment,
  QuickCounts,
} from '../../../domain/entities/quickCounts';
import { fr } from '../../content/fr';

interface QuickButtonsProps {
  readonly counts: QuickCounts;
  readonly disabled: boolean;
  readonly onAdjust: (action: QuickAction, adjustment: QuickAdjustment) => void;
}

/** "+1 glass of water", "+10 min walk"…: one tap, with a small button to undo a mistake. */
export function QuickButtons({ counts, disabled, onAdjust }: QuickButtonsProps): ReactNode {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold">{fr.quick.title}</h2>
      <ul className="grid grid-cols-2 gap-3">
        {HABITS_FORM.quickActions.map((action) => (
          <li key={action} className="flex gap-1">
            <QuickButton
              action={action}
              count={counts[action]}
              disabled={disabled}
              onAdjust={onAdjust}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface QuickButtonProps {
  readonly action: QuickAction;
  readonly count: number;
  readonly disabled: boolean;
  readonly onAdjust: QuickButtonsProps['onAdjust'];
}

const TILE =
  'flex min-h-16 rounded-2xl bg-white ring-1 ring-slate-200 active:bg-brand-50 disabled:opacity-60';

function QuickButton({ action, count, disabled, onAdjust }: QuickButtonProps): ReactNode {
  const texts = fr.quick.actions[action];
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={`${texts.add} (${texts.count(count)})`}
        onClick={() => {
          onAdjust(action, 'add');
        }}
        className={`${TILE} flex-1 flex-col justify-center px-3 text-left shadow-sm`}
      >
        <span className="text-sm font-semibold text-brand-700">{texts.add}</span>
        <span className="text-sm text-slate-600">{texts.count(count)}</span>
      </button>
      {count > 0 && (
        <UndoButton
          label={texts.remove}
          disabled={disabled}
          onUndo={() => {
            onAdjust(action, 'remove');
          }}
        />
      )}
    </>
  );
}

interface UndoButtonProps {
  readonly label: string;
  readonly disabled: boolean;
  readonly onUndo: () => void;
}

function UndoButton({ label, disabled, onUndo }: UndoButtonProps): ReactNode {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onUndo}
      className={`${TILE} w-11 shrink-0 items-center justify-center text-xl text-slate-600`}
    >
      <span aria-hidden="true">−</span>
    </button>
  );
}
