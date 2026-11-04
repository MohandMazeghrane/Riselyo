import type { ReactNode } from 'react';
import { suggestSleepMinutes } from '../../../application/onboarding/onboardingForm';
import { TextField } from '../../components/TextField';
import { fr } from '../../content/fr';

const MINUTES_PER_HOUR = 60;

interface SleepTimesProps {
  readonly bedtime: string;
  readonly wakeTime: string;
  readonly onChange: (change: { bedtime?: string; wakeTime?: string }) => void;
}

/** Last night's bedtime and wake time, with the sleep duration they imply. */
export function SleepTimes({ bedtime, wakeTime, onChange }: SleepTimesProps): ReactNode {
  const slept = suggestSleepMinutes(bedtime, wakeTime);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField
          type="time"
          label={fr.checkIn.bedtime}
          value={bedtime}
          onChange={(event) => {
            onChange({ bedtime: event.target.value });
          }}
        />
        <TextField
          type="time"
          label={fr.checkIn.wakeTime}
          value={wakeTime}
          onChange={(event) => {
            onChange({ wakeTime: event.target.value });
          }}
        />
      </div>
      {slept !== null && (
        <p className="text-sm text-slate-600">
          {fr.checkIn.slept(Math.floor(slept / MINUTES_PER_HOUR), slept % MINUTES_PER_HOUR)}
        </p>
      )}
    </div>
  );
}
