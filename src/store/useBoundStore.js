/* eslint-disable */
import { create } from 'zustand';
import axios from 'axios';

// Import your slices
import { createAuthSlice } from './authSlice.js';
import { createFeedSlice } from './feedSlice.js';
import { createSubscriptionSlice } from './subscriptionSlice.js';
import { createCommonSlice } from './commonSlice.js';

// --- AXIOS INSTANCE ---
// We create a single, configured Axios instance to use throughout the app.
export const axiosCopy = axios.create({
  baseURL: '/api',
});
// --- ZUSTAND STORE ---
// We combine all slices into the main application store.
export const useAppStore = create((...a) => ({
  ...createAuthSlice(...a),
  ...createFeedSlice(...a),
  ...createSubscriptionSlice(...a),
  ...createCommonSlice(...a),
}));

// --- AXIOS INTERCEPTOR ---
// The interceptor automatically adds the auth token from the store to every request.
axiosCopy.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INITIAL SESSION CHECK ---
// This self-invoking function runs ONCE when the app starts.
(async () => {
  // 1. Try to get the token from browser storage.
  const accessToken = sessionStorage.getItem('accessToken');

  // Get the actions from the store to update state.
  const { setUser, logout } = useAppStore.getState();

  if (accessToken) {
    try {
      // 2. Temporarily set the token in the store so the interceptor can use it.
      useAppStore.setState({ token: accessToken });

      // 3. Make the API call to fetch the user's profile.
      const res = await axiosCopy.get('/user/me');
      const user = res.data;

      // 4. On success, update the store with the full user and token.
      setUser(user);
    } catch (error) {
      console.error('Failed to restore session:', error);
      // 5. If the token is invalid or the API call fails, log the user out.
      logout();
    }
  } else {
    // If no token is found, ensure the app is marked as initialized with no user.
    useAppStore.setState({ isInitialized: true });
  }
})();
