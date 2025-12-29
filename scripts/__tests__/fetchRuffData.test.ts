/**
 * Tests for fetchRuffData build script
 * Test-first development (TDD) - write tests before implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FetchRuffDataResult, FetchRuffDataOptions } from '../fetchRuffData';

// Mock fetch globally
const originalFetch = global.fetch;

describe('fetchRuffData', () => {
  let fetchRuffData: (options?: FetchRuffDataOptions) => Promise<FetchRuffDataResult>;

  beforeEach(async () => {
    // Dynamically import to ensure clean state
    const module = await import('../fetchRuffData');
    fetchRuffData = module.fetchRuffData;

    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('Successful data fetching', () => {
    it('should fetch HTML content from Ruff documentation', async () => {
      // Given: Mock successful response
      const mockHtml = '<html><body>Ruff Rules</body></html>';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      // When: Fetch data
      const result = await fetchRuffData();

      // Then: Should return HTML content
      expect(result.success).toBe(true);
      expect(result.html).toBe(mockHtml);
      expect(result.error).toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://docs.astral.sh/ruff/rules/',
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
    });

    it('should use custom URL when provided in options', async () => {
      // Given: Custom URL
      const customUrl = 'https://custom.url/rules/';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '<html></html>',
      });

      // When: Fetch with custom URL
      await fetchRuffData({ url: customUrl });

      // Then: Should use custom URL
      expect(global.fetch).toHaveBeenCalledWith(
        customUrl,
        expect.any(Object)
      );
    });

    it('should apply custom timeout when provided', async () => {
      // Given: Custom timeout
      const customTimeout = 5000;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '<html></html>',
      });

      // When: Fetch with custom timeout
      await fetchRuffData({ timeout: customTimeout });

      // Then: Should complete without timeout error
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      // Given: Network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      // When: Fetch data
      const result = await fetchRuffData({ maxRetries: 0 });

      // Then: Should return error
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
      expect(result.html).toBeUndefined();
    });

    it('should handle HTTP error status codes', async () => {
      // Given: HTTP 404 error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // When: Fetch data
      const result = await fetchRuffData({ maxRetries: 0 });

      // Then: Should return error
      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('should handle HTTP 500 errors', async () => {
      // Given: Server error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // When: Fetch data
      const result = await fetchRuffData({ maxRetries: 0 });

      // Then: Should return error
      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should handle timeout errors', async () => {
      // Given: Slow response that respects abort signal
      global.fetch = vi.fn().mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            // Listen for abort signal
            const signal = options?.signal as AbortSignal | undefined;
            if (signal) {
              signal.addEventListener('abort', () => {
                const error = new Error('The operation was aborted');
                error.name = 'AbortError';
                reject(error);
              });
            }
            // Never resolve (simulate very slow response)
          })
      );

      // When: Fetch with short timeout
      const result = await fetchRuffData({ timeout: 100, maxRetries: 0 });

      // Then: Should return timeout error
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Retry mechanism', () => {
    it('should retry on failure and succeed on second attempt', async () => {
      // Given: Use fake timers to speed up test
      vi.useFakeTimers();

      // Given: First attempt fails, second succeeds
      const mockHtml = '<html>Success</html>';
      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => mockHtml,
        });

      // When: Fetch with retries
      const resultPromise = fetchRuffData({ maxRetries: 2 });

      // Fast-forward timers
      await vi.runAllTimersAsync();

      const result = await resultPromise;

      // Then: Should succeed on retry
      expect(result.success).toBe(true);
      expect(result.html).toBe(mockHtml);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('should respect maxRetries setting', async () => {
      // Given: Use fake timers to speed up test
      vi.useFakeTimers();

      // Given: All attempts fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Always fails'));

      // When: Fetch with 3 max retries
      const resultPromise = fetchRuffData({ maxRetries: 3 });

      // Fast-forward timers
      await vi.runAllTimersAsync();

      const result = await resultPromise;

      // Then: Should attempt exactly 4 times (initial + 3 retries)
      expect(result.success).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(4);

      vi.useRealTimers();
    });

    it('should not retry when maxRetries is 0', async () => {
      // Given: Fetch fails
      global.fetch = vi.fn().mockRejectedValue(new Error('Fails'));

      // When: Fetch with no retries
      const result = await fetchRuffData({ maxRetries: 0 });

      // Then: Should attempt only once
      expect(result.success).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request headers', () => {
    it('should include User-Agent header', async () => {
      // Given: Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '<html></html>',
      });

      // When: Fetch data
      await fetchRuffData();

      // Then: Should include User-Agent
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('RuffMate'),
          }),
        })
      );
    });

    it('should include Accept header for HTML', async () => {
      // Given: Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '<html></html>',
      });

      // When: Fetch data
      await fetchRuffData();

      // Then: Should include Accept header
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: expect.stringContaining('text/html'),
          }),
        })
      );
    });
  });

  describe('Default values', () => {
    it('should use default URL when not specified', async () => {
      // Given: Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '<html></html>',
      });

      // When: Fetch without options
      await fetchRuffData();

      // Then: Should use default Ruff docs URL
      expect(global.fetch).toHaveBeenCalledWith(
        'https://docs.astral.sh/ruff/rules/',
        expect.any(Object)
      );
    });

    it('should use default timeout when not specified', async () => {
      // Given: Mock fetch with delay
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({
              ok: true,
              status: 200,
              text: async () => '<html></html>',
            }), 1000); // 1 second
          })
      );

      // When: Fetch without custom timeout
      const result = await fetchRuffData({ maxRetries: 0 });

      // Then: Should succeed (default timeout should be >= 1 second)
      expect(result.success).toBe(true);
    });
  });
});
