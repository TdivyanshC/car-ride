import { useState, useCallback } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';

// Configure Google Sign-in with the Web client ID
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  // Handle Google login - gets idToken directly from device
  const handleGoogleLogin = useCallback(async (onSuccess: (idToken: string) => Promise<void>) => {
    setLoading(true);

    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in and get the user
      const userInfo = await GoogleSignin.signIn();
      
      console.log('Google Sign-In Success:', userInfo);

      // Get the idToken using getTokens() method
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) {
        throw new Error('No idToken received from Google');
      }

      console.log('Got idToken:', idToken.substring(0, 20) + '...');

      // Send idToken to the backend
      await onSuccess(idToken);
      
    } catch (error: any) {
      console.error('Google login error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        Toast.show({
          type: 'info',
          text1: 'Login Cancelled',
          text2: 'Google sign-in was cancelled',
        });
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g., sign in) is in progress already
        Toast.show({
          type: 'info',
          text1: 'Sign In Progress',
          text2: 'Google sign-in is already in progress',
        });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play services not available or outdated
        Toast.show({
          type: 'error',
          text1: 'Google Play Services Error',
          text2: 'Google Play Services is not available on this device',
        });
      } else {
        // Some other error happened
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: error.message || 'Something went wrong with Google sign-in',
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out from Google
  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
      console.log('Google sign-out successful');
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
  }, []);

  return {
    loading,
    handleGoogleLogin,
    signOut,
  };
};

export default useGoogleAuth;
