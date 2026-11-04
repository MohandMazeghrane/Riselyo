import type { OnboardingStatus } from '../../application/onboarding/getOnboardingStatus';
import { useContainer } from '../app/ContainerContext';
import { useAsyncData, type AsyncData } from './useAsyncData';

export function useOnboardingStatus(): AsyncData<OnboardingStatus> & {
  readonly retry: () => void;
} {
  return useAsyncData(useContainer().onboarding.getStatus);
}
