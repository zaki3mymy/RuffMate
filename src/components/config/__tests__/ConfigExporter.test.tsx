/**
 * Tests for ConfigExporter component
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithTheme } from '../../../../tests/helpers/testUtils';
import { ConfigExporter } from '../ConfigExporter';
import type { RuffRule } from '@/types';

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
];

const mockCloseExportDialog = vi.fn();
const mockShowNotification = vi.fn();

vi.mock('@/store', () => ({
  useRulesStore: (selector: any) => {
    const state = {
      rules: mockRules,
    };
    return selector(state);
  },
  useUIStore: (selector: any) => {
    const state = {
      exportDialogOpen: true,
      closeExportDialog: mockCloseExportDialog,
      showNotification: mockShowNotification,
    };
    return selector(state);
  },
}));

// Mock configGenerator
vi.mock('@/services/configGenerator', () => ({
  generateRuffConfig: vi.fn((rules: RuffRule[], format: string) => {
    if (format === 'toml') {
      return '[tool.ruff]\nselect = ["E501"]\nignore = ["F401"]';
    }
    return '{"tool": {"ruff": {"select": ["E501"], "ignore": ["F401"]}}}';
  }),
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

describe('ConfigExporter', () => {
  beforeEach(() => {
    mockCloseExportDialog.mockClear();
    mockShowNotification.mockClear();
    mockWriteText.mockClear();
    mockWriteText.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render dialog when exportDialogOpen is true', () => {
      // When: Render ConfigExporter with dialog open
      renderWithTheme(<ConfigExporter />);

      // Then: Dialog should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render dialog title', () => {
      // When: Render ConfigExporter
      renderWithTheme(<ConfigExporter />);

      // Then: Should show Export Configuration title
      expect(screen.getByText('Export Configuration')).toBeInTheDocument();
    });

    it('should have format selection radio buttons', () => {
      // When: Render ConfigExporter
      renderWithTheme(<ConfigExporter />);

      // Then: Should show TOML and JSON format options
      expect(screen.getByLabelText(/TOML/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/JSON/i)).toBeInTheDocument();
    });

    it('should display configuration preview', () => {
      // When: Render ConfigExporter
      renderWithTheme(<ConfigExporter />);

      // Then: Should display preview section
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText(/\[tool\.ruff\]/i)).toBeInTheDocument();
    });
  });

  describe('Format Selection', () => {
    it('should select TOML format by default', () => {
      // When: Render ConfigExporter
      renderWithTheme(<ConfigExporter />);

      // Then: TOML radio button should be checked
      const tomlRadio = screen.getByLabelText(/TOML/i) as HTMLInputElement;
      expect(tomlRadio.checked).toBe(true);
    });

    it('should switch to JSON format when selected', async () => {
      // Given: Render ConfigExporter
      const user = userEvent.setup();
      renderWithTheme(<ConfigExporter />);

      // When: Click JSON radio button
      const jsonRadio = screen.getByLabelText(/JSON/i);
      await user.click(jsonRadio);

      // Then: JSON radio button should be checked
      expect((jsonRadio as HTMLInputElement).checked).toBe(true);
    });
  });

  describe('Actions', () => {
    it('should have copy button', () => {
      // When: Render ConfigExporter
      renderWithTheme(<ConfigExporter />);

      // Then: Should have Copy button
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('should have download button', () => {
      // When: Render ConfigExporter
      renderWithTheme(<ConfigExporter />);

      // Then: Should have Download button
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('should copy configuration to clipboard when copy button is clicked', async () => {
      // Given: Setup user event
      const user = userEvent.setup();
      renderWithTheme(<ConfigExporter />);

      // When: Click copy button
      const copyButton = screen.getByRole('button', { name: /copy/i });
      await user.click(copyButton);

      // Then: Should show success notification
      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          expect.stringContaining('copied'),
          'success',
        );
      });
    });

    it('should close dialog when close button is clicked', async () => {
      // Given: Setup user event
      const user = userEvent.setup();
      renderWithTheme(<ConfigExporter />);

      // When: Click close button
      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);

      // Then: Should call closeExportDialog
      expect(mockCloseExportDialog).toHaveBeenCalled();
    });
  });

});
