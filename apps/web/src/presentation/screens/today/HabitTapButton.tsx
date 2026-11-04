import type { ReactNode } from 'react';
import type { TodayHabit } from '../../../application/habits/getTodayHabits';
import { fr } from '../../content/fr';
import { habitLabel, levelText, tierText } from '../../content/habitTexts';

interface HabitTapButtonProps {
  readonly item: TodayHabit;
  readonly disabled: boolean;
  readonly onTap: () => void;
}

/** One habit of the day: a single large button, each tap moves to the next level. */
export function HabitTapButton({ item, disabled, onTap }: HabitTapButtonProps): ReactNode {
  const { habit, level } = item;
  const label = habitLabel(habit.templateId);
  const levelLabel = level === undefined ? fr.todayHabits.notLogged : levelText(habit.kind, level);
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      aria-label={fr.todayHabits.tapLabel(label, levelLabel)}
      className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 active:bg-brand-50 disabled:opacity-60"
    >
      <span className="flex flex-col">
        <span className="font-semibold">{label}</span>
        <span className="text-sm text-slate-600">{detailOf(item)}</span>
      </span>
      <LevelBadge reached={level !== undefined && level !== 'none'} text={levelLabel} />
    </button>
  );
}

function LevelBadge({ reached, text }: { reached: boolean; text: string }): ReactNode {
  const colors = reached ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700';
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${colors}`}>{text}</span>
  );
}

/** The target tier of a habit to build, or the days without for a habit to reduce. */
function detailOf({ habit, daysWithout }: TodayHabit): string {
  return daysWithout === null
    ? fr.todayHabits.target(tierText(habit.templateId, habit.tier))
    : fr.todayHabits.daysWithout(daysWithout);
}
