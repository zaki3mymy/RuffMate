/**
 * Basic test for App component
 * Verifies test environment setup
 */

import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '../tests/helpers/testUtils';
import App from './App';

describe('App', () => {
  it('renders the application title', () => {
    renderWithTheme(<App />);
    expect(screen.getByText(/RuffMate - Ruff Configuration Manager/i)).toBeInTheDocument();
  });

  it('shows Phase 1 status', () => {
    renderWithTheme(<App />);
    expect(screen.getByText(/Phase 1: Environment Setup/i)).toBeInTheDocument();
  });
});
