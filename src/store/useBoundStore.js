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
  baseURL: '/api',
});

// --- ZUSTAND STORE ---
export const useAppStore = create((...a) => ({
  ...createAuthSlice(...a),
  ...createFeedSlice(...a),
  ...createSubscriptionSlice(...a),
  ...createCommonSlice(...a),
}));

// --- AXIOS INTERCEPTORS ---

// Request Interceptor: Attaches the access token to every outgoing request.
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

// A queue for failed requests to be retried after token refresh.
let failedQueue = [];
let isRefreshing = false;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handles token refresh on 401 errors.
axiosCopy.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { logout, setToken } = useAppStore.getState();

    // Check if the error is a 401 and it's not a retry request.
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue the request.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosCopy(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        logout(); // No refresh token available, logout immediately.
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token.
        const res = await axios.post('/api/refresh', { refreshToken });
        const { accessToken: newAccessToken } = res.data;

        // Update storage and store with the new token.
        sessionStorage.setItem('accessToken', newAccessToken);
        setToken(newAccessToken);

        // Update the header of the original request and retry it.
        axiosCopy.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Process any queued requests with the new token.
        processQueue(null, newAccessToken);

        return axiosCopy(originalRequest);
      } catch (refreshError) {
        // If the refresh fails, logout the user and reject all queued requests.
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


// --- INITIAL SESSION CHECK ---
(async () => {
  const accessToken = sessionStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken');
  const { setUser, logout } = useAppStore.getState();

  if (accessToken && refreshToken) {
    try {
      // Temporarily set the token for the upcoming API call.
      useAppStore.setState({ token: accessToken });

      // Fetch user profile to validate the session.
      const res = await axiosCopy.get('/user/me');
      setUser(res.data);
    } catch (error) {
      console.error('Failed to restore session:', error);
      // If the token is invalid, the interceptor will attempt to refresh.
      // If that also fails, the interceptor will handle the logout.
      // We can also call logout here as a fallback.
      if (error.response?.status === 401) {
        // The interceptor is already handling this.
      } else {
        logout();
      }
    }
  } else {
    // No tokens found, ensure the app is marked as initialized.
    useAppStore.setState({ isInitialized: true });
  }
})();
