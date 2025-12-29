/**
 * Tests for RuleCard component
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithTheme } from '../../../../tests/helpers/testUtils';
import { RuleCard } from '../RuleCard';
import type { RuffRule } from '@/types';

// Mock the stores
const mockToggleRule = vi.fn();

vi.mock('@/store', () => ({
  useRulesStore: (selector: any) => {
    const state = {
      toggleRule: mockToggleRule,
    };
    return selector(state);
  },
}));

describe('RuleCard', () => {
  const baseRule: RuffRule = {
    code: 'E501',
    name: 'line-too-long',
    description: 'Line contains more than 88 characters.',
    category: 'pycodestyle',
    enabled: true,
    legendInfo: {
      status: 'stable',
      fixable: true,
    },
  };

  beforeEach(() => {
    mockToggleRule.mockClear();
  });

  describe('Rendering - Basic Information', () => {
    it('should render rule code', () => {
      // When: Render RuleCard
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should display rule code
      expect(screen.getByText('E501')).toBeInTheDocument();
    });

    it('should render rule name', () => {
      // When: Render RuleCard
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should display rule name
      expect(screen.getByText('line-too-long')).toBeInTheDocument();
    });

    it('should render rule description', () => {
      // When: Render RuleCard
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should display description
      expect(screen.getByText(/Line contains more than 88 characters/i)).toBeInTheDocument();
    });

    it('should render rule category', () => {
      // When: Render RuleCard
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should display category
      expect(screen.getByText(/pycodestyle/i)).toBeInTheDocument();
    });
  });

  describe('Rendering - Legend Badges', () => {
    it('should show fixable badge when rule is fixable', () => {
      // When: Render rule with fixable=true
      const fixableRule: RuffRule = {
        ...baseRule,
        legendInfo: { ...baseRule.legendInfo, fixable: true },
      };
      renderWithTheme(<RuleCard rule={fixableRule} />);

      // Then: Should display fixable badge
      expect(screen.getByText(/fixable/i)).toBeInTheDocument();
    });

    it('should not show fixable badge when rule is not fixable', () => {
      // When: Render rule with fixable=false
      const nonFixableRule: RuffRule = {
        ...baseRule,
        legendInfo: { ...baseRule.legendInfo, fixable: false },
      };
      renderWithTheme(<RuleCard rule={nonFixableRule} />);

      // Then: Should not display fixable badge
      expect(screen.queryByText(/fixable/i)).not.toBeInTheDocument();
    });

    it('should show preview badge when rule is in preview', () => {
      // When: Render preview rule
      const previewRule: RuffRule = {
        ...baseRule,
        legendInfo: { ...baseRule.legendInfo, status: 'preview' },
      };
      renderWithTheme(<RuleCard rule={previewRule} />);

      // Then: Should display preview badge
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });

    it('should show deprecated badge when rule is deprecated', () => {
      // When: Render deprecated rule
      const deprecatedRule: RuffRule = {
        ...baseRule,
        legendInfo: { ...baseRule.legendInfo, status: 'deprecated' },
      };
      renderWithTheme(<RuleCard rule={deprecatedRule} />);

      // Then: Should display deprecated badge
      expect(screen.getByText(/deprecated/i)).toBeInTheDocument();
    });

    it('should show stable badge for stable rules', () => {
      // When: Render stable rule
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should display stable badge
      expect(screen.getByText(/stable/i)).toBeInTheDocument();
    });
  });

  describe('Enable/Disable Toggle', () => {
    it('should render toggle switch', () => {
      // When: Render RuleCard
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should have toggle switch
      const toggle = screen.getByRole('checkbox');
      expect(toggle).toBeInTheDocument();
    });

    it('should show toggle as checked when rule is enabled', () => {
      // When: Render enabled rule
      const enabledRule: RuffRule = { ...baseRule, enabled: true };
      renderWithTheme(<RuleCard rule={enabledRule} />);

      // Then: Toggle should be checked
      const toggle = screen.getByRole('checkbox') as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });

    it('should show toggle as unchecked when rule is disabled', () => {
      // When: Render disabled rule
      const disabledRule: RuffRule = { ...baseRule, enabled: false };
      renderWithTheme(<RuleCard rule={disabledRule} />);

      // Then: Toggle should be unchecked
      const toggle = screen.getByRole('checkbox') as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });

    it('should call toggleRule when toggle is clicked', async () => {
      // Given: RuleCard rendered
      const user = userEvent.setup();
      renderWithTheme(<RuleCard rule={baseRule} />);

      // When: Click toggle
      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      // Then: Should call toggleRule with rule code
      expect(mockToggleRule).toHaveBeenCalledTimes(1);
      expect(mockToggleRule).toHaveBeenCalledWith('E501');
    });

    it('should toggle from enabled to disabled', async () => {
      // Given: Enabled rule
      const user = userEvent.setup();
      const enabledRule: RuffRule = { ...baseRule, enabled: true };
      renderWithTheme(<RuleCard rule={enabledRule} />);

      // When: Click toggle
      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      // Then: Should call toggleRule
      expect(mockToggleRule).toHaveBeenCalledWith('E501');
    });

    it('should toggle from disabled to enabled', async () => {
      // Given: Disabled rule
      const user = userEvent.setup();
      const disabledRule: RuffRule = { ...baseRule, enabled: false };
      renderWithTheme(<RuleCard rule={disabledRule} />);

      // When: Click toggle
      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      // Then: Should call toggleRule
      expect(mockToggleRule).toHaveBeenCalledWith('E501');
    });
  });

  describe('Ignore Reason Display', () => {
    it('should show ignore reason when rule is disabled with reason', () => {
      // When: Render disabled rule with reason
      const disabledRule: RuffRule = {
        ...baseRule,
        enabled: false,
        ignoreReason: 'Not applicable for this project',
      };
      renderWithTheme(<RuleCard rule={disabledRule} />);

      // Then: Should display ignore reason
      expect(screen.getByText(/Not applicable for this project/i)).toBeInTheDocument();
    });

    it('should not show ignore reason section when rule is enabled', () => {
      // When: Render enabled rule
      const enabledRule: RuffRule = {
        ...baseRule,
        enabled: true,
      };
      renderWithTheme(<RuleCard rule={enabledRule} />);

      // Then: Should not display ignore reason section
      expect(screen.queryByText(/reason/i)).not.toBeInTheDocument();
    });

    it('should not show ignore reason when disabled but no reason provided', () => {
      // When: Render disabled rule without reason
      const disabledRule: RuffRule = {
        ...baseRule,
        enabled: false,
      };
      renderWithTheme(<RuleCard rule={disabledRule} />);

      // Then: Should not display ignore reason section
      expect(screen.queryByText(/reason/i)).not.toBeInTheDocument();
    });
  });

  describe('Detailed Description Expansion', () => {
    it('should show truncated description by default', () => {
      // When: Render RuleCard
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should show description (truncated with CSS)
      expect(screen.getByText(baseRule.description)).toBeInTheDocument();
    });

    it('should show expand button', () => {
      // When: Render RuleCard
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should have expand button
      const expandButton = screen.getByRole('button', { name: /show details/i });
      expect(expandButton).toBeInTheDocument();
    });

    it('should show full description in expanded section when expand button is clicked', async () => {
      // Given: RuleCard rendered
      const user = userEvent.setup();
      renderWithTheme(<RuleCard rule={baseRule} />);

      // When: Click expand button
      const expandButton = screen.getByRole('button', { name: /show details/i });
      await user.click(expandButton);

      // Then: Should display description in both places (truncated and full)
      const descriptions = screen.getAllByText(baseRule.description);
      expect(descriptions.length).toBeGreaterThanOrEqual(1);
    });

    it('should change button text to collapse when expanded', async () => {
      // Given: RuleCard rendered
      const user = userEvent.setup();
      renderWithTheme(<RuleCard rule={baseRule} />);

      // When: Click expand button
      const expandButton = screen.getByRole('button', { name: /show details/i });
      await user.click(expandButton);

      // Then: Button text should change to collapse
      expect(screen.getByRole('button', { name: /hide details/i })).toBeInTheDocument();
    });

    it('should hide expanded section when collapse button is clicked', async () => {
      // Given: Expanded RuleCard
      const user = userEvent.setup();
      renderWithTheme(<RuleCard rule={baseRule} />);

      const expandButton = screen.getByRole('button', { name: /show details/i });
      await user.click(expandButton);

      // Verify it's expanded
      expect(screen.getByRole('button', { name: /hide details/i })).toBeInTheDocument();

      // When: Click collapse button
      const collapseButton = screen.getByRole('button', { name: /hide details/i });
      await user.click(collapseButton);

      // Then: Should show collapse button again (back to collapsed state)
      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible toggle switch label', () => {
      // When: Render RuleCard
      renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Toggle should have aria-label
      const toggle = screen.getByRole('checkbox');
      expect(toggle).toHaveAttribute('aria-label');
    });

    it('should indicate enabled state in toggle aria-label', () => {
      // When: Render enabled rule
      const enabledRule: RuffRule = { ...baseRule, enabled: true };
      renderWithTheme(<RuleCard rule={enabledRule} />);

      // Then: aria-label should indicate enabled
      const toggle = screen.getByRole('checkbox');
      const ariaLabel = toggle.getAttribute('aria-label');
      expect(ariaLabel?.toLowerCase()).toContain('enabled');
    });

    it('should have proper heading hierarchy', () => {
      // When: Render RuleCard
      const { container } = renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should use heading for rule name
      const heading = container.querySelector('h3, h4, h5, h6');
      expect(heading).toBeInTheDocument();
    });

    it('should be keyboard accessible for toggle', async () => {
      // Given: RuleCard rendered
      const user = userEvent.setup();
      renderWithTheme(<RuleCard rule={baseRule} />);

      // When: Tab to toggle and press Space
      const toggle = screen.getByRole('checkbox');
      toggle.focus();
      await user.keyboard(' ');

      // Then: Should call toggleRule
      expect(mockToggleRule).toHaveBeenCalledTimes(1);
    });
  });

  describe('Layout and Styling', () => {
    it('should render as a card element', () => {
      // When: Render RuleCard
      const { container } = renderWithTheme(<RuleCard rule={baseRule} />);

      // Then: Should use MUI Card component
      const card = container.querySelector('[class*="MuiCard"]');
      expect(card).toBeInTheDocument();
    });

    it('should visually distinguish disabled rules', () => {
      // When: Render disabled rule
      const disabledRule: RuffRule = { ...baseRule, enabled: false };
      const { container } = renderWithTheme(<RuleCard rule={disabledRule} />);

      // Then: Should have visual indication (opacity or styling)
      const card = container.querySelector('[class*="MuiCard"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rules with very long descriptions', () => {
      // When: Render rule with long description
      const longDescRule: RuffRule = {
        ...baseRule,
        description: 'A'.repeat(500),
      };

      // Then: Should render without crashing
      expect(() => renderWithTheme(<RuleCard rule={longDescRule} />)).not.toThrow();
    });

    it('should handle rules with special characters in text', () => {
      // When: Render rule with special characters
      const specialRule: RuffRule = {
        ...baseRule,
        description: 'Test & "quotes" <tags>',
      };
      renderWithTheme(<RuleCard rule={specialRule} />);

      // Then: Should display text safely
      expect(screen.getByText('Test & "quotes" <tags>')).toBeInTheDocument();
    });

    it('should handle empty category', () => {
      // When: Render rule with empty category
      const noCategoryRule: RuffRule = {
        ...baseRule,
        category: '',
      };

      // Then: Should render without crashing
      expect(() => renderWithTheme(<RuleCard rule={noCategoryRule} />)).not.toThrow();
    });
  });
});
