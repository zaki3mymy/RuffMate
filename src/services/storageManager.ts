/**
 * Storage manager service for LocalStorage operations
 * Handles user settings and rule preferences persistence
 */

import { STORAGE_KEYS } from '@/utils/constants';
import type { UserSettings } from '@/types/configTypes';

/**
 * Rule preference structure for storage
 */
interface RulePreference {
  enabled: boolean;
  ignoreReason?: string;
  lastModified: string;
}

/**
 * Save complete user settings to LocalStorage
 *
 * @param settings - User settings to save
 */
export function saveUserSettings(settings: UserSettings): void {
  try {
    const json = JSON.stringify(settings);
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, json);
  } catch (error) {
    console.error('Failed to save user settings:', error);
  }
}

/**
 * Load complete user settings from LocalStorage
 *
 * @returns User settings or null if not found/invalid
 */
export function loadUserSettings(): UserSettings | null {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!json) {
      return null;
    }

    const settings = JSON.parse(json) as UserSettings;
    return settings;
  } catch (error) {
    console.error('Failed to load user settings:', error);
    return null;
  }
}

/**
 * Clear all user settings from LocalStorage
 */
export function clearUserSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
  } catch (error) {
    console.error('Failed to clear user settings:', error);
  }
}

/**
 * Save individual rule preference
 *
 * @param ruleCode - Rule code (e.g., "E501")
 * @param enabled - Whether the rule is enabled
 * @param reason - Optional reason for disabling
 */
export function saveRulePreference(
  ruleCode: string,
  enabled: boolean,
  reason?: string,
): void {
  try {
    // Load existing preferences
    const prefs = loadRulePreferences();

    // Update preference
    const preference: RulePreference = {
      enabled,
      lastModified: new Date().toISOString(),
    };

    // Only add ignoreReason if it's defined
    if (reason !== undefined) {
      preference.ignoreReason = reason;
    }

    prefs[ruleCode] = preference;

    // Save back to localStorage
    const json = JSON.stringify(prefs);
    localStorage.setItem(STORAGE_KEYS.RULE_PREFERENCES, json);
  } catch (error) {
    console.error('Failed to save rule preference:', error);
  }
}

/**
 * Load all rule preferences from LocalStorage
 *
 * @returns Record of rule code to preference, or empty object if none
 */
export function loadRulePreferences(): Record<string, RulePreference> {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.RULE_PREFERENCES);
    if (!json) {
      return {};
    }

    const prefs = JSON.parse(json) as Record<string, RulePreference>;
    return prefs;
  } catch (error) {
    console.error('Failed to load rule preferences:', error);
    return {};
  }
}
