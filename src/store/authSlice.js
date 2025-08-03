/**
 * Creates a Zustand slice for handling authentication state.
 * This slice manages the user profile, token, and initialization status.
 *
 * @param {Function} set - The Zustand `set` function to update state.
 * @returns {object} The authentication slice.
 */
export const createAuthSlice = (set) => ({
  // ## STATE ##
  user: null,
  token: null,
  isInitialized: false, // Becomes true after the initial session check is complete

  // ## ACTIONS ##

  /**
   * Sets the user and token in the state.
   * @param {object | null} user - The user's profile data.
   * @param {string | null} token - The authentication token.
   */
  setUser: (user) => {
    set({
      user: user,
    });
  },

  setToken: (token) => {
    // If a token is provided, store it in sessionStorage for persistence.
    if (token) {
      sessionStorage.setItem('accessToken', token);
    } else {
      sessionStorage.removeItem('accessToken');
    }

    set({
      token: token,
    });
  },

  /**
   * Clears user data and token from state and sessionStorage.
   */
  logout: () => {
    sessionStorage.clear();
    localStorage.clear();
    set({
      user: null,
      token: null,
      isInitialized: true,
    });
  },
});
