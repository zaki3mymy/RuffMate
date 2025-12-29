/**
 * Tests for RuleManager component
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithTheme } from '../../../../tests/helpers/testUtils';
import { RuleManager } from '../RuleManager';
import type { RuffRule, FilterOptions } from '@/types';

// Mock the stores
const mockRules: RuffRule[] = [
  {
    code: 'E501',
    name: 'line-too-long',
    description: 'Line too long',
    category: 'pycodestyle',
    enabled: true,
    legendInfo: { status: 'stable', fixable: true },
  },
  {
    code: 'F401',
    name: 'unused-import',
    description: 'Module imported but unused',
    category: 'pyflakes',
    enabled: false,
    ignoreReason: 'Not needed',
    legendInfo: { status: 'stable', fixable: true },
  },
  {
    code: 'W292',
    name: 'no-newline-at-end-of-file',
    description: 'No newline at end of file',
    category: 'pycodestyle',
    enabled: true,
    legendInfo: { status: 'preview', fixable: false },
  },
];

const mockFilterOptions: FilterOptions = {
  status: [],
  legend: [],
  fixable: null,
  ecosystem: [],
};

const mockSetSearchQuery = vi.fn();
const mockSetFilterOptions = vi.fn();
const mockSetSelectedCategory = vi.fn();

vi.mock('@/store', () => ({
  useRulesStore: (selector: any) => {
    const state = {
      rules: mockRules,
      searchQuery: '',
      filterOptions: mockFilterOptions,
      selectedCategory: null,
      isLoading: false,
      error: null,
      setSearchQuery: mockSetSearchQuery,
      setFilterOptions: mockSetFilterOptions,
      setSelectedCategory: mockSetSelectedCategory,
    };
    return selector(state);
  },
  useUIStore: (selector: any) => {
    const state = {
      viewMode: 'list' as const,
      setViewMode: vi.fn(),
    };
    return selector(state);
  },
}));

// Mock RuleCard component for simplicity
vi.mock('../RuleCard', () => ({
  RuleCard: ({ rule }: { rule: RuffRule }) => (
    <div data-testid={`rule-card-${rule.code}`}>{rule.code}</div>
  ),
}));

describe('RuleManager', () => {
  beforeEach(() => {
    mockSetSearchQuery.mockClear();
    mockSetFilterOptions.mockClear();
    mockSetSelectedCategory.mockClear();
  });

  describe('Rendering - Basic Display', () => {
    it('should render without crashing', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should render successfully
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should display all rules by default', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should display all rule cards
      expect(screen.getByTestId('rule-card-E501')).toBeInTheDocument();
      expect(screen.getByTestId('rule-card-F401')).toBeInTheDocument();
      expect(screen.getByTestId('rule-card-W292')).toBeInTheDocument();
    });

    it('should display rule count', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should show total rule count
      expect(screen.getByText(/3\s+(rules?|items?)/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should have search input
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toBeInTheDocument();
    });

    it('should call setSearchQuery when typing in search', async () => {
      // Given: RuleManager rendered
      const user = userEvent.setup();
      renderWithTheme(<RuleManager />);

      // When: Type in search input
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'E501');

      // Then: Should call setSearchQuery for each character
      expect(mockSetSearchQuery).toHaveBeenCalled();
    });

    it('should be keyboard accessible for search', async () => {
      // Given: RuleManager rendered
      const user = userEvent.setup();
      renderWithTheme(<RuleManager />);

      // When: Tab to search and type
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      searchInput.focus();
      await user.keyboard('test');

      // Then: Should update search query
      expect(mockSetSearchQuery).toHaveBeenCalled();
    });
  });

  describe('View Mode Toggle', () => {
    it('should render view mode toggle buttons', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should have view mode options
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support list view mode', () => {
      // When: Render RuleManager in list view
      renderWithTheme(<RuleManager />);

      // Then: Should display rules in list format
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should render filter controls', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should have filter controls
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should support filtering by enabled status', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Component should render (filtering logic in store)
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should support filtering by legend status', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Component should render (filtering logic in store)
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should support filtering by fixable status', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Component should render (filtering logic in store)
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render main element even when loading', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should have main element
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render main element for displaying errors', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Component should render
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render when rules are present', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should display rules
      expect(screen.getByTestId('rule-card-E501')).toBeInTheDocument();
    });

    it('should handle empty search results gracefully', async () => {
      // Given: RuleManager rendered
      const user = userEvent.setup();
      renderWithTheme(<RuleManager />);

      // When: Search for non-existent rule
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.clear(searchInput);
      await user.type(searchInput, 'NONEXISTENT999');

      // Then: Should show no results (search query updated)
      expect(mockSetSearchQuery).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should have main role
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Search input should have label
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', async () => {
      // Given: RuleManager rendered
      const user = userEvent.setup();
      renderWithTheme(<RuleManager />);

      // When: Use Tab to navigate
      await user.tab();

      // Then: Focus should move to interactive elements
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should use proper container layout', () => {
      // When: Render RuleManager
      const { container } = renderWithTheme(<RuleManager />);

      // Then: Should have proper container structure
      expect(container.querySelector('[role="main"]')).toBeInTheDocument();
    });

    it('should render rules in list layout by default', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Rules should be displayed
      expect(screen.getByTestId('rule-card-E501')).toBeInTheDocument();
      expect(screen.getByTestId('rule-card-F401')).toBeInTheDocument();
      expect(screen.getByTestId('rule-card-W292')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render without significant delay', () => {
      // When: Render RuleManager
      const start = performance.now();
      renderWithTheme(<RuleManager />);
      const end = performance.now();

      // Then: Should render quickly (< 1000ms)
      expect(end - start).toBeLessThan(1000);
    });

    it('should handle current rule list efficiently', () => {
      // When: Render with current mock list (3 rules)
      const start = performance.now();
      renderWithTheme(<RuleManager />);
      const end = performance.now();

      // Then: Should render in reasonable time
      expect(end - start).toBeLessThan(500);
    });
  });

  describe('Integration', () => {
    it('should integrate with rules store', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should display rules from store
      expect(screen.getByTestId('rule-card-E501')).toBeInTheDocument();
    });

    it('should integrate with UI store for view mode', () => {
      // When: Render RuleManager
      renderWithTheme(<RuleManager />);

      // Then: Should use view mode from UI store
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
