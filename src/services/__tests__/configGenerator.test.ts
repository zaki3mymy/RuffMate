/**
 * Tests for configGenerator service
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockRule } from '../../../tests/fixtures/mockData';
import type { RuffRule } from '@/types/ruffTypes';

describe('configGenerator', () => {
  let generatePyprojectToml: (
    rules: RuffRule[],
    options?: { includeComments?: boolean; sortIgnored?: boolean }
  ) => { content: string; ignoredRulesCount: number };

  beforeEach(async () => {
    const module = await import('../configGenerator');
    generatePyprojectToml = module.generatePyprojectToml;
  });

  describe('generatePyprojectToml', () => {
    it('should generate basic pyproject.toml with select ALL', () => {
      // Given: Rules with some disabled
      const rules: RuffRule[] = [
        createMockRule({ code: 'E501', enabled: false }),
      ];

      // When: Generate config
      const result = generatePyprojectToml(rules);

      // Then: Should include select = ["ALL"]
      expect(result.content).toContain('[tool.ruff.lint]');
      expect(result.content).toContain('select = ["ALL"]');
    });

    it('should include disabled rules in ignore list', () => {
      // Given: Mix of enabled and disabled rules
      const rules: RuffRule[] = [
        createMockRule({ code: 'E501', enabled: false }),
        createMockRule({ code: 'W503', enabled: false }),
        createMockRule({ code: 'F401', enabled: true }),
      ];

      // When: Generate config
      const result = generatePyprojectToml(rules);

      // Then: Should include disabled rules in ignore
      expect(result.content).toContain('ignore = [');
      expect(result.content).toContain('"E501"');
      expect(result.content).toContain('"W503"');
      expect(result.content).not.toContain('"F401"');
      expect(result.ignoredRulesCount).toBe(2);
    });

    it('should add comments for disabled rules when includeComments is true', () => {
      // Given: Disabled rule with reason
      const rules: RuffRule[] = [
        createMockRule({
          code: 'E501',
          enabled: false,
          ignoreReason: 'Line length adjusted for project',
        }),
      ];

      // When: Generate config with comments
      const result = generatePyprojectToml(rules, { includeComments: true });

      // Then: Should include comment
      expect(result.content).toContain('"E501"');
      expect(result.content).toContain('# Line length adjusted for project');
    });

    it('should not add comments when includeComments is false', () => {
      // Given: Disabled rule with reason
      const rules: RuffRule[] = [
        createMockRule({
          code: 'E501',
          enabled: false,
          ignoreReason: 'Some reason',
        }),
      ];

      // When: Generate config without comments
      const result = generatePyprojectToml(rules, { includeComments: false });

      // Then: Should not include comment
      expect(result.content).toContain('"E501"');
      expect(result.content).not.toContain('# Some reason');
    });

    it('should sort ignored rules alphabetically when sortIgnored is true', () => {
      // Given: Rules in random order
      const rules: RuffRule[] = [
        createMockRule({ code: 'W503', enabled: false }),
        createMockRule({ code: 'E501', enabled: false }),
        createMockRule({ code: 'F401', enabled: false }),
      ];

      // When: Generate config with sorting
      const result = generatePyprojectToml(rules, { sortIgnored: true });

      // Then: Should be in alphabetical order
      const ignoreSection = result.content.match(/ignore = \[([\s\S]*?)\]/)?.[1];
      expect(ignoreSection).toBeDefined();
      if (ignoreSection) {
        const codes = ignoreSection.match(/"([A-Z]\d+)"/g);
        expect(codes).toEqual(['"E501"', '"F401"', '"W503"']);
      }
    });

    it('should handle empty rules array', () => {
      // Given: Empty rules
      const rules: RuffRule[] = [];

      // When: Generate config
      const result = generatePyprojectToml(rules);

      // Then: Should have basic structure
      expect(result.content).toContain('[tool.ruff.lint]');
      expect(result.content).toContain('select = ["ALL"]');
      expect(result.content).toContain('ignore = []');
      expect(result.ignoredRulesCount).toBe(0);
    });

    it('should handle all rules enabled', () => {
      // Given: All rules enabled
      const rules: RuffRule[] = [
        createMockRule({ code: 'E501', enabled: true }),
        createMockRule({ code: 'F401', enabled: true }),
      ];

      // When: Generate config
      const result = generatePyprojectToml(rules);

      // Then: Should have empty ignore list
      expect(result.content).toContain('ignore = []');
      expect(result.ignoredRulesCount).toBe(0);
    });

    it('should escape special characters in comments', () => {
      // Given: Rule with special characters in reason
      const rules: RuffRule[] = [
        createMockRule({
          code: 'E501',
          enabled: false,
          ignoreReason: 'Conflicts with "Black" formatter',
        }),
      ];

      // When: Generate config
      const result = generatePyprojectToml(rules, { includeComments: true });

      // Then: Should properly handle quotes
      expect(result.content).toContain('Conflicts with "Black" formatter');
    });

    it('should handle rules without ignoreReason', () => {
      // Given: Disabled rule without reason
      const rules: RuffRule[] = [
        createMockRule({ code: 'E501', enabled: false, ignoreReason: undefined }),
      ];

      // When: Generate config with comments
      const result = generatePyprojectToml(rules, { includeComments: true });

      // Then: Should include rule without comment
      expect(result.content).toContain('"E501"');
      // Should not have # on the same line as E501
      const lines = result.content.split('\n');
      const e501Line = lines.find((line) => line.includes('"E501"'));
      expect(e501Line).toBeDefined();
      if (e501Line) {
        expect(e501Line).not.toContain('#');
      }
    });

    it('should generate well-formatted TOML', () => {
      // Given: Some disabled rules
      const rules: RuffRule[] = [
        createMockRule({
          code: 'E501',
          enabled: false,
          ignoreReason: 'Line length',
        }),
        createMockRule({ code: 'W503', enabled: false }),
      ];

      // When: Generate config
      const result = generatePyprojectToml(rules, { includeComments: true });

      // Then: Should be valid TOML format
      expect(result.content).toMatch(/\[tool\.ruff\.lint\]/);
      expect(result.content).toMatch(/select = \["ALL"\]/);
      expect(result.content).toMatch(/ignore = \[/);
      expect(result.content).toMatch(/\]/);

      // Should have proper indentation
      const lines = result.content.split('\n');
      const ignoreLine = lines.find((line) => line.trim().startsWith('ignore'));
      expect(ignoreLine).toBeDefined();
      if (ignoreLine) {
        expect(ignoreLine.startsWith('ignore')).toBe(true);
      }
    });

    it('should count ignored rules correctly', () => {
      // Given: Various rules
      const rules: RuffRule[] = [
        createMockRule({ code: 'E501', enabled: false }),
        createMockRule({ code: 'W503', enabled: false }),
        createMockRule({ code: 'F401', enabled: true }),
        createMockRule({ code: 'D203', enabled: false }),
      ];

      // When: Generate config
      const result = generatePyprojectToml(rules);

      // Then: Should count only disabled rules
      expect(result.ignoredRulesCount).toBe(3);
    });

    it('should handle large number of ignored rules', () => {
      // Given: Many disabled rules
      const rules: RuffRule[] = Array.from({ length: 50 }, (_, i) =>
        createMockRule({ code: `E${500 + i}`, enabled: false })
      );

      // When: Generate config
      const result = generatePyprojectToml(rules);

      // Then: Should handle all rules
      expect(result.ignoredRulesCount).toBe(50);
      expect(result.content).toContain('"E500"');
      expect(result.content).toContain('"E549"');
    });
  });
});
