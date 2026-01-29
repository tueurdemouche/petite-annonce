import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/register" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/verify" options={{ presentation: 'modal' }} />
        <Stack.Screen name="listing/[id]" />
        <Stack.Screen name="listing/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="legal/privacy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="legal/terms" options={{ presentation: 'modal' }} />
        <Stack.Screen name="legal/cgu" options={{ presentation: 'modal' }} />
        <Stack.Screen name="legal/contact" options={{ presentation: 'modal' }} />
        <Stack.Screen name="legal/about" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
