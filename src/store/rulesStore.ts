/**
 * Zustand store for Ruff rules management
 * Manages rules, categories, filters, and LocalStorage sync
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { loadRuffData } from '@/services/dataLoader';
import {
  loadUserSettings,
  saveUserSettings,
  saveRulePreference,
} from '@/services/storageManager';
import type {
  RuffRule,
  RuffCategory,
  FilterOptions,
  EmbeddedRuffData,
} from '@/types/ruffTypes';
import type { UserSettings } from '@/types/configTypes';

/**
 * Rules store state interface
 */
interface RulesState {
  // State
  rules: RuffRule[];
  categories: RuffCategory[];
  selectedCategory: string | null;
  searchQuery: string;
  filterOptions: FilterOptions;
  isLoading: boolean;
  error: string | null;
  ruffVersion: string;
  lastUpdated: Date | null;

  // Actions
  loadData: () => Promise<void>;
  toggleRule: (code: string) => void;
  setRuleEnabled: (code: string, enabled: boolean, reason?: string) => void;
  toggleCategory: (categoryId: string, enabled: boolean) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterOptions: (options: FilterOptions) => void;
  resetFilters: () => void;
  getFilteredRules: () => RuffRule[];
  reset: () => void;
}

/**
 * Default filter options
 */
const defaultFilterOptions: FilterOptions = {
  status: [],
  legend: [],
  fixable: null,
  ecosystem: [],
};

/**
 * Initial state
 */
const initialState = {
  rules: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  filterOptions: defaultFilterOptions,
  isLoading: false,
  error: null,
  ruffVersion: '',
  lastUpdated: null,
};

/**
 * Zustand store for rules management
 */
export const useRulesStore = create<RulesState>()(
  immer((set, get) => ({
    ...initialState,

    /**
     * Load rules and categories from embedded data
     */
    loadData: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Load embedded Ruff data
        const data: EmbeddedRuffData = await loadRuffData();

        // Load user settings from LocalStorage
        const userSettings = loadUserSettings();

        // Transform embedded data to RuffRule format with user preferences
        const rules: RuffRule[] = data.rules.map((rule) => {
          const userPref = userSettings?.ruleSettings[rule.code];

          const ruffRule: RuffRule = {
            ...rule,
            enabled: userPref?.enabled ?? true, // Default to enabled
            isExpanded: false,
          };

          // Conditionally add optional properties to satisfy exactOptionalPropertyTypes
          if (userPref?.ignoreReason !== undefined) {
            ruffRule.ignoreReason = userPref.ignoreReason;
          }

          if (userPref?.lastModified) {
            ruffRule.lastModified = new Date(userPref.lastModified);
          }

          return ruffRule;
        });

        // Calculate category statistics
        const categories: RuffCategory[] = data.categories.map((cat) => {
          const rulesInCategory = rules.filter((r) => r.category === cat.id);
          const enabledCount = rulesInCategory.filter((r) => r.enabled).length;

          return {
            ...cat,
            enabledCount,
            enabled: enabledCount === rulesInCategory.length && rulesInCategory.length > 0,
          };
        });

        // Restore last selected category from settings
        const lastSelectedCategory = userSettings?.lastSelectedCategory ?? null;

        set((state) => {
          state.rules = rules;
          state.categories = categories;
          state.selectedCategory = lastSelectedCategory;
          state.ruffVersion = data.version;
          state.lastUpdated = new Date();
          state.isLoading = false;
          state.error = null;
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load Ruff data';

        set((state) => {
          state.isLoading = false;
          state.error = errorMessage;
        });
      }
    },

    /**
     * Toggle rule enabled state
     */
    toggleRule: (code: string) => {
      const rule = get().rules.find((r) => r.code === code);
      if (!rule) return;

      const newEnabled = !rule.enabled;
      get().setRuleEnabled(code, newEnabled, newEnabled ? undefined : rule.ignoreReason);
    },

    /**
     * Set rule enabled state with optional reason
     */
    setRuleEnabled: (code: string, enabled: boolean, reason?: string) => {
      set((state) => {
        const rule = state.rules.find((r) => r.code === code);
        if (!rule) return;

        rule.enabled = enabled;

        // Conditionally set ignoreReason to satisfy exactOptionalPropertyTypes
        if (enabled) {
          delete rule.ignoreReason;
        } else if (reason !== undefined) {
          rule.ignoreReason = reason;
        }

        rule.lastModified = new Date();

        // Update category statistics
        const category = state.categories.find((c) => c.id === rule.category);
        if (category) {
          const rulesInCategory = state.rules.filter((r) => r.category === category.id);
          const enabledCount = rulesInCategory.filter((r) => r.enabled).length;
          category.enabledCount = enabledCount;
          category.enabled = enabledCount === rulesInCategory.length;
        }
      });

      // Save to LocalStorage
      saveRulePreference(code, enabled, reason);

      // Save full settings
      const userSettings: UserSettings = {
        ruleSettings: Object.fromEntries(
          get()
            .rules.filter((r) => !r.enabled || r.ignoreReason)
            .map((r) => {
              const setting: {
                enabled: boolean;
                ignoreReason?: string;
                lastModified: string;
              } = {
                enabled: r.enabled,
                lastModified: r.lastModified?.toISOString() ?? new Date().toISOString(),
              };

              // Conditionally add ignoreReason to satisfy exactOptionalPropertyTypes
              if (r.ignoreReason !== undefined) {
                setting.ignoreReason = r.ignoreReason;
              }

              return [r.code, setting];
            })
        ),
        viewMode: 'list',
        lastSelectedCategory: get().selectedCategory,
        customTemplates: [],
        version: '1.0.0',
      };
      saveUserSettings(userSettings);
    },

    /**
     * Toggle all rules in a category
     */
    toggleCategory: (categoryId: string, enabled: boolean) => {
      const rulesInCategory = get().rules.filter((r) => r.category === categoryId);

      rulesInCategory.forEach((rule) => {
        get().setRuleEnabled(rule.code, enabled);
      });
    },

    /**
     * Set selected category filter
     */
    setSelectedCategory: (categoryId: string | null) => {
      set((state) => {
        state.selectedCategory = categoryId;
      });

      // Save to user settings
      const userSettings: UserSettings = {
        ruleSettings: Object.fromEntries(
          get()
            .rules.filter((r) => !r.enabled || r.ignoreReason)
            .map((r) => {
              const setting: {
                enabled: boolean;
                ignoreReason?: string;
                lastModified: string;
              } = {
                enabled: r.enabled,
                lastModified: r.lastModified?.toISOString() ?? new Date().toISOString(),
              };

              // Conditionally add ignoreReason to satisfy exactOptionalPropertyTypes
              if (r.ignoreReason !== undefined) {
                setting.ignoreReason = r.ignoreReason;
              }

              return [r.code, setting];
            })
        ),
        viewMode: 'list',
        lastSelectedCategory: categoryId,
        customTemplates: [],
        version: '1.0.0',
      };
      saveUserSettings(userSettings);
    },

    /**
     * Set search query
     */
    setSearchQuery: (query: string) => {
      set((state) => {
        state.searchQuery = query.trim();
      });
    },

    /**
     * Set filter options
     */
    setFilterOptions: (options: FilterOptions) => {
      set((state) => {
        state.filterOptions = options;
      });
    },

    /**
     * Reset all filters
     */
    resetFilters: () => {
      set((state) => {
        state.filterOptions = defaultFilterOptions;
        state.searchQuery = '';
        state.selectedCategory = null;
      });
    },

    /**
     * Get filtered rules based on current filters
     */
    getFilteredRules: (): RuffRule[] => {
      const { rules, selectedCategory, searchQuery, filterOptions } = get();

      return rules.filter((rule) => {
        // Category filter
        if (selectedCategory && rule.category !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            rule.code.toLowerCase().includes(query) ||
            rule.name.toLowerCase().includes(query) ||
            rule.description.toLowerCase().includes(query);

          if (!matchesSearch) return false;
        }

        // Status filter (enabled/disabled)
        if (filterOptions.status.length > 0) {
          const matchesStatus = filterOptions.status.some((status) => {
            if (status === 'enabled') return rule.enabled;
            if (status === 'disabled') return !rule.enabled;
            return false;
          });

          if (!matchesStatus) return false;
        }

        // Legend status filter
        if (filterOptions.legend.length > 0) {
          if (!filterOptions.legend.includes(rule.legendInfo.status)) {
            return false;
          }
        }

        // Fixable filter
        if (filterOptions.fixable !== null) {
          if (rule.legendInfo.fixable !== filterOptions.fixable) {
            return false;
          }
        }

        // Ecosystem filter
        if (filterOptions.ecosystem.length > 0) {
          const ruleEcosystems = rule.legendInfo.ecosystemSpecific ?? [];
          const matchesEcosystem = filterOptions.ecosystem.some((ecosystem) =>
            ruleEcosystems.includes(ecosystem)
          );

          if (!matchesEcosystem) return false;
        }

        return true;
      });
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
      set(initialState);
    },
  }))
);
