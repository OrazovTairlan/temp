export const createCommonSlice = (set) => ({
  // --- Initial UI State ---
  isOpenSettingsMenu: false,
  isOpenNotificationMenu: false,

  // --- UI Actions ---

  /**
   * Toggles the visibility of the settings menu.
   * Ensures the notification menu is closed to prevent overlap.
   */
  toggleSettingsMenu: () => {
    set((state) => ({
      isOpenSettingsMenu: !state.isOpenSettingsMenu,
      isOpenNotificationMenu: false, // Close other menus for better UX
    }));
  },

  /**
   * Toggles the visibility of the notification menu.
   * Ensures the settings menu is closed.
   */
  toggleNotificationMenu: () => {
    set((state) => ({
      isOpenNotificationMenu: !state.isOpenNotificationMenu,
      isOpenSettingsMenu: false, // Close other menus for better UX
    }));
  },

  /**
   * A helper action to close all managed menus.
   * Useful for onClickAway handlers or when navigating to a new route.
   */
  closeAllMenus: () => {
    set({
      isOpenSettingsMenu: false,
      isOpenNotificationMenu: false,
    });
  },
});
