import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Set auth token in axios headers
      setAuthToken: (token) => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          delete axios.defaults.headers.common['Authorization'];
        }
      },

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/auth/login', { email, password });
          const { token, user } = response.data;
          console.log(token);
          set({ user, token, isLoading: false });
          get().setAuthToken(token);
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Signup action
      signup: async (userData) => {
        console.log("=======");
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/auth/signup', userData);
          const { token, user } = response.data;
          console.log("=====------");
          set({ user, token, isLoading: false });
          get().setAuthToken(token);
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Signup failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Get current user
      getMe: async () => {
        const { token } = get();
        if (!token) return { success: false, error: 'No token found' };

        set({ isLoading: true, error: null });
        try {
          get().setAuthToken(token);
          const response = await axios.get('/auth/me');
          const { user } = response.data;
          
          set({ user, isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to get user data';
          set({ error: errorMessage, isLoading: false });
          
          // If token is invalid, logout
          if (error.response?.status === 401) {
            get().logout();
          }
          
          return { success: false, error: errorMessage };
        }
      },

      // Search user by registration ID
      searchUserByRegistrationId: async (registrationId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/auth/search?registrationId=${registrationId}`);
          const { user } = response.data;
          set({ isLoading: false });
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to search user';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Search users by email for suggestions
      searchUsersByEmail: async (emailQuery) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`/auth/search/email?q=${emailQuery}`);
          const { users } = response.data;
          set({ isLoading: false });
          return { success: true, users };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to search emails';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put('/auth/profile', profileData);
          const { user } = response.data;
          
          set({ user, isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: error.response?.data || { message: errorMessage } };
        }
      },

      forgotPassword: async (email) => {
        try {
          await axios.post('/auth/forgot-password', { email });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Could not send reset link' };
        }
      },

      resetPassword: async (token, password) => {
        try {
          const response = await axios.post(`/auth/reset-password/${token}`, { password });
          const { token: authToken, user } = response.data;
          set({ user, token: authToken });
          get().setAuthToken(authToken);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Could not reset password' };
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          const response = await axios.post('/auth/change-password', { currentPassword, newPassword });
          set({ token: response.data.token });
          get().setAuthToken(response.data.token);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Could not change password' };
        }
      },

      // Download everything we hold about this account as a JSON file
      exportData: async () => {
        try {
          const response = await axios.get('/auth/export', { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/json' }));
          const link = document.createElement('a');
          link.href = url;
          link.download = `twogether-data-${new Date().toISOString().slice(0, 10)}.json`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.status === 429 ? 'Too many attempts. Try again later.' : 'Could not prepare your data' };
        }
      },

      // Permanently delete the account. The server needs the password again.
      deleteAccount: async (password) => {
        try {
          await axios.post('/auth/delete-account', { password });
          set({ user: null, token: null, error: null });
          get().setAuthToken(null);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Could not delete your account' };
        }
      },

      // Logout action
      logout: () => {
        set({ user: null, token: null, error: null });
        get().setAuthToken(null);
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check if user is authenticated
      isAuthenticated: () => {
        const { token, user } = get();
        return !!(token && user);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user 
      }),
      onRehydrateStorage: () => (state) => {
        // Set auth token when store is rehydrated
        if (state?.token) {
          state.setAuthToken(state.token);
          // If user exists but registrationId is missing, re-fetch user data
          if (state.user && !state.user.registrationId) {
            state.getMe();
          }
        }
      }
    }
  )
);

export default useAuthStore;