/**
 * Mock data for testing
 */

import type {
  RuffRule,
  RuffCategory,
  LegendInfo,
  EmbeddedRuffData,
} from '@/types/ruffTypes';

/**
 * Create a mock LegendInfo object
 */
export const createMockLegendInfo = (
  overrides: Partial<LegendInfo> = {},
): LegendInfo => ({
  status: 'stable',
  fixable: false,
  ecosystemSpecific: undefined,
  ...overrides,
});

/**
 * Create a mock RuffRule object
 */
export const createMockRule = (overrides: Partial<RuffRule> = {}): RuffRule => ({
  code: 'E501',
  name: 'line-too-long',
  category: 'pycodestyle',
  description: 'Line too long',
  example: undefined,
  fixedExample: undefined,
  enabled: true,
  ignoreReason: undefined,
  legendInfo: createMockLegendInfo(),
  isExpanded: false,
  lastModified: undefined,
  ...overrides,
});

/**
 * Create multiple mock RuffRule objects
 */
export const createMockRules = (count: number = 10): RuffRule[] =>
  Array.from({ length: count }, (_, i) =>
    createMockRule({
      code: `E${500 + i}`,
      name: `rule-${500 + i}`,
      description: `Description for rule E${500 + i}`,
    }),
  );

/**
 * Create a mock RuffCategory object
 */
export const createMockCategory = (
  overrides: Partial<RuffCategory> = {},
): RuffCategory => ({
  id: 'pycodestyle',
  name: 'Python Code Style',
  description: 'Style guide enforcement',
  ruleCount: 10,
  enabledCount: 5,
  enabled: true,
  ...overrides,
});

/**
 * Create multiple mock RuffCategory objects
 */
export const createMockCategories = (count: number = 5): RuffCategory[] =>
  Array.from({ length: count }, (_, i) =>
    createMockCategory({
      id: `category-${i}`,
      name: `Category ${i}`,
      description: `Description for category ${i}`,
      ruleCount: 10 + i,
      enabledCount: 5 + i,
    }),
  );

/**
 * Create mock EmbeddedRuffData
 */
export const createMockEmbeddedData = (
  overrides: Partial<EmbeddedRuffData> = {},
): EmbeddedRuffData => ({
  rules: createMockRules(20).map((rule) => ({
    code: rule.code,
    name: rule.name,
    category: rule.category,
    description: rule.description,
    example: rule.example,
    fixedExample: rule.fixedExample,
    legendInfo: rule.legendInfo,
  })),
  categories: createMockCategories(5).map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    ruleCount: cat.ruleCount,
  })),
  version: '0.1.0',
  buildTimestamp: new Date().toISOString(),
  ...overrides,
});

/**
 * Predefined test rules for specific scenarios
 */
export const TEST_RULES = {
  ENABLED: createMockRule({
    code: 'E501',
    name: 'line-too-long',
    enabled: true,
  }),
  DISABLED_WITH_REASON: createMockRule({
    code: 'W503',
    name: 'line-break-before-binary-operator',
    enabled: false,
    ignoreReason: 'Conflicts with Black formatter',
  }),
  DEPRECATED: createMockRule({
    code: 'D203',
    name: 'one-blank-line-before-class',
    legendInfo: createMockLegendInfo({
      status: 'deprecated',
    }),
  }),
  FIXABLE: createMockRule({
    code: 'F401',
    name: 'unused-import',
    legendInfo: createMockLegendInfo({
      fixable: true,
    }),
  }),
  PREVIEW: createMockRule({
    code: 'RUF001',
    name: 'preview-rule',
    legendInfo: createMockLegendInfo({
      status: 'preview',
    }),
  }),
} as const;
