import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { HelpScreen } from '../screens/help/HelpScreen';
import { GoalsScreen } from '../screens/onboarding/GoalsScreen';
import { LifeWheelResultScreen } from '../screens/onboarding/LifeWheelResultScreen';
import { LifeWheelScreen } from '../screens/onboarding/LifeWheelScreen';
import { MeasurementsScreen } from '../screens/onboarding/MeasurementsScreen';
import { RhythmScreen } from '../screens/onboarding/RhythmScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { WhyScreen } from '../screens/onboarding/WhyScreen';
import { EveningCheckInScreen } from '../screens/checkin/EveningCheckInScreen';
import { MorningCheckInScreen } from '../screens/checkin/MorningCheckInScreen';
import { ConsentsScreen } from '../screens/onboarding/ConsentsScreen';
import { PrivacyScreen } from '../screens/privacy/PrivacyScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { TodayScreen } from '../screens/today/TodayScreen';
import { ROUTES } from './routes';

export function App(): ReactNode {
  return (
    <Routes>
      <Route path={ROUTES.today} element={<TodayScreen />} />
      <Route path={ROUTES.help} element={<HelpScreen />} />
      <Route path={ROUTES.welcome} element={<WelcomeScreen />} />
      <Route path={ROUTES.lifeWheel} element={<LifeWheelScreen />} />
      <Route path={ROUTES.lifeWheelResult} element={<LifeWheelResultScreen />} />
      <Route path={ROUTES.measurements} element={<MeasurementsScreen />} />
      <Route path={ROUTES.rhythm} element={<RhythmScreen />} />
      <Route path={ROUTES.why} element={<WhyScreen />} />
      <Route path={ROUTES.goals} element={<GoalsScreen />} />
      <Route path={ROUTES.consents} element={<ConsentsScreen />} />
      <Route path={ROUTES.profile} element={<ProfileScreen />} />
      <Route path={ROUTES.privacy} element={<PrivacyScreen />} />
      <Route path={ROUTES.morningCheckIn} element={<MorningCheckInScreen />} />
      <Route path={ROUTES.eveningCheckIn} element={<EveningCheckInScreen />} />
      <Route path="*" element={<Navigate to={ROUTES.today} replace />} />
    </Routes>
  );
}
