import { Stack } from 'expo-router';
import React from 'react';

export default function IntroLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="presentation" />
      <Stack.Screen name="features" />
    </Stack>
  );
}