import * as SecureStore from 'expo-secure-store';

export interface StoredUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  photo?: string;
  is_rider?: boolean;
  is_passenger?: boolean;
}

export const secureStorage = {
  // Save token
  setToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync('token', token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw new Error('Failed to save token');
    }
  },

  // Get token
  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Remove token
  removeToken: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Save user
  setUser: async (user: StoredUser): Promise<void> => {
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Failed to save user');
    }
  },

  // Get user
  getUser: async (): Promise<StoredUser | null> => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Remove user
  removeUser: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  // Clear all auth data
  clearAuthData: async (): Promise<void> => {
    await Promise.all([
      secureStorage.removeToken(),
      secureStorage.removeUser(),
    ]);
  },
};
