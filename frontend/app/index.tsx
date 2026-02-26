import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import AuthScreen from '../src/screens/AuthScreen';

function AuthNavigator() {
  const { user, loading, isAuthLoaded } = useAuth();

  // Show loading screen while auth state is being restored
  // This ensures user never briefly sees login screen on app start
  if (!isAuthLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // After auth is loaded:
  // - If user exists, redirect to main app (tabs)
  // - If no user, show auth screen
  // The user is already restored from storage before this check
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // No valid token - show login screen
  return <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
