import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(college)" />
        <Stack.Screen name="(company)" />
        <Stack.Screen name="(school)" />
        <Stack.Screen name="(university)" />
      </Stack>
    </AuthProvider>
  );
}