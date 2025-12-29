/**
 * Test utilities and custom render functions
 */

import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from '@/styles/theme';
import { vi } from 'vitest';

/**
 * Custom render function with MUI ThemeProvider
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: typeof lightTheme;
}

export function renderWithTheme(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) {
  const { theme = lightTheme, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for a specific condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 50,
): Promise<void> => {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};

/**
 * Create a spy function with type safety
 */
export const createSpy = <T extends (...args: never[]) => unknown>() => {
  return vi.fn<T>();
};

// Re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
