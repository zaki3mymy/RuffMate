/**
 * Type definitions for configuration generation and management
 */

import type { RuffRule } from './ruffTypes';

/**
 * pyproject.toml configuration structure
 */
export interface PyprojectTomlConfig {
  /** Generated TOML content */
  content: string;
  /** Number of ignored rules */
  ignoredRulesCount: number;
  /** Timestamp of generation */
  generatedAt: Date;
}

/**
 * Configuration export options
 */
export interface ExportOptions {
  /** Include comments for ignored rules */
  includeComments: boolean;
  /** Sort ignored rules alphabetically */
  sortIgnored: boolean;
  /** Include metadata in comments */
  includeMetadata: boolean;
}

/**
 * Configuration template
 */
export interface ConfigTemplate {
  /** Template unique identifier */
  id: string;
  /** Template display name */
  name: string;
  /** Template description */
  description: string;
  /** Template category (e.g., "web", "data-analysis") */
  category: string;
  /** Rule codes to enable */
  enabledRules: string[];
  /** Rule codes to disable with reasons */
  disabledRules: Array<{
    code: string;
    reason: string;
  }>;
  /** Template author (optional) */
  author?: string;
  /** Template creation date (optional) */
  createdAt?: Date;
}

/**
 * Import result from pyproject.toml
 */
export interface ImportResult {
  /** Successfully imported rules */
  importedRules: RuffRule[];
  /** Rules that failed to import */
  failedRules: string[];
  /** Warnings during import */
  warnings: string[];
  /** Success status */
  success: boolean;
}

/**
 * User settings stored in LocalStorage
 */
export interface UserSettings {
  /** Rule-specific user preferences */
  ruleSettings: Record<
    string,
    {
      enabled: boolean;
      ignoreReason?: string;
      lastModified: string;
    }
  >;
  /** View preferences */
  viewMode: 'grid' | 'list' | 'detailed';
  /** Last selected category */
  lastSelectedCategory: string | null;
  /** User's custom templates */
  customTemplates: ConfigTemplate[];
  /** Settings version for migration */
  version: string;
}

/**
 * Validation result for configuration
 */
export interface ValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Affected rule code (if applicable) */
  ruleCode?: string;
  /** Line number in config (if applicable) */
  line?: number;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Affected rule code (if applicable) */
  ruleCode?: string;
}
