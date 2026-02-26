import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import AuthScreen from '../src/screens/AuthScreen';

function AuthNavigator() {
  const { user, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If user is logged in, redirect to main app
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // If not logged in, show auth screen
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
