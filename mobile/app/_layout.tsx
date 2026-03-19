import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 1. index is the Welcome screen. Let it load naturally. */}
        <Stack.Screen name="index" />
        
        {/* 2. These are the Auth screens (Login/Signup). */}
        <Stack.Screen name="(auth)" />
        
        {/* 3. These are the protected groups. */}
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(college)" />
        <Stack.Screen name="(company)" />
        <Stack.Screen name="(school)" />
        <Stack.Screen name="(university)" />
      </Stack>
    </AuthProvider>
  );
}