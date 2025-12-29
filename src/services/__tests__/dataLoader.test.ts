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

  describe('Error handling', () => {
    it('should throw error when fetch fails with network error', async () => {
      // Given: Fetch returns network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      // When & Then: Should throw error
      await expect(loadRuffData()).rejects.toThrow('Network error');
    });

    it('should throw error with HTTP status details on non-200 response', async () => {
      // Given: Fetch returns 404
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      // When & Then: Should throw detailed error
      await expect(loadRuffData()).rejects.toThrow(
        'Failed to load Ruff data: HTTP 404 Not Found',
      );
    });

    it('should throw error when JSON is invalid', async () => {
      // Given: Fetch returns invalid JSON
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response);

      // When & Then: Should throw error
      await expect(loadRuffData()).rejects.toThrow();
    });

    it('should throw error when data is not an object', async () => {
      // Given: Fetch returns non-object data
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue('not an object'),
      } as unknown as Response);

      // When & Then: Should throw validation error
      await expect(loadRuffData()).rejects.toThrow('Invalid Ruff data structure');
    });

    it('should throw error when data is null', async () => {
      // Given: Fetch returns null
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(null),
      } as unknown as Response);

      // When & Then: Should throw validation error
      await expect(loadRuffData()).rejects.toThrow('Invalid Ruff data structure');
    });

    it('should throw error when rules array is missing', async () => {
      // Given: Data without rules array
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          categories: [],
          version: '1.0.0',
          buildTimestamp: '2024-01-01T00:00:00Z',
        }),
      } as unknown as Response);

      // When & Then: Should throw validation error
      await expect(loadRuffData()).rejects.toThrow('Invalid Ruff data structure');
    });

    it('should throw error when categories array is missing', async () => {
      // Given: Data without categories array
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          rules: [],
          version: '1.0.0',
          buildTimestamp: '2024-01-01T00:00:00Z',
        }),
      } as unknown as Response);

      // When & Then: Should throw validation error
      await expect(loadRuffData()).rejects.toThrow('Invalid Ruff data structure');
    });

    it('should throw error when version is missing', async () => {
      // Given: Data without version
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          rules: [],
          categories: [],
          buildTimestamp: '2024-01-01T00:00:00Z',
        }),
      } as unknown as Response);

      // When & Then: Should throw validation error
      await expect(loadRuffData()).rejects.toThrow('Invalid Ruff data structure');
    });

    it('should throw error when rules array is empty', async () => {
      // Given: Data with empty rules array
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          rules: [],
          categories: [],
          version: '1.0.0',
          buildTimestamp: '2024-01-01T00:00:00Z',
        }),
      } as unknown as Response);

      // When & Then: Should throw validation error
      await expect(loadRuffData()).rejects.toThrow('Invalid Ruff data structure');
    });

    it('should throw error when rule is missing required fields', async () => {
      // Given: Rule without required fields
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          rules: [{ code: 'E501' }], // Missing other required fields
          categories: [],
          version: '1.0.0',
          buildTimestamp: '2024-01-01T00:00:00Z',
        }),
      } as unknown as Response);

      // When & Then: Should throw validation error
      await expect(loadRuffData()).rejects.toThrow('Invalid Ruff data structure');
    });

    it('should handle non-Error exceptions', async () => {
      // Given: Fetch throws non-Error exception
      global.fetch = vi.fn().mockRejectedValue('String error');

      // When & Then: Should throw generic error
      await expect(loadRuffData()).rejects.toThrow('Unknown error loading Ruff data');
    });
  });
});
