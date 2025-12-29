/**
 * Tests for Header component
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithTheme } from '../../../../tests/helpers/testUtils';
import { Header } from '../Header';

// Create mocks
const mockToggleTheme = vi.fn();

// Mock the stores
vi.mock('@/store', () => ({
  useUIStore: (selector: any) => {
    const state = {
      theme: 'light' as const,
      toggleTheme: mockToggleTheme,
    };
    return selector(state);
  },
  useRulesStore: (selector: any) => {
    const state = {
      ruffVersion: '0.1.0',
    };
    return selector(state);
  },
}));

describe('Header', () => {
  beforeEach(() => {
    mockToggleTheme.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render app title', () => {
      // When: Render Header
      renderWithTheme(<Header />);

      // Then: Should display app title
      expect(screen.getByText('RuffMate')).toBeInTheDocument();
    });

    it('should render app description', () => {
      // When: Render Header
      renderWithTheme(<Header />);

      // Then: Should display description
      expect(screen.getByText(/Ruff Configuration Manager/i)).toBeInTheDocument();
    });

    it('should render Ruff version when available', () => {
      // When: Render Header with version
      renderWithTheme(<Header />);

      // Then: Should display version
      expect(screen.getByText(/Ruff v0.1.0/i)).toBeInTheDocument();
    });

    it('should render theme toggle button', () => {
      // When: Render Header
      renderWithTheme(<Header />);

      // Then: Should have theme toggle button
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });
  });

  describe('Theme toggle interaction', () => {
    it('should call toggleTheme when theme button is clicked', async () => {
      // Given: Header rendered
      const user = userEvent.setup();
      renderWithTheme(<Header />);

      // When: Click theme toggle button
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(themeButton);

      // Then: Should call toggleTheme
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible', async () => {
      // Given: Header rendered
      const user = userEvent.setup();
      renderWithTheme(<Header />);

      // When: Tab to button and press Enter
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      themeButton.focus();
      await user.keyboard('{Enter}');

      // Then: Should call toggleTheme
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Layout and styling', () => {
    it('should render as a header element', () => {
      // When: Render Header
      const { container } = renderWithTheme(<Header />);

      // Then: Should have header element
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      // When: Render Header
      const { container } = renderWithTheme(<Header />);

      // Then: Should have banner role
      const header = container.querySelector('header');
      expect(header).toHaveAttribute('role', 'banner');
    });

    it('should arrange items in toolbar', () => {
      // When: Render Header
      const { container } = renderWithTheme(<Header />);

      // Then: Should use MUI Toolbar
      const toolbar = container.querySelector('[class*="MuiToolbar"]');
      expect(toolbar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible theme toggle button', () => {
      // When: Render Header
      renderWithTheme(<Header />);

      // Then: Button should have aria-label
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeButton).toHaveAttribute('aria-label');
    });

    it('should indicate current theme state in aria-label', () => {
      // When: Render Header
      renderWithTheme(<Header />);

      // Then: Button aria-label should indicate light mode
      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      const ariaLabel = themeButton.getAttribute('aria-label');
      expect(ariaLabel?.toLowerCase()).toContain('light');
    });
  });

  describe('Responsive behavior', () => {
    it('should render on all viewports', () => {
      // When: Render Header
      renderWithTheme(<Header />);

      // Then: Should render without crashing
      expect(screen.getByText('RuffMate')).toBeInTheDocument();
    });

    it('should have all key elements present', () => {
      // When: Render Header
      renderWithTheme(<Header />);

      // Then: All key elements should be present
      expect(screen.getByText('RuffMate')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });
  });
});
