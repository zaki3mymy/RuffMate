/**
 * Build script to validate Ruff data structure
 * TypeScript implementation for complete type safety
 */

import type { RuffData, RuffRule, RuffCategory } from '../src/types/ruffTypes';

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
}

/**
 * Validate a single rule
 */
function validateRule(rule: RuffRule, index: number): string[] {
  const errors: string[] = [];

  // Required fields
  if (!rule.code || typeof rule.code !== 'string') {
    errors.push(`Rule ${index}: missing or invalid 'code' field`);
  }

  if (!rule.name || typeof rule.name !== 'string') {
    errors.push(`Rule ${index}: missing or invalid 'name' field`);
  }

  if (!rule.category || typeof rule.category !== 'string') {
    errors.push(`Rule ${index}: missing or invalid 'category' field`);
  }

  if (!rule.description || typeof rule.description !== 'string') {
    errors.push(`Rule ${index}: missing or invalid 'description' field`);
  }

  // LegendInfo validation
  if (!rule.legendInfo || typeof rule.legendInfo !== 'object') {
    errors.push(`Rule ${index}: missing or invalid 'legendInfo' field`);
  } else {
    const validStatuses = ['stable', 'preview', 'deprecated'];
    if (!validStatuses.includes(rule.legendInfo.status)) {
      errors.push(
        `Rule ${index}: invalid legendInfo.status '${rule.legendInfo.status}'`,
      );
    }

    if (typeof rule.legendInfo.fixable !== 'boolean') {
      errors.push(`Rule ${index}: legendInfo.fixable must be a boolean`);
    }
  }

  return errors;
}

/**
 * Validate a single category
 */
function validateCategory(category: RuffCategory, index: number): string[] {
  const errors: string[] = [];

  if (!category.id || typeof category.id !== 'string') {
    errors.push(`Category ${index}: missing or invalid 'id' field`);
  }

  if (!category.name || typeof category.name !== 'string') {
    errors.push(`Category ${index}: missing or invalid 'name' field`);
  }

  if (typeof category.ruleCount !== 'number' || category.ruleCount < 0) {
    errors.push(`Category ${index}: invalid 'ruleCount' field`);
  }

  return errors;
}

/**
 * Validate Ruff data structure
 */
export function validateData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Data is not an object'],
      warnings: [],
    };
  }

  const ruffData = data as Partial<RuffData>;

  // Validate top-level structure
  if (!ruffData.rules || !Array.isArray(ruffData.rules)) {
    errors.push('Missing or invalid "rules" array');
  }

  if (!ruffData.categories || !Array.isArray(ruffData.categories)) {
    errors.push('Missing or invalid "categories" array');
  }

  if (!ruffData.version || typeof ruffData.version !== 'string') {
    errors.push('Missing or invalid "version" field');
  }

  if (
    !ruffData.buildTimestamp ||
    typeof ruffData.buildTimestamp !== 'string'
  ) {
    errors.push('Missing or invalid "buildTimestamp" field');
  }

  // If top-level validation failed, return early
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Validate each rule
  if (ruffData.rules) {
    ruffData.rules.forEach((rule, index) => {
      const ruleErrors = validateRule(rule, index);
      errors.push(...ruleErrors);
    });

    // Check for duplicate rule codes
    const ruleCodes = new Set<string>();
    ruffData.rules.forEach((rule) => {
      if (ruleCodes.has(rule.code)) {
        errors.push(`Duplicate rule code: ${rule.code}`);
      }
      ruleCodes.add(rule.code);
    });

    // Warn if no rules
    if (ruffData.rules.length === 0) {
      warnings.push('No rules found in data');
    }
  }

  // Validate each category
  if (ruffData.categories) {
    ruffData.categories.forEach((category, index) => {
      const categoryErrors = validateCategory(category, index);
      errors.push(...categoryErrors);
    });

    // Check for duplicate category IDs
    const categoryIds = new Set<string>();
    ruffData.categories.forEach((category) => {
      if (categoryIds.has(category.id)) {
        errors.push(`Duplicate category ID: ${category.id}`);
      }
      categoryIds.add(category.id);
    });

    // Validate category rule counts match actual rules
    if (ruffData.rules) {
      const actualCounts = new Map<string, number>();
      ruffData.rules.forEach((rule) => {
        actualCounts.set(rule.category, (actualCounts.get(rule.category) ?? 0) + 1);
      });

      ruffData.categories.forEach((category) => {
        const actualCount = actualCounts.get(category.id) ?? 0;
        if (category.ruleCount !== actualCount) {
          warnings.push(
            `Category "${category.id}" ruleCount mismatch: expected ${actualCount}, got ${category.ruleCount}`,
          );
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
