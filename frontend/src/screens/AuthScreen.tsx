import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import useGoogleAuth from '../hooks/useGoogleAuth';

export default function AuthScreen() {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const { loading: googleLoading, handleGoogleLogin } = useGoogleAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    if (!isLogin && (!name.trim() || !phone.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    // Password validation
    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters',
      });
      return;
    }

    setLoading(true);

    try {
      // For now, we'll use Google login primarily
      throw new Error('Email/password authentication is not implemented. Please use Google login.');
    } catch (error: any) {
      console.error('Auth error:', error);
      Toast.show({
        type: 'error',
        text1: 'Authentication Failed',
        text2: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginPress = async () => {
    try {
      await handleGoogleLogin(async (idToken) => {
        await googleLogin(idToken);
        Toast.show({
          type: 'success',
          text1: 'Welcome!',
          text2: 'Google login successful',
        });
        // Navigate to home after successful login
        router.replace('/(tabs)');
      });
    } catch (error: any) {
      console.error('Google login failed:', error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="car" size={80} color="#007AFF" />
            <Text style={styles.title}>Car Ride Sharing</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Join our community'}
            </Text>
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={[styles.googleButton, (googleLoading || loading) && styles.buttonDisabled]}
            onPress={handleGoogleLoginPress}
            disabled={googleLoading || loading}
          >
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2008px-Google_%22G%22_Logo.svg.png' }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>
              {googleLoading ? 'Please wait...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              {!isLogin && (
                <Text style={styles.hint}>Must be at least 6 characters</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={toggleMode}>
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#666',
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  switchText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
