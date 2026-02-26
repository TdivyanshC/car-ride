import { API_BASE_URL } from './rides';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  photo?: string;
  is_rider?: boolean;
  is_passenger?: boolean;
}

export interface GoogleAuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface AuthError {
  success: boolean;
  message: string;
}

// Custom response type that includes status
export interface ApiResponse<T> {
  user: T;
  status: number;
  ok: boolean;
}

export const authApi = {
  // Google login - send idToken to backend for verification
  googleLogin: async (idToken: string): Promise<GoogleAuthResponse> => {
    console.log('Sending idToken to backend:', idToken?.substring(0, 20) + '...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        let errorData: AuthError;
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        throw new Error(errorData.message || 'Google login failed');
      }

      const data: GoogleAuthResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Handle network errors
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  },

  // Get current user - returns response with status so caller can handle 401 vs other errors
  getCurrentUser: async (token: string): Promise<{ status: number; user?: User; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { status: response.status, user: data.user };
      } else {
        // Return status so caller can distinguish 401 from other errors
        return { status: response.status, error: `HTTP error: ${response.status}` };
      }
    } catch (error: any) {
      console.error('Get current user error:', error);
      // Network error - return special status
      return { status: 0, error: error.message };
    }
  },
};
