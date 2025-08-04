/* eslint-disable */
import { create } from 'zustand';
import axios from 'axios';

// Import your slices
import { createAuthSlice } from './authSlice.js';
import { createFeedSlice } from './feedSlice.js';
import { createSubscriptionSlice } from './subscriptionSlice.js';
import { createCommonSlice } from './commonSlice.js';

// --- AXIOS INSTANCE ---
export const axiosCopy = axios.create({
  baseURL: 'https://newinterlinked.com/api',
});

// --- ZUSTAND STORE ---
export const useAppStore = create((...a) => ({
  ...createAuthSlice(...a),
  ...createFeedSlice(...a),
  ...createSubscriptionSlice(...a),
  ...createCommonSlice(...a),
}));

// --- AXIOS REQUEST INTERCEPTOR ---
// This interceptor automatically adds the auth token to every request.
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

// --- AXIOS RESPONSE INTERCEPTOR ---
// This interceptor handles global API errors, like 401 Unauthorized.
axiosCopy.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  (error) => {
    // Check if the error is a 401 Unauthorized response.
    if (error.response && error.response.status === 401) {
      const { logout } = useAppStore.getState();
      // Call the logout action to clear user state and token.
      logout();
      // Redirect the user to the sign-in page.
      // Using window.location.href is a direct way to force a page change.
      window.location.href = '/auth/jwt/sign-in';
    }
    // For all other errors, reject the promise to allow local error handling.
    return Promise.reject(error);
  }
);

// --- INITIAL SESSION CHECK ---
// This self-invoking function runs ONCE when the app starts.
(async () => {
  const accessToken = sessionStorage.getItem('accessToken');
  const { setUser, logout } = useAppStore.getState();

  if (accessToken) {
    try {
      useAppStore.setState({ token: accessToken });
      const res = await axiosCopy.get('/user/me');
      setUser(res.data);
    } catch (error) {
      console.error('Failed to restore session:', error);
      if (error.response?.status !== 401) {
        logout();
      }
    }
  } else {
    useAppStore.setState({ isInitialized: true });
  }
})();
