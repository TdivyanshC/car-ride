import { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { makeRedirectUri, exchangeCodeAsync } from 'expo-auth-session';
import Toast from 'react-native-toast-message';

// Configure the Google Auth request for native Android development build
// Use androidClientId for native Android OAuth (development builds)
// This automatically derives the redirect URI from the app package name
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

if (!ANDROID_CLIENT_ID) {
  console.warn('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID is not defined in .env');
}

// Explicitly set the redirect URI for OAuth callback
const redirectUri = makeRedirectUri({
  native: 'com.carridesharing.app:/oauth2callback',
});

// Required for WebBrowser to work properly with Google Auth
WebBrowser.maybeCompleteAuthSession();

const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  // Use Google provider from expo-auth-session
  // For native Android development builds, use androidClientId
  // This will automatically set redirectUri to: com.carridesharing.app:/oauth2callback
  const [request, response, promptAsync] = useAuthRequest(
    {
      androidClientId: ANDROID_CLIENT_ID || '',
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    }
  );

  // Handle Google login response
  const handleGoogleLogin = useCallback(async (onSuccess: (idToken: string) => Promise<void>) => {
    if (!ANDROID_CLIENT_ID) {
      Toast.show({
        type: 'error',
        text1: 'Configuration Error',
        text2: 'Google client ID is not configured',
      });
      return;
    }

    setLoading(true);

    try {
      // Open Google login
      const result = await promptAsync();
      
      console.log('Google Auth Result:', result);

      if (result.type === 'success') {
        // Handle authorization code flow - exchange code for tokens
        if (result.params.code) {
          try {
            const tokens = await exchangeCodeAsync(
              {
                clientId: ANDROID_CLIENT_ID || '',
                code: result.params.code,
                redirectUri,
                extraParams: {
                  code_verifier: request?.codeVerifier || '',
                },
              },
              { tokenEndpoint: 'https://oauth2.googleapis.com/token' }
            );
            
            if (tokens.accessToken) {
              await onSuccess(tokens.accessToken);
            } else {
              throw new Error('Failed to get accessToken from token exchange');
            }
          } catch (exchangeError: any) {
            console.error('Token exchange error:', exchangeError);
            throw new Error('Failed to exchange authorization code for tokens');
          }
        } else if (result.authentication?.accessToken) {
          // Fallback to implicit flow if no code (shouldn't happen with Android)
          await onSuccess(result.authentication.accessToken);
        } else {
          throw new Error('Failed to get token from Google - no code or accessToken');
        }
      } else if (result.type === 'cancel') {
        throw new Error('Login cancelled');
      } else {
        // Log the full error response for debugging
        console.error('Google Auth Error Response:', result);
        throw new Error(`Login failed: ${result.type}`);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  }, [promptAsync, request]);

  return {
    loading,
    handleGoogleLogin,
    request,
  };
};

export default useGoogleAuth;
