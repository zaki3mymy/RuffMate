/**
 * Build script to parse Ruff rule HTML and convert to JSON
 * TypeScript implementation for complete type safety
 */

// import * as cheerio from 'cheerio'; // Will be used in Phase 3+
import type { RuffRule, RuffCategory, RuffData } from '../src/types/ruffTypes';

/**
 * Options for parsing Ruff data
 */
export interface ParseRuffDataOptions {
  /** HTML content to parse */
  html: string;
  /** Version string (default: "0.1.0") */
  version?: string;
}

/**
 * Result of parse operation
 */
export interface ParseRuffDataResult {
  /** Whether the parse was successful */
  success: boolean;
  /** Parsed data if successful */
  data?: RuffData;
  /** Error message if failed */
  error?: string;
}

/**
 * Extract rule information from HTML
 * Note: This is a simplified implementation for Phase 2.6
 * In production, this would parse the actual Ruff documentation
 */
function extractRulesFromHTML(_html: string): RuffRule[] {
  // const $ = cheerio.load(html);
  const rules: RuffRule[] = [];

  // For Phase 2.6, we'll use the existing mock data
  // In Phase 3+, this would parse the actual HTML structure
  // from https://docs.astral.sh/ruff/rules/

  // This is a placeholder that returns empty array
  // The actual implementation would parse rule sections from the HTML

  return rules;
}

/**
 * Extract category information from rules
 */
function extractCategories(rules: RuffRule[]): RuffCategory[] {
  const categoryMap = new Map<string, RuffCategory>();

  rules.forEach((rule) => {
    if (!categoryMap.has(rule.category)) {
      categoryMap.set(rule.category, {
        id: rule.category,
        name: formatCategoryName(rule.category),
        description: getCategoryDescription(rule.category),
        ruleCount: 0,
      });
    }

    const category = categoryMap.get(rule.category);
    if (category) {
      category.ruleCount++;
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
}

/**
 * Format category ID to display name
 */
function formatCategoryName(categoryId: string): string {
  // Map common category IDs to display names
  const nameMap: Record<string, string> = {
    pycodestyle: 'Python Code Style',
    pyflakes: 'Pyflakes',
    pydocstyle: 'Pydocstyle',
    'pep8-naming': 'PEP 8 Naming',
    pyupgrade: 'Pyupgrade',
    ruff: 'Ruff-specific',
    'flake8-bugbear': 'Flake8-bugbear',
    mccabe: 'McCabe',
    isort: 'isort',
    'flake8-quotes': 'Flake8-quotes',
    'flake8-bandit': 'Flake8-bandit',
    'flake8-print': 'Flake8-print',
    airflow: 'Airflow',
    fastapi: 'FastAPI',
  };

  return nameMap[categoryId] ?? categoryId;
}

/**
 * Get category description
 */
function getCategoryDescription(categoryId: string): string {
  const descMap: Record<string, string> = {
    pycodestyle: 'Style guide enforcement based on PEP 8',
    pyflakes: 'Logical errors in Python code',
    pydocstyle: 'Docstring style checker',
    'pep8-naming': 'Naming convention checker',
    pyupgrade: 'Upgrade syntax for newer versions of Python',
    ruff: 'Ruff-specific rules',
    'flake8-bugbear': 'Finding likely bugs and design problems',
    mccabe: 'Complexity checker',
    isort: 'Import statement sorter',
    'flake8-quotes': 'Quote style checker',
    'flake8-bandit': 'Security issue checker',
    'flake8-print': 'Print statement checker',
    airflow: 'Apache Airflow-specific rules',
    fastapi: 'FastAPI-specific rules',
  };

  return descMap[categoryId] ?? '';
}

/**
 * Parse Ruff HTML data and convert to JSON structure
 */
export function parseRuffData(
  options: ParseRuffDataOptions,
): ParseRuffDataResult {
  try {
    const { html, version = '0.1.0' } = options;

    if (!html || html.trim().length === 0) {
      return {
        success: false,
        error: 'HTML content is empty',
      };
    }

    // Extract rules from HTML
    const rules = extractRulesFromHTML(html);

    // Extract categories from rules
    const categories = extractCategories(rules);

    // Build the complete data structure
    const data: RuffData = {
      rules,
      categories,
      version,
      buildTimestamp: new Date().toISOString(),
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error during parsing',
    };
  }
}
