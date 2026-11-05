import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { HabitPlanScreen } from '../screens/habits/HabitPlanScreen';
import { HelpScreen } from '../screens/help/HelpScreen';
import { InstallScreen } from '../screens/install/InstallScreen';
import { MyDataScreen } from '../screens/myData/MyDataScreen';
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
import { UpcomingTabScreen } from '../screens/upcoming/UpcomingTabScreen';
import { usePurgeOnLaunch } from '../hooks/usePurgeOnLaunch';
import { ROUTES } from './routes';
import { TabLayout } from './TabLayout';

export function App(): ReactNode {
  usePurgeOnLaunch();
  return (
    <Routes>
      <Route element={<TabLayout />}>
        <Route path={ROUTES.today} element={<TodayScreen />} />
        <Route path={ROUTES.coach} element={<UpcomingTabScreen tab="coach" />} />
        <Route path={ROUTES.progress} element={<UpcomingTabScreen tab="progress" />} />
        <Route path={ROUTES.reviews} element={<UpcomingTabScreen tab="reviews" />} />
        <Route path={ROUTES.profile} element={<ProfileScreen />} />
      </Route>
      <Route path={ROUTES.help} element={<HelpScreen />} />
      <Route path={ROUTES.welcome} element={<WelcomeScreen />} />
      <Route path={ROUTES.lifeWheel} element={<LifeWheelScreen />} />
      <Route path={ROUTES.lifeWheelResult} element={<LifeWheelResultScreen />} />
      <Route path={ROUTES.measurements} element={<MeasurementsScreen />} />
      <Route path={ROUTES.rhythm} element={<RhythmScreen />} />
      <Route path={ROUTES.why} element={<WhyScreen />} />
      <Route path={ROUTES.goals} element={<GoalsScreen />} />
      <Route path={ROUTES.consents} element={<ConsentsScreen />} />
      <Route path={ROUTES.privacy} element={<PrivacyScreen />} />
      <Route path={ROUTES.habits} element={<HabitPlanScreen />} />
      <Route path={ROUTES.myData} element={<MyDataScreen />} />
      <Route path={ROUTES.install} element={<InstallScreen />} />
      <Route path={ROUTES.morningCheckIn} element={<MorningCheckInScreen />} />
      <Route path={ROUTES.eveningCheckIn} element={<EveningCheckInScreen />} />
      <Route path="*" element={<Navigate to={ROUTES.today} replace />} />
    </Routes>
  );
}
