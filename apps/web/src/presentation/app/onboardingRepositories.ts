import type {
  BodyMeasurementsRepository,
  HabitRepository,
  LifeWheelRepository,
  ProfileRepository,
} from '../../domain/ports/onboardingRepositories';

export interface OnboardingRepositories {
  readonly profiles: ProfileRepository;
  readonly lifeWheels: LifeWheelRepository;
  readonly measurements: BodyMeasurementsRepository;
  readonly habits: HabitRepository;
}
