/**
 * Tests for App component
 * Verifies the main application structure
 */

import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '../tests/helpers/testUtils';
import App from './App';

describe('App', () => {
  it('renders the application title in header', () => {
    renderWithTheme(<App />);
    expect(screen.getByText(/RuffMate/i)).toBeInTheDocument();
  });

  it('renders the main content area', () => {
    renderWithTheme(<App />);
    // RuleManager shows this message when there are no rules
    expect(screen.getByText(/Please load rules to get started/i)).toBeInTheDocument();
  });

  it('includes the header component', () => {
    renderWithTheme(<App />);
    // Header contains theme toggle button
    expect(screen.getByRole('button', { name: /toggle.*theme/i })).toBeInTheDocument();
  });
});
