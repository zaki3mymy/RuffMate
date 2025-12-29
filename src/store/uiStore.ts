/**
 * Zustand store for UI state management
 * Manages theme, view mode, sidebar, modals, notifications, and loading states
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ViewMode } from '@/types/ruffTypes';

/**
 * Notification type
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Notification interface
 */
export interface Notification {
  message: string;
  type: NotificationType;
}

/**
 * Theme type
 */
export type Theme = 'light' | 'dark';

/**
 * UI store state interface
 */
interface UIState {
  // State
  theme: Theme;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  isLoading: boolean;
  notification: Notification | null;
  ruleDetailModalOpen: boolean;
  selectedRuleCode: string | null;
  exportDialogOpen: boolean;

  // Actions - Theme
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Actions - View Mode
  setViewMode: (mode: ViewMode) => void;

  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;

  // Actions - Notifications
  showNotification: (message: string, type: NotificationType) => void;
  clearNotification: () => void;

  // Actions - Modals
  openRuleDetailModal: (ruleCode: string) => void;
  closeRuleDetailModal: () => void;
  openExportDialog: () => void;
  closeExportDialog: () => void;

  // Actions - Settings
  loadUISettings: () => void;
  reset: () => void;
}

/**
 * LocalStorage keys
 */
const STORAGE_KEYS = {
  THEME: 'ruffmate_theme',
  VIEW_MODE: 'ruffmate_view_mode',
  SIDEBAR_OPEN: 'ruffmate_sidebar_open',
};

/**
 * Initial state
 */
const initialState = {
  theme: 'light' as Theme,
  viewMode: 'list' as ViewMode,
  sidebarOpen: true,
  isLoading: false,
  notification: null,
  ruleDetailModalOpen: false,
  selectedRuleCode: null,
  exportDialogOpen: false,
};

/**
 * Zustand store for UI state management
 */
export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    ...initialState,

    /**
     * Set theme mode
     */
    setTheme: (theme: Theme) => {
      set((state) => {
        state.theme = theme;
      });

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    },

    /**
     * Toggle theme between light and dark
     */
    toggleTheme: () => {
      const currentTheme = get().theme;
      const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
      get().setTheme(newTheme);
    },

    /**
     * Set view mode
     */
    setViewMode: (mode: ViewMode) => {
      set((state) => {
        state.viewMode = mode;
      });

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
      } catch (error) {
        console.error('Failed to save view mode to localStorage:', error);
      }
    },

    /**
     * Toggle sidebar open/closed
     */
    toggleSidebar: () => {
      const newState = !get().sidebarOpen;
      get().setSidebarOpen(newState);
    },

    /**
     * Set sidebar open state
     */
    setSidebarOpen: (open: boolean) => {
      set((state) => {
        state.sidebarOpen = open;
      });

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, String(open));
      } catch (error) {
        console.error('Failed to save sidebar state to localStorage:', error);
      }
    },

    /**
     * Set loading state
     */
    setLoading: (loading: boolean) => {
      set((state) => {
        state.isLoading = loading;
      });
    },

    /**
     * Show notification
     */
    showNotification: (message: string, type: NotificationType) => {
      set((state) => {
        state.notification = { message, type };
      });
    },

    /**
     * Clear notification
     */
    clearNotification: () => {
      set((state) => {
        state.notification = null;
      });
    },

    /**
     * Open rule detail modal
     */
    openRuleDetailModal: (ruleCode: string) => {
      set((state) => {
        state.ruleDetailModalOpen = true;
        state.selectedRuleCode = ruleCode;
      });
    },

    /**
     * Close rule detail modal
     */
    closeRuleDetailModal: () => {
      set((state) => {
        state.ruleDetailModalOpen = false;
        state.selectedRuleCode = null;
      });
    },

    /**
     * Open export dialog
     */
    openExportDialog: () => {
      set((state) => {
        state.exportDialogOpen = true;
      });
    },

    /**
     * Close export dialog
     */
    closeExportDialog: () => {
      set((state) => {
        state.exportDialogOpen = false;
      });
    },

    /**
     * Load UI settings from localStorage
     */
    loadUISettings: () => {
      try {
        // Load theme
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          set((state) => {
            state.theme = savedTheme;
          });
        }

        // Load view mode
        const savedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
        if (
          savedViewMode === 'grid' ||
          savedViewMode === 'list' ||
          savedViewMode === 'detailed'
        ) {
          set((state) => {
            state.viewMode = savedViewMode;
          });
        }

        // Load sidebar state
        const savedSidebarOpen = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
        if (savedSidebarOpen === 'true' || savedSidebarOpen === 'false') {
          set((state) => {
            state.sidebarOpen = savedSidebarOpen === 'true';
          });
        }
      } catch (error) {
        console.error('Failed to load UI settings from localStorage:', error);
      }
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
      set(initialState);
    },
  }))
);
