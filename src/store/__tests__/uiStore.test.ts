/**
 * Tests for uiStore (Zustand)
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('uiStore', () => {
  let useUIStore: any;

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();

    // Dynamically import store to get fresh instance
    const module = await import('../uiStore');
    useUIStore = module.useUIStore;

    // Reset store to initial state
    act(() => {
      useUIStore.getState().reset?.();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      // When: Get initial state
      const { result } = renderHook(() => useUIStore());

      // Then: Should have default values
      expect(result.current.theme).toBe('light');
      expect(result.current.viewMode).toBe('list');
      expect(result.current.sidebarOpen).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.notification).toBeNull();
    });
  });

  describe('Theme management', () => {
    it('should set theme to dark', () => {
      // When: Set dark theme
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
      });

      // Then: Should update theme
      expect(result.current.theme).toBe('dark');
    });

    it('should set theme to light', () => {
      // Given: Dark theme set
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
      });

      // When: Set light theme
      act(() => {
        result.current.setTheme('light');
      });

      // Then: Should update theme
      expect(result.current.theme).toBe('light');
    });

    it('should toggle theme from light to dark', () => {
      // Given: Light theme (default)
      const { result } = renderHook(() => useUIStore());

      // When: Toggle theme
      act(() => {
        result.current.toggleTheme();
      });

      // Then: Should be dark
      expect(result.current.theme).toBe('dark');
    });

    it('should toggle theme from dark to light', () => {
      // Given: Dark theme
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
      });

      // When: Toggle theme
      act(() => {
        result.current.toggleTheme();
      });

      // Then: Should be light
      expect(result.current.theme).toBe('light');
    });

    it('should persist theme to localStorage', () => {
      // When: Set theme
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
      });

      // Then: Should save to localStorage
      const stored = localStorage.getItem('ruffmate_theme');
      expect(stored).toBe('dark');
    });

    it('should load theme from localStorage on init', () => {
      // Given: Theme saved in localStorage
      localStorage.setItem('ruffmate_theme', 'dark');

      // When: Create new store instance
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.loadUISettings();
      });

      // Then: Should load saved theme
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('View mode management', () => {
    it('should set view mode to grid', () => {
      // When: Set grid view
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setViewMode('grid');
      });

      // Then: Should update view mode
      expect(result.current.viewMode).toBe('grid');
    });

    it('should set view mode to detailed', () => {
      // When: Set detailed view
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setViewMode('detailed');
      });

      // Then: Should update view mode
      expect(result.current.viewMode).toBe('detailed');
    });

    it('should persist view mode to localStorage', () => {
      // When: Set view mode
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setViewMode('grid');
      });

      // Then: Should save to localStorage
      const stored = localStorage.getItem('ruffmate_view_mode');
      expect(stored).toBe('grid');
    });

    it('should load view mode from localStorage on init', () => {
      // Given: View mode saved in localStorage
      localStorage.setItem('ruffmate_view_mode', 'detailed');

      // When: Create new store instance
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.loadUISettings();
      });

      // Then: Should load saved view mode
      expect(result.current.viewMode).toBe('detailed');
    });
  });

  describe('Sidebar management', () => {
    it('should toggle sidebar open to closed', () => {
      // Given: Sidebar open (default)
      const { result } = renderHook(() => useUIStore());

      // When: Toggle sidebar
      act(() => {
        result.current.toggleSidebar();
      });

      // Then: Should be closed
      expect(result.current.sidebarOpen).toBe(false);
    });

    it('should toggle sidebar closed to open', () => {
      // Given: Sidebar closed
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleSidebar();
      });

      // When: Toggle sidebar again
      act(() => {
        result.current.toggleSidebar();
      });

      // Then: Should be open
      expect(result.current.sidebarOpen).toBe(true);
    });

    it('should set sidebar state directly', () => {
      // When: Set sidebar closed
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setSidebarOpen(false);
      });

      // Then: Should be closed
      expect(result.current.sidebarOpen).toBe(false);
    });

    it('should persist sidebar state to localStorage', () => {
      // When: Toggle sidebar
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleSidebar();
      });

      // Then: Should save to localStorage
      const stored = localStorage.getItem('ruffmate_sidebar_open');
      expect(stored).toBe('false');
    });

    it('should load sidebar state from localStorage on init', () => {
      // Given: Sidebar state saved in localStorage
      localStorage.setItem('ruffmate_sidebar_open', 'false');

      // When: Create new store instance
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.loadUISettings();
      });

      // Then: Should load saved state
      expect(result.current.sidebarOpen).toBe(false);
    });
  });

  describe('Loading state management', () => {
    it('should set loading state to true', () => {
      // When: Set loading
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading(true);
      });

      // Then: Should be loading
      expect(result.current.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      // Given: Loading state true
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading(true);
      });

      // When: Set loading false
      act(() => {
        result.current.setLoading(false);
      });

      // Then: Should not be loading
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Notification management', () => {
    it('should show success notification', () => {
      // When: Show success notification
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showNotification('Operation successful', 'success');
      });

      // Then: Should display notification
      expect(result.current.notification).toEqual({
        message: 'Operation successful',
        type: 'success',
      });
    });

    it('should show error notification', () => {
      // When: Show error notification
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showNotification('Operation failed', 'error');
      });

      // Then: Should display notification
      expect(result.current.notification).toEqual({
        message: 'Operation failed',
        type: 'error',
      });
    });

    it('should show info notification', () => {
      // When: Show info notification
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showNotification('Information message', 'info');
      });

      // Then: Should display notification
      expect(result.current.notification).toEqual({
        message: 'Information message',
        type: 'info',
      });
    });

    it('should show warning notification', () => {
      // When: Show warning notification
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showNotification('Warning message', 'warning');
      });

      // Then: Should display notification
      expect(result.current.notification).toEqual({
        message: 'Warning message',
        type: 'warning',
      });
    });

    it('should clear notification', () => {
      // Given: Notification shown
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showNotification('Test message', 'info');
      });

      // When: Clear notification
      act(() => {
        result.current.clearNotification();
      });

      // Then: Should be null
      expect(result.current.notification).toBeNull();
    });

    it('should replace existing notification with new one', () => {
      // Given: First notification
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showNotification('First message', 'info');
      });

      // When: Show second notification
      act(() => {
        result.current.showNotification('Second message', 'error');
      });

      // Then: Should show second notification
      expect(result.current.notification).toEqual({
        message: 'Second message',
        type: 'error',
      });
    });
  });

  describe('Modal management', () => {
    it('should open rule detail modal', () => {
      // When: Open modal with rule code
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openRuleDetailModal('E501');
      });

      // Then: Should open modal with code
      expect(result.current.ruleDetailModalOpen).toBe(true);
      expect(result.current.selectedRuleCode).toBe('E501');
    });

    it('should close rule detail modal', () => {
      // Given: Modal open
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openRuleDetailModal('E501');
      });

      // When: Close modal
      act(() => {
        result.current.closeRuleDetailModal();
      });

      // Then: Should close modal and clear selected code
      expect(result.current.ruleDetailModalOpen).toBe(false);
      expect(result.current.selectedRuleCode).toBeNull();
    });

    it('should open config export dialog', () => {
      // When: Open export dialog
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openExportDialog();
      });

      // Then: Should open dialog
      expect(result.current.exportDialogOpen).toBe(true);
    });

    it('should close config export dialog', () => {
      // Given: Dialog open
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openExportDialog();
      });

      // When: Close dialog
      act(() => {
        result.current.closeExportDialog();
      });

      // Then: Should close dialog
      expect(result.current.exportDialogOpen).toBe(false);
    });
  });

  describe('Settings persistence', () => {
    it('should load all UI settings from localStorage', () => {
      // Given: Multiple settings in localStorage
      localStorage.setItem('ruffmate_theme', 'dark');
      localStorage.setItem('ruffmate_view_mode', 'grid');
      localStorage.setItem('ruffmate_sidebar_open', 'false');

      // When: Load settings
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.loadUISettings();
      });

      // Then: Should load all settings
      expect(result.current.theme).toBe('dark');
      expect(result.current.viewMode).toBe('grid');
      expect(result.current.sidebarOpen).toBe(false);
    });

    it('should use defaults when localStorage is empty', () => {
      // Given: No settings in localStorage
      // When: Load settings
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.loadUISettings();
      });

      // Then: Should use default values
      expect(result.current.theme).toBe('light');
      expect(result.current.viewMode).toBe('list');
      expect(result.current.sidebarOpen).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Given: Invalid data in localStorage
      localStorage.setItem('ruffmate_sidebar_open', 'not-a-boolean');

      // When: Load settings
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.loadUISettings();
      });

      // Then: Should use default for invalid data
      expect(result.current.sidebarOpen).toBe(true);
    });
  });

  describe('Reset functionality', () => {
    it('should reset all state to initial values', () => {
      // Given: Modified state
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
        result.current.setViewMode('grid');
        result.current.setSidebarOpen(false);
        result.current.setLoading(true);
        result.current.showNotification('Test', 'info');
        result.current.openRuleDetailModal('E501');
      });

      // When: Reset
      act(() => {
        result.current.reset();
      });

      // Then: Should reset to defaults
      expect(result.current.theme).toBe('light');
      expect(result.current.viewMode).toBe('list');
      expect(result.current.sidebarOpen).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.notification).toBeNull();
      expect(result.current.ruleDetailModalOpen).toBe(false);
      expect(result.current.selectedRuleCode).toBeNull();
    });
  });
});
