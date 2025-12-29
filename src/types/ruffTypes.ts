/**
 * Core type definitions for Ruff rule management
 */

/**
 * Legend status types from official Ruff documentation
 */
export type LegendStatus = 'stable' | 'deprecated' | 'preview';

/**
 * Legend information metadata
 */
export interface LegendInfo {
  /** Rule status (stable, deprecated, or preview) */
  status: LegendStatus;
  /** Whether the rule has auto-fix capability */
  fixable: boolean;
  /** Ecosystem-specific rules (e.g., FastAPI, Airflow) */
  ecosystemSpecific?: string[];
}

/**
 * Core Ruff Rule interface
 */
export interface RuffRule {
  /** Rule code (e.g., "E501", "F401") */
  code: string;
  /** Rule name */
  name: string;
  /** Rule category (e.g., "pycodestyle", "pyflakes") */
  category: string;
  /** Rule description */
  description: string;
  /** Code example showing the violation (optional) */
  example?: string;
  /** Fixed code example (optional) */
  fixedExample?: string;
  /** User preference: whether the rule is enabled */
  enabled: boolean;
  /** Reason for ignoring the rule (when disabled) */
  ignoreReason?: string;
  /** Official metadata from Ruff documentation */
  legendInfo: LegendInfo;
  /** UI state: whether details are expanded (optional) */
  isExpanded?: boolean;
  /** Last modification timestamp (optional) */
  lastModified?: Date;
}

/**
 * Category management interface
 */
export interface RuffCategory {
  /** Internal identifier (e.g., "pycodestyle") */
  id: string;
  /** Display name (e.g., "Python Code Style") */
  name: string;
  /** Category description */
  description: string;
  /** Total number of rules in this category */
  ruleCount: number;
  /** Number of enabled rules in this category */
  enabledCount: number;
  /** Whether the entire category is enabled */
  enabled: boolean;
}

/**
 * Filter options for rule display
 */
export interface FilterOptions {
  /** Filter by enabled/disabled status */
  status: ('enabled' | 'disabled')[];
  /** Filter by legend status */
  legend: LegendStatus[];
  /** Filter by fixable status (null = no filter) */
  fixable: boolean | null;
  /** Filter by ecosystem */
  ecosystem: string[];
}

/**
 * View mode for rule display
 */
export type ViewMode = 'grid' | 'list' | 'detailed';

/**
 * Application state interface
 */
export interface AppState {
  /** All rules data */
  rules: RuffRule[];
  /** All categories data */
  categories: RuffCategory[];
  /** Currently selected category (null = all) */
  selectedCategory: string | null;
  /** Search query string */
  searchQuery: string;
  /** Filter options */
  filterOptions: FilterOptions;
  /** View mode for displaying rules */
  viewMode: ViewMode;
  /** Timestamp of last data update */
  lastUpdated: Date;
  /** Ruff version for the embedded data */
  ruffVersion: string;
  /** Loading state */
  isLoading: boolean;
  /** Error message (null if no error) */
  error: string | null;
}

/**
 * Embedded static data structure
 */
export interface EmbeddedRuffData {
  /** All rules from Ruff documentation */
  rules: Omit<RuffRule, 'enabled' | 'ignoreReason' | 'isExpanded' | 'lastModified'>[];
  /** Categories derived from rules */
  categories: Omit<RuffCategory, 'enabledCount' | 'enabled'>[];
  /** Ruff version */
  version: string;
  /** Build timestamp */
  buildTimestamp: string;
}
