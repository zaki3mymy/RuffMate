/**
 * Data loader service for embedded Ruff rules data
 * Loads static JSON data embedded at build time
 */

import type { EmbeddedRuffData } from '@/types/ruffTypes';

/**
 * Load embedded Ruff rules data from static JSON file
 * This file is generated at build time by the build scripts
 *
 * @returns Promise resolving to embedded Ruff data
 * @throws Error if data cannot be loaded or is invalid
 */
export async function loadRuffData(): Promise<EmbeddedRuffData> {
  try {
    // Fetch static JSON file from public directory
    const response = await fetch('/data/ruff-rules.json');

    if (!response.ok) {
      throw new Error(
        `Failed to load Ruff data: HTTP ${response.status} ${response.statusText}`,
      );
    }

    const data: unknown = await response.json();

    // Basic validation
    if (!isValidEmbeddedData(data)) {
      throw new Error('Invalid Ruff data structure');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error loading Ruff data:', error.message);
      throw error;
    }
    throw new Error('Unknown error loading Ruff data');
  }
}

/**
 * Type guard to validate embedded data structure
 */
function isValidEmbeddedData(data: unknown): data is EmbeddedRuffData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check required top-level fields
  if (!Array.isArray(obj.rules)) return false;
  if (!Array.isArray(obj.categories)) return false;
  if (typeof obj.version !== 'string') return false;
  if (typeof obj.buildTimestamp !== 'string') return false;

  // Validate at least one rule exists
  if (obj.rules.length === 0) return false;

  // Validate first rule structure (sample check)
  const firstRule = obj.rules[0] as Record<string, unknown>;
  if (typeof firstRule.code !== 'string') return false;
  if (typeof firstRule.name !== 'string') return false;
  if (typeof firstRule.category !== 'string') return false;
  if (typeof firstRule.description !== 'string') return false;
  if (typeof firstRule.legendInfo !== 'object' || firstRule.legendInfo === null)
    return false;

  return true;
}
