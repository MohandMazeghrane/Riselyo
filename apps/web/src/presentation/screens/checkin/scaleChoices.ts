import { CHECK_IN_FORM } from '../../../application/checkin/checkInForm';
import type { Choice } from '../../components/ChoiceGroup';

/** The 1-to-5 answers shared by sleep quality, energy and stress. */
export const SCALE_CHOICES: readonly Choice<number>[] = Array.from(
  { length: CHECK_IN_FORM.scaleMax - CHECK_IN_FORM.scaleMin + 1 },
  (_, index) => {
    const value = CHECK_IN_FORM.scaleMin + index;
    return { value, label: String(value) };
  },
);
