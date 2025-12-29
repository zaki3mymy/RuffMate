/**
 * Tests for theme configuration
 */

import { describe, it, expect } from 'vitest';
import { getTheme, lightTheme, darkTheme } from '../theme';

describe('theme', () => {
  describe('getTheme', () => {
    it('should return light theme when mode is light', () => {
      // When: Get theme for light mode
      const theme = getTheme('light');

      // Then: Should return light theme
      expect(theme).toBe(lightTheme);
      expect(theme.palette.mode).toBe('light');
    });

    it('should return dark theme when mode is dark', () => {
      // When: Get theme for dark mode
      const theme = getTheme('dark');

      // Then: Should return dark theme
      expect(theme).toBe(darkTheme);
      expect(theme.palette.mode).toBe('dark');
    });
  });

  describe('lightTheme', () => {
    it('should have light mode palette', () => {
      expect(lightTheme.palette.mode).toBe('light');
    });

    it('should have custom colors defined', () => {
      expect(lightTheme.palette.primary.main).toBeDefined();
      expect(lightTheme.palette.secondary.main).toBeDefined();
      expect(lightTheme.palette.error.main).toBeDefined();
      expect(lightTheme.palette.warning.main).toBeDefined();
      expect(lightTheme.palette.info.main).toBeDefined();
      expect(lightTheme.palette.success.main).toBeDefined();
    });
  });

  describe('darkTheme', () => {
    it('should have dark mode palette', () => {
      expect(darkTheme.palette.mode).toBe('dark');
    });

    it('should have custom colors defined', () => {
      expect(darkTheme.palette.primary.main).toBeDefined();
      expect(darkTheme.palette.secondary.main).toBeDefined();
      expect(darkTheme.palette.error.main).toBeDefined();
      expect(darkTheme.palette.warning.main).toBeDefined();
      expect(darkTheme.palette.info.main).toBeDefined();
      expect(darkTheme.palette.success.main).toBeDefined();
    });
  });
});
