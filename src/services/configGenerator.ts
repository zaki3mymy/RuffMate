/**
 * Configuration generator service
 * Generates pyproject.toml configuration from Ruff rules
 */

import type { RuffRule } from '@/types/ruffTypes';

/**
 * Options for configuration generation
 */
export interface GenerateOptions {
  /** Include comments for ignored rules (default: true) */
  includeComments?: boolean;
  /** Sort ignored rules alphabetically (default: false) */
  sortIgnored?: boolean;
}

/**
 * Result of configuration generation
 */
export interface GenerateResult {
  /** Generated pyproject.toml content */
  content: string;
  /** Number of ignored rules */
  ignoredRulesCount: number;
}

/**
 * Generate pyproject.toml configuration from rules
 *
 * Follows the pattern:
 * ```toml
 * [tool.ruff.lint]
 * select = ["ALL"]
 * ignore = [
 *     "E501",  # Line too long
 *     "W503",  # Line break before binary operator
 * ]
 * ```
 *
 * @param rules - Array of Ruff rules
 * @param options - Generation options
 * @returns Generated configuration and metadata
 */
export function generatePyprojectToml(
  rules: RuffRule[],
  options: GenerateOptions = {},
): GenerateResult {
  const { includeComments = true, sortIgnored = false } = options;

  // Filter disabled rules
  let ignoredRules = rules.filter((rule) => !rule.enabled);

  // Sort if requested
  if (sortIgnored) {
    ignoredRules = ignoredRules.sort((a, b) => a.code.localeCompare(b.code));
  }

  // Generate TOML content
  const lines: string[] = ['[tool.ruff.lint]', 'select = ["ALL"]'];

  if (ignoredRules.length === 0) {
    lines.push('ignore = []');
  } else {
    lines.push('ignore = [');

    ignoredRules.forEach((rule, index) => {
      const isLast = index === ignoredRules.length - 1;
      const comma = isLast ? '' : ',';

      if (includeComments && rule.ignoreReason) {
        lines.push(`    "${rule.code}"${comma}  # ${rule.ignoreReason}`);
      } else {
        lines.push(`    "${rule.code}"${comma}`);
      }
    });

    lines.push(']');
  }

  const content = lines.join('\n');

  return {
    content,
    ignoredRulesCount: ignoredRules.length,
  };
}

/**
 * Generate Ruff configuration in specified format
 *
 * @param rules - Array of Ruff rules
 * @param format - Output format ('toml' or 'json')
 * @param options - Generation options
 * @returns Generated configuration string
 */
export function generateRuffConfig(
  rules: RuffRule[],
  format: 'toml' | 'json' = 'toml',
  options: GenerateOptions = {},
): string {
  if (format === 'json') {
    // Generate JSON format (for pyproject.json or similar)
    const { sortIgnored = false } = options;

    // Filter disabled rules
    let ignoredRules = rules.filter((rule) => !rule.enabled);

    // Sort if requested
    if (sortIgnored) {
      ignoredRules = ignoredRules.sort((a, b) => a.code.localeCompare(b.code));
    }

    const config = {
      tool: {
        ruff: {
          lint: {
            select: ['ALL'],
            ignore: ignoredRules.map((rule) => rule.code),
          },
        },
      },
    };

    return JSON.stringify(config, null, 2);
  } else {
    // Generate TOML format
    const result = generatePyprojectToml(rules, options);
    return result.content;
  }
}
