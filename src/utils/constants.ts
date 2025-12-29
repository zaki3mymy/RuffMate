/**
 * Application-wide constants
 */

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  USER_SETTINGS: 'ruffmate_user_settings',
  RULE_PREFERENCES: 'ruffmate_rule_preferences',
  VIEW_MODE: 'ruffmate_view_mode',
  LAST_CATEGORY: 'ruffmate_last_category',
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  VIEW_MODE: 'list' as const,
  SEARCH_DEBOUNCE_MS: 200,
  VIRTUAL_SCROLL_ITEM_SIZE: 80,
  SETTINGS_VERSION: '1.0.0',
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  BREAKPOINTS: {
    MOBILE: 600,
    TABLET: 960,
    DESKTOP: 1280,
  },
  MAX_CONTENT_WIDTH: 1440,
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  MIN_SEARCH_LENGTH: 1,
  MAX_COMMENT_LENGTH: 500,
  MAX_TEMPLATE_NAME_LENGTH: 100,
} as const;

/**
 * Build-time configuration
 */
export const BUILD_CONFIG = {
  RUFF_DOCS_URL: 'https://docs.astral.sh/ruff/rules/',
  DATA_FILE_PATH: '/data/ruff-rules.json',
  FETCH_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
} as const;

/**
 * Application metadata
 */
export const APP_METADATA = {
  NAME: 'RuffMate',
  DESCRIPTION: 'Ruff Configuration Manager',
  VERSION: '0.1.0',
  AUTHOR: 'RuffMate Team',
  REPOSITORY: 'https://github.com/ruffmate/ruffmate',
} as const;
