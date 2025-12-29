/**
 * Tests for storageManager service
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { UserSettings } from '@/types/configTypes';

describe('storageManager', () => {
  let saveUserSettings: (settings: UserSettings) => void;
  let loadUserSettings: () => UserSettings | null;
  let clearUserSettings: () => void;
  let saveRulePreference: (ruleCode: string, enabled: boolean, reason?: string) => void;
  let loadRulePreferences: () => Record<string, { enabled: boolean; ignoreReason?: string; lastModified: string }>;

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear();

    // Dynamically import to ensure clean state
    const module = await import('../storageManager');
    saveUserSettings = module.saveUserSettings;
    loadUserSettings = module.loadUserSettings;
    clearUserSettings = module.clearUserSettings;
    saveRulePreference = module.saveRulePreference;
    loadRulePreferences = module.loadRulePreferences;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveUserSettings', () => {
    it('should save user settings to localStorage', () => {
      // Given: User settings
      const settings: UserSettings = {
        ruleSettings: {
          E501: { enabled: false, ignoreReason: 'Line too long', lastModified: '2024-01-01T00:00:00.000Z' },
        },
        viewMode: 'list',
        lastSelectedCategory: 'pycodestyle',
        customTemplates: [],
        version: '1.0.0',
      };

      // When: Save settings
      saveUserSettings(settings);

      // Then: Should be in localStorage
      const stored = localStorage.getItem('ruffmate_user_settings');
      expect(stored).toBeDefined();
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored as string);
      expect(parsed.viewMode).toBe('list');
      expect(parsed.lastSelectedCategory).toBe('pycodestyle');
    });

    it('should overwrite existing settings', () => {
      // Given: Existing settings
      const oldSettings: UserSettings = {
        ruleSettings: {},
        viewMode: 'grid',
        lastSelectedCategory: null,
        customTemplates: [],
        version: '1.0.0',
      };
      saveUserSettings(oldSettings);

      // When: Save new settings
      const newSettings: UserSettings = {
        ruleSettings: {},
        viewMode: 'list',
        lastSelectedCategory: 'pyflakes',
        customTemplates: [],
        version: '1.0.0',
      };
      saveUserSettings(newSettings);

      // Then: Should have new settings
      const loaded = loadUserSettings();
      expect(loaded?.viewMode).toBe('list');
      expect(loaded?.lastSelectedCategory).toBe('pyflakes');
    });
  });

  describe('loadUserSettings', () => {
    it('should load user settings from localStorage', () => {
      // Given: Saved settings
      const settings: UserSettings = {
        ruleSettings: {
          E501: { enabled: false, ignoreReason: 'Test', lastModified: '2024-01-01T00:00:00.000Z' },
        },
        viewMode: 'detailed',
        lastSelectedCategory: 'ruff',
        customTemplates: [],
        version: '1.0.0',
      };
      saveUserSettings(settings);

      // When: Load settings
      const loaded = loadUserSettings();

      // Then: Should return saved settings
      expect(loaded).toBeDefined();
      expect(loaded?.viewMode).toBe('detailed');
      expect(loaded?.lastSelectedCategory).toBe('ruff');
      expect(loaded?.ruleSettings['E501']).toBeDefined();
    });

    it('should return null when no settings exist', () => {
      // Given: No saved settings
      // When: Load settings
      const loaded = loadUserSettings();

      // Then: Should return null
      expect(loaded).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      // Given: Invalid JSON in localStorage
      localStorage.setItem('ruffmate_user_settings', 'invalid json');

      // When: Load settings
      const loaded = loadUserSettings();

      // Then: Should return null
      expect(loaded).toBeNull();
    });
  });

  describe('clearUserSettings', () => {
    it('should remove user settings from localStorage', () => {
      // Given: Saved settings
      const settings: UserSettings = {
        ruleSettings: {},
        viewMode: 'list',
        lastSelectedCategory: null,
        customTemplates: [],
        version: '1.0.0',
      };
      saveUserSettings(settings);

      // When: Clear settings
      clearUserSettings();

      // Then: Should be removed
      const stored = localStorage.getItem('ruffmate_user_settings');
      expect(stored).toBeNull();
    });

    it('should not throw error when no settings exist', () => {
      // Given: No saved settings
      // When & Then: Should not throw
      expect(() => clearUserSettings()).not.toThrow();
    });
  });

  describe('saveRulePreference', () => {
    it('should save individual rule preference', () => {
      // Given: No existing preferences
      // When: Save rule preference
      saveRulePreference('E501', false, 'Line too long');

      // Then: Should be saved
      const prefs = loadRulePreferences();
      expect(prefs['E501']).toBeDefined();
      expect(prefs['E501']?.enabled).toBe(false);
      expect(prefs['E501']?.ignoreReason).toBe('Line too long');
      expect(prefs['E501']?.lastModified).toBeDefined();
    });

    it('should save rule without reason', () => {
      // When: Save without reason
      saveRulePreference('F401', false);

      // Then: Should save without ignoreReason
      const prefs = loadRulePreferences();
      expect(prefs['F401']).toBeDefined();
      expect(prefs['F401']?.enabled).toBe(false);
      expect(prefs['F401']?.ignoreReason).toBeUndefined();
    });

    it('should update existing rule preference', () => {
      // Given: Existing preference
      saveRulePreference('E501', false, 'Old reason');

      // When: Update preference
      saveRulePreference('E501', true, 'New reason');

      // Then: Should be updated
      const prefs = loadRulePreferences();
      expect(prefs['E501']?.enabled).toBe(true);
      expect(prefs['E501']?.ignoreReason).toBe('New reason');
    });

    it('should preserve other rule preferences when updating one', () => {
      // Given: Multiple preferences
      saveRulePreference('E501', false, 'Reason 1');
      saveRulePreference('W503', false, 'Reason 2');

      // When: Update one
      saveRulePreference('E501', true);

      // Then: Should preserve W503
      const prefs = loadRulePreferences();
      expect(prefs['E501']?.enabled).toBe(true);
      expect(prefs['W503']?.enabled).toBe(false);
      expect(prefs['W503']?.ignoreReason).toBe('Reason 2');
    });

    it('should set lastModified timestamp', () => {
      // Given: Current time
      const beforeTime = new Date().toISOString();

      // When: Save preference
      saveRulePreference('E501', false);

      // Then: Should have recent timestamp
      const prefs = loadRulePreferences();
      const afterTime = new Date().toISOString();

      expect(prefs['E501']?.lastModified).toBeDefined();
      const timestamp = prefs['E501']?.lastModified as string;
      expect(timestamp >= beforeTime).toBe(true);
      expect(timestamp <= afterTime).toBe(true);
    });
  });

  describe('loadRulePreferences', () => {
    it('should load all rule preferences', () => {
      // Given: Multiple preferences
      saveRulePreference('E501', false, 'Reason 1');
      saveRulePreference('W503', true);

      // When: Load preferences
      const prefs = loadRulePreferences();

      // Then: Should load all
      expect(Object.keys(prefs).length).toBe(2);
      expect(prefs['E501']).toBeDefined();
      expect(prefs['W503']).toBeDefined();
    });

    it('should return empty object when no preferences exist', () => {
      // Given: No preferences
      // When: Load preferences
      const prefs = loadRulePreferences();

      // Then: Should return empty object
      expect(prefs).toEqual({});
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Given: Corrupted data
      localStorage.setItem('ruffmate_rule_preferences', 'not valid json');

      // When: Load preferences
      const prefs = loadRulePreferences();

      // Then: Should return empty object
      expect(prefs).toEqual({});
    });
  });

  describe('localStorage integration', () => {
    it('should persist data across service calls', () => {
      // Given: Save data
      saveRulePreference('E501', false, 'Test reason');

      // When: Create new instance by re-importing
      const prefs = loadRulePreferences();

      // Then: Data should persist
      expect(prefs['E501']?.enabled).toBe(false);
      expect(prefs['E501']?.ignoreReason).toBe('Test reason');
    });

    it('should handle special characters in rule codes', () => {
      // Given: Rule codes with special characters
      const specialCode = 'RUF-001';

      // When: Save and load
      saveRulePreference(specialCode, false);
      const prefs = loadRulePreferences();

      // Then: Should handle correctly
      expect(prefs[specialCode]).toBeDefined();
    });
  });
});
