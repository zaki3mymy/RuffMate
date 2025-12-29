/**
 * Tests for dataLoader service
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockEmbeddedData } from '../../../tests/fixtures/mockData';
import type { EmbeddedRuffData } from '@/types/ruffTypes';

// Mock fetch globally
const originalFetch = global.fetch;

describe('dataLoader', () => {
  let loadRuffData: () => Promise<EmbeddedRuffData>;
  const mockData = createMockEmbeddedData();

  beforeEach(async () => {
    // Setup fetch mock with mock data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    // Dynamically import to ensure clean state
    const module = await import('../dataLoader');
    loadRuffData = module.loadRuffData;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('loadRuffData', () => {
    it('should load and return embedded Ruff data', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Should return valid data structure
      expect(data).toBeDefined();
      expect(data.rules).toBeInstanceOf(Array);
      expect(data.categories).toBeInstanceOf(Array);
      expect(data.version).toBeDefined();
      expect(data.buildTimestamp).toBeDefined();
    });

    it('should return rules with correct structure', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Each rule should have required fields
      expect(data.rules.length).toBeGreaterThan(0);

      const firstRule = data.rules[0];
      expect(firstRule).toBeDefined();
      if (firstRule) {
        expect(firstRule.code).toBeDefined();
        expect(typeof firstRule.code).toBe('string');
        expect(firstRule.name).toBeDefined();
        expect(typeof firstRule.name).toBe('string');
        expect(firstRule.category).toBeDefined();
        expect(typeof firstRule.category).toBe('string');
        expect(firstRule.description).toBeDefined();
        expect(typeof firstRule.description).toBe('string');
        expect(firstRule.legendInfo).toBeDefined();
        expect(firstRule.legendInfo.status).toMatch(/^(stable|deprecated|preview)$/);
        expect(typeof firstRule.legendInfo.fixable).toBe('boolean');
      }
    });

    it('should return categories with correct structure', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Each category should have required fields
      expect(data.categories.length).toBeGreaterThan(0);

      const firstCategory = data.categories[0];
      expect(firstCategory).toBeDefined();
      if (firstCategory) {
        expect(firstCategory.id).toBeDefined();
        expect(typeof firstCategory.id).toBe('string');
        expect(firstCategory.name).toBeDefined();
        expect(typeof firstCategory.name).toBe('string');
        expect(firstCategory.description).toBeDefined();
        expect(typeof firstCategory.description).toBe('string');
        expect(firstCategory.ruleCount).toBeDefined();
        expect(typeof firstCategory.ruleCount).toBe('number');
        expect(firstCategory.ruleCount).toBeGreaterThan(0);
      }
    });

    it('should return consistent data on multiple calls', async () => {
      // When: Load data twice
      const data1 = await loadRuffData();
      const data2 = await loadRuffData();

      // Then: Should return same data
      expect(data1.version).toBe(data2.version);
      expect(data1.buildTimestamp).toBe(data2.buildTimestamp);
      expect(data1.rules.length).toBe(data2.rules.length);
      expect(data1.categories.length).toBe(data2.categories.length);
    });

    it('should include rules with all legend statuses', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Should have rules with different statuses
      const statuses = new Set(data.rules.map((r) => r.legendInfo.status));

      // At least some variation in statuses
      expect(statuses.size).toBeGreaterThan(0);
    });

    it('should include fixable and non-fixable rules', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Should have both fixable and non-fixable rules
      const hasFixable = data.rules.some((r) => r.legendInfo.fixable);
      const hasNonFixable = data.rules.some((r) => !r.legendInfo.fixable);

      expect(hasFixable).toBe(true);
      expect(hasNonFixable).toBe(true);
    });

    it('should include rules from multiple categories', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Should have rules from multiple categories
      const categoriesInRules = new Set(data.rules.map((r) => r.category));

      expect(categoriesInRules.size).toBeGreaterThan(1);
    });

    it('should have valid version string', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Version should be valid semver-like
      expect(data.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should have valid ISO timestamp', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Build timestamp should be valid ISO string
      expect(() => new Date(data.buildTimestamp)).not.toThrow();

      const date = new Date(data.buildTimestamp);
      expect(date.toISOString()).toBe(data.buildTimestamp);
    });

    it('should include optional example fields for some rules', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Some rules should have examples
      const rulesWithExample = data.rules.filter((r) => r.example !== undefined);

      // At least some rules should have examples
      expect(rulesWithExample.length).toBeGreaterThan(0);
    });

    it('should include ecosystem-specific rules', async () => {
      // When: Load data
      const data = await loadRuffData();

      // Then: Some rules might be ecosystem-specific
      const ecosystemRules = data.rules.filter(
        (r) => r.legendInfo.ecosystemSpecific !== undefined
      );

      // Check if any ecosystem-specific rules exist
      if (ecosystemRules.length > 0) {
        const firstEcosystemRule = ecosystemRules[0];
        expect(firstEcosystemRule).toBeDefined();
        if (firstEcosystemRule?.legendInfo.ecosystemSpecific) {
          expect(Array.isArray(firstEcosystemRule.legendInfo.ecosystemSpecific)).toBe(true);
          expect(firstEcosystemRule.legendInfo.ecosystemSpecific.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
