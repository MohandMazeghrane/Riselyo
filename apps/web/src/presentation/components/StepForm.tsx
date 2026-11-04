import type { FormEvent, ReactNode } from 'react';
import type { DomainError } from '../../domain/shared/domainError';
import { fr } from '../content/fr';
import { Button } from './Button';
import { FooterActions } from './FooterActions';
import { FormMessage } from './FormMessage';
import { StepLayout } from './StepLayout';

interface StepFormProps {
  readonly step: number;
  readonly title: string;
  readonly backTo?: string;
  readonly onSubmit: () => void;
  readonly pending: boolean;
  readonly error: DomainError | null;
  /** Shown when the use case rejects the answer; otherwise a generic save error. */
  readonly invalidMessage?: string;
  readonly submitLabel?: string;
  readonly submitDisabled?: boolean;
  /** Extra content in the footer, above the main button (a hint, for example). */
  readonly footerBefore?: ReactNode;
  /** When given, a visible "Passer" button under the main one. */
  readonly onSkip?: () => void;
  readonly children: ReactNode;
}

/** An onboarding screen built around one form and one main action. */
export function StepForm(props: StepFormProps): ReactNode {
  const { step, title, backTo, onSubmit, children } = props;
  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    onSubmit();
  };
  return (
    <StepLayout step={step} title={title} {...(backTo === undefined ? {} : { backTo })}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-5">
        {children}
        <SubmitError {...props} />
        <StepFooter {...props} />
      </form>
    </StepLayout>
  );
}

function SubmitError({ error, invalidMessage }: StepFormProps): ReactNode {
  if (error === null) {
    return null;
  }
  const message =
    error.code === 'invalid_input' && invalidMessage !== undefined
      ? invalidMessage
      : fr.common.saveError;
  return <FormMessage tone="error">{message}</FormMessage>;
}

function StepFooter(props: StepFormProps): ReactNode {
  const { pending, onSkip, submitLabel = fr.common.next, submitDisabled = false } = props;
  return (
    <FooterActions>
      {props.footerBefore}
      <Button type="submit" disabled={pending || submitDisabled}>
        {pending ? fr.common.saving : submitLabel}
      </Button>
      {onSkip !== undefined && (
        <Button variant="secondary" disabled={pending} onClick={onSkip}>
          {fr.common.skip}
        </Button>
      )}
    </FooterActions>
  );
}
