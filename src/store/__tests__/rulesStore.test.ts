/**
 * Tests for rulesStore (Zustand)
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createMockEmbeddedData } from '../../../tests/fixtures/mockData';
import type { RuffRule, FilterOptions } from '@/types/ruffTypes';
import type { UserSettings } from '@/types/configTypes';

// Mock services
vi.mock('@/services/dataLoader', () => ({
  loadRuffData: vi.fn(),
}));

vi.mock('@/services/storageManager', () => ({
  loadUserSettings: vi.fn(),
  saveUserSettings: vi.fn(),
  loadRulePreferences: vi.fn(),
  saveRulePreference: vi.fn(),
}));

describe('rulesStore', () => {
  let useRulesStore: any;
  let loadRuffData: any;
  let loadUserSettings: any;
  let loadRulePreferences: any;
  let saveRulePreference: any;

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();

    // Get mocked services
    const dataLoader = await import('@/services/dataLoader');
    const storageManager = await import('@/services/storageManager');
    loadRuffData = dataLoader.loadRuffData;
    loadUserSettings = storageManager.loadUserSettings;
    loadRulePreferences = storageManager.loadRulePreferences;
    saveRulePreference = storageManager.saveRulePreference;

    // Setup default mocks
    const mockData = createMockEmbeddedData();
    loadRuffData.mockResolvedValue(mockData);
    loadUserSettings.mockReturnValue(null);
    loadRulePreferences.mockReturnValue({});

    // Dynamically import store to get fresh instance
    const module = await import('../rulesStore');
    useRulesStore = module.useRulesStore;

    // Reset store to initial state
    act(() => {
      useRulesStore.getState().reset?.();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      // When: Get initial state
      const { result } = renderHook(() => useRulesStore());

      // Then: Should have default values
      expect(result.current.rules).toEqual([]);
      expect(result.current.categories).toEqual([]);
      expect(result.current.selectedCategory).toBeNull();
      expect(result.current.searchQuery).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filterOptions).toEqual({
        status: [],
        legend: [],
        fixable: null,
        ecosystem: [],
      });
    });
  });

  describe('loadData', () => {
    it('should load rules and categories from dataLoader', async () => {
      // Given: Mock data available
      const mockData = createMockEmbeddedData();
      loadRuffData.mockResolvedValue(mockData);

      // When: Load data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      // Then: Should populate rules and categories
      await waitFor(() => {
        expect(result.current.rules.length).toBeGreaterThan(0);
        expect(result.current.categories.length).toBeGreaterThan(0);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should set loading state during data fetch', async () => {
      // Given: Slow loading mock
      loadRuffData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(createMockEmbeddedData()), 100))
      );

      // When: Start loading
      const { result } = renderHook(() => useRulesStore());

      act(() => {
        result.current.loadData();
      });

      // Then: Should be in loading state
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle loading errors', async () => {
      // Given: Data loading fails
      loadRuffData.mockRejectedValue(new Error('Network error'));

      // When: Load data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      // Then: Should set error state
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should merge user settings when loading data', async () => {
      // Given: User has saved preferences
      const mockSettings: UserSettings = {
        ruleSettings: {
          E501: { enabled: false, ignoreReason: 'Too long', lastModified: '2024-01-01T00:00:00Z' },
        },
        viewMode: 'list',
        lastSelectedCategory: 'pycodestyle',
        customTemplates: [],
        version: '1.0.0',
      };
      loadUserSettings.mockReturnValue(mockSettings);

      // When: Load data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      // Then: Should apply user preferences
      await waitFor(() => {
        const e501Rule = result.current.rules.find((r: RuffRule) => r.code === 'E501');
        expect(e501Rule?.enabled).toBe(false);
        expect(e501Rule?.ignoreReason).toBe('Too long');
      });
    });

    it('should default all rules to enabled when no user settings', async () => {
      // Given: No user settings
      loadUserSettings.mockReturnValue(null);

      // When: Load data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      // Then: All rules should be enabled by default
      await waitFor(() => {
        const allEnabled = result.current.rules.every((r: RuffRule) => r.enabled === true);
        expect(allEnabled).toBe(true);
      });
    });
  });

  describe('toggleRule', () => {
    it('should toggle rule enabled state', async () => {
      // Given: Loaded data with enabled rule
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const ruleCode = result.current.rules[0]?.code;
      const initialState = result.current.rules[0]?.enabled;

      // When: Toggle rule
      act(() => {
        result.current.toggleRule(ruleCode);
      });

      // Then: Should toggle state
      const rule = result.current.rules.find((r: RuffRule) => r.code === ruleCode);
      expect(rule?.enabled).toBe(!initialState);
    });

    it('should save preference when toggling rule', async () => {
      // Given: Loaded data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const ruleCode = result.current.rules[0]?.code;

      // When: Toggle rule
      act(() => {
        result.current.toggleRule(ruleCode);
      });

      // Then: Should call saveRulePreference
      expect(saveRulePreference).toHaveBeenCalled();
    });

    it('should update category enabled counts', async () => {
      // Given: Loaded data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const rule = result.current.rules[0];
      const initialCategory = result.current.categories.find(
        (c: any) => c.id === rule?.category
      );
      const initialEnabledCount = initialCategory?.enabledCount;

      // When: Toggle rule off
      act(() => {
        result.current.toggleRule(rule?.code);
      });

      // Then: Category enabled count should decrease
      const updatedCategory = result.current.categories.find(
        (c: any) => c.id === rule?.category
      );
      expect(updatedCategory?.enabledCount).toBe(initialEnabledCount - 1);
    });
  });

  describe('setRuleEnabled', () => {
    it('should set rule enabled with reason', async () => {
      // Given: Loaded data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const ruleCode = result.current.rules[0]?.code;

      // When: Disable rule with reason
      act(() => {
        result.current.setRuleEnabled(ruleCode, false, 'Conflicts with formatter');
      });

      // Then: Should update rule state and reason
      const rule = result.current.rules.find((r: RuffRule) => r.code === ruleCode);
      expect(rule?.enabled).toBe(false);
      expect(rule?.ignoreReason).toBe('Conflicts with formatter');
    });

    it('should clear reason when enabling rule', async () => {
      // Given: Disabled rule with reason
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const ruleCode = result.current.rules[0]?.code;

      act(() => {
        result.current.setRuleEnabled(ruleCode, false, 'Test reason');
      });

      // When: Enable rule
      act(() => {
        result.current.setRuleEnabled(ruleCode, true);
      });

      // Then: Reason should be cleared
      const rule = result.current.rules.find((r: RuffRule) => r.code === ruleCode);
      expect(rule?.enabled).toBe(true);
      expect(rule?.ignoreReason).toBeUndefined();
    });
  });

  describe('setSelectedCategory', () => {
    it('should set selected category', async () => {
      // Given: Loaded data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const categoryId = result.current.categories[0]?.id;

      // When: Select category
      act(() => {
        result.current.setSelectedCategory(categoryId);
      });

      // Then: Should update selected category
      expect(result.current.selectedCategory).toBe(categoryId);
    });

    it('should allow clearing category selection with null', () => {
      // Given: Category selected
      const { result } = renderHook(() => useRulesStore());

      act(() => {
        result.current.setSelectedCategory('pycodestyle');
      });

      // When: Clear selection
      act(() => {
        result.current.setSelectedCategory(null);
      });

      // Then: Should be null
      expect(result.current.selectedCategory).toBeNull();
    });
  });

  describe('setSearchQuery', () => {
    it('should update search query', () => {
      // When: Set search query
      const { result } = renderHook(() => useRulesStore());

      act(() => {
        result.current.setSearchQuery('line too long');
      });

      // Then: Should update query
      expect(result.current.searchQuery).toBe('line too long');
    });

    it('should trim whitespace from query', () => {
      // When: Set query with whitespace
      const { result } = renderHook(() => useRulesStore());

      act(() => {
        result.current.setSearchQuery('  test  ');
      });

      // Then: Should trim whitespace
      expect(result.current.searchQuery).toBe('test');
    });
  });

  describe('setFilterOptions', () => {
    it('should update filter options', () => {
      // When: Set filters
      const { result } = renderHook(() => useRulesStore());

      const newFilters: FilterOptions = {
        status: ['disabled'],
        legend: ['stable'],
        fixable: true,
        ecosystem: ['fastapi'],
      };

      act(() => {
        result.current.setFilterOptions(newFilters);
      });

      // Then: Should update filters
      expect(result.current.filterOptions).toEqual(newFilters);
    });

    it('should allow partial filter updates', () => {
      // Given: Existing filters
      const { result } = renderHook(() => useRulesStore());

      act(() => {
        result.current.setFilterOptions({
          status: ['enabled'],
          legend: ['stable'],
          fixable: null,
          ecosystem: [],
        });
      });

      // When: Update only status filter
      act(() => {
        result.current.setFilterOptions({
          ...result.current.filterOptions,
          status: ['disabled'],
        });
      });

      // Then: Should update only status
      expect(result.current.filterOptions.status).toEqual(['disabled']);
      expect(result.current.filterOptions.legend).toEqual(['stable']);
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to default', () => {
      // Given: Filters set
      const { result } = renderHook(() => useRulesStore());

      act(() => {
        result.current.setFilterOptions({
          status: ['disabled'],
          legend: ['preview'],
          fixable: true,
          ecosystem: ['fastapi'],
        });
        result.current.setSearchQuery('test');
        result.current.setSelectedCategory('pycodestyle');
      });

      // When: Reset filters
      act(() => {
        result.current.resetFilters();
      });

      // Then: Should reset to defaults
      expect(result.current.filterOptions).toEqual({
        status: [],
        legend: [],
        fixable: null,
        ecosystem: [],
      });
      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedCategory).toBeNull();
    });
  });

  describe('toggleCategory', () => {
    it('should enable all rules in category', async () => {
      // Given: Loaded data with some disabled rules
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const categoryId = result.current.categories[0]?.id;

      // Disable some rules in this category
      const rulesInCategory = result.current.rules.filter((r: RuffRule) => r.category === categoryId);
      act(() => {
        result.current.setRuleEnabled(rulesInCategory[0]?.code, false);
      });

      // When: Enable category
      act(() => {
        result.current.toggleCategory(categoryId, true);
      });

      // Then: All rules in category should be enabled
      const updatedRules = result.current.rules.filter((r: RuffRule) => r.category === categoryId);
      const allEnabled = updatedRules.every((r: RuffRule) => r.enabled);
      expect(allEnabled).toBe(true);
    });

    it('should disable all rules in category', async () => {
      // Given: Loaded data with enabled rules
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const categoryId = result.current.categories[0]?.id;

      // When: Disable category
      act(() => {
        result.current.toggleCategory(categoryId, false);
      });

      // Then: All rules in category should be disabled
      const rulesInCategory = result.current.rules.filter((r: RuffRule) => r.category === categoryId);
      const allDisabled = rulesInCategory.every((r: RuffRule) => !r.enabled);
      expect(allDisabled).toBe(true);
    });
  });

  describe('getFilteredRules', () => {
    it('should return all rules when no filters applied', async () => {
      // Given: Loaded data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      // When: Get filtered rules
      const filtered = result.current.getFilteredRules();

      // Then: Should return all rules
      expect(filtered.length).toBe(result.current.rules.length);
    });

    it('should filter by category', async () => {
      // Given: Loaded data with category selected
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const categoryId = result.current.categories[0]?.id;

      act(() => {
        result.current.setSelectedCategory(categoryId);
      });

      // When: Get filtered rules
      const filtered = result.current.getFilteredRules();

      // Then: Should return only rules from selected category
      const allInCategory = filtered.every((r: RuffRule) => r.category === categoryId);
      expect(allInCategory).toBe(true);
    });

    it('should filter by search query', async () => {
      // Given: Loaded data with search query
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      act(() => {
        result.current.setSearchQuery('import');
      });

      // When: Get filtered rules
      const filtered = result.current.getFilteredRules();

      // Then: Should return rules matching query
      const allMatch = filtered.every((r: RuffRule) =>
        r.code.toLowerCase().includes('import') ||
        r.name.toLowerCase().includes('import') ||
        r.description.toLowerCase().includes('import')
      );
      expect(allMatch).toBe(true);
    });

    it('should filter by enabled status', async () => {
      // Given: Data with some disabled rules
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      act(() => {
        result.current.toggleRule(result.current.rules[0]?.code);
        result.current.setFilterOptions({
          ...result.current.filterOptions,
          status: ['disabled'],
        });
      });

      // When: Get filtered rules
      const filtered = result.current.getFilteredRules();

      // Then: Should return only disabled rules
      const allDisabled = filtered.every((r: RuffRule) => !r.enabled);
      expect(allDisabled).toBe(true);
    });

    it('should filter by fixable status', async () => {
      // Given: Loaded data
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      act(() => {
        result.current.setFilterOptions({
          ...result.current.filterOptions,
          fixable: true,
        });
      });

      // When: Get filtered rules
      const filtered = result.current.getFilteredRules();

      // Then: Should return only fixable rules
      const allFixable = filtered.every((r: RuffRule) => r.legendInfo.fixable);
      expect(allFixable).toBe(true);
    });

    it('should combine multiple filters', async () => {
      // Given: Multiple filters applied
      const { result } = renderHook(() => useRulesStore());

      await act(async () => {
        await result.current.loadData();
      });

      const categoryId = result.current.categories[0]?.id;

      act(() => {
        result.current.setSelectedCategory(categoryId);
        result.current.setSearchQuery('line');
        result.current.setFilterOptions({
          ...result.current.filterOptions,
          legend: ['stable'],
        });
      });

      // When: Get filtered rules
      const filtered = result.current.getFilteredRules();

      // Then: Should match all filters
      const allMatch = filtered.every((r: RuffRule) =>
        r.category === categoryId &&
        (r.code.toLowerCase().includes('line') ||
         r.name.toLowerCase().includes('line') ||
         r.description.toLowerCase().includes('line')) &&
        r.legendInfo.status === 'stable'
      );
      expect(allMatch).toBe(true);
    });
  });
});
