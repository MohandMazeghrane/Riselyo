import type { ReactNode } from 'react';
import { ChoiceGroup } from '../../components/ChoiceGroup';
import { SCALE_CHOICES } from './scaleChoices';

interface ScaleQuestionProps {
  readonly legend: string;
  readonly hint: string;
  readonly value: number | undefined;
  readonly onChange: (value: number) => void;
}

/** A 1-to-5 rating, the same for sleep quality, energy and stress. */
export function ScaleQuestion(props: ScaleQuestionProps): ReactNode {
  return <ChoiceGroup {...props} choices={SCALE_CHOICES} />;
}
