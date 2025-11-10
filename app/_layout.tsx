import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { UserProvider } from '@/contexts/UserContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useUser } from '@/hooks/useUser';

function RootLayoutNav() {
  const { profile, loading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!profile?.isOnboardingCompleted && inAuthGroup) {
      // Redirect to onboarding if not completed
      router.replace('/onboarding');
    } else if (profile?.isOnboardingCompleted && !inAuthGroup) {
      // Redirect to main app if onboarding completed
      router.replace('/(tabs)');
    }
  }, [profile?.isOnboardingCompleted, segments, loading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <UserProvider>
        <WorkoutProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </WorkoutProvider>
      </UserProvider>
    </LanguageProvider>
  );
}