/**
 * Build script to fetch Ruff rule documentation from official website
 * TypeScript implementation for complete type safety
 */

/**
 * Options for fetching Ruff data
 */
export interface FetchRuffDataOptions {
  /** URL to fetch from (default: https://docs.astral.sh/ruff/rules/) */
  url?: string;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum number of retries (default: 3) */
  maxRetries?: number;
}

/**
 * Result of fetch operation
 */
export interface FetchRuffDataResult {
  /** Whether the fetch was successful */
  success: boolean;
  /** HTML content if successful */
  html?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  url: 'https://docs.astral.sh/ruff/rules/',
  timeout: 30000,
  maxRetries: 3,
} as const;

/**
 * Fetch HTML content with timeout support
 */
async function fetchWithTimeout(
  url: string,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RuffMate/0.1.0 (Build Script)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch Ruff documentation HTML with retry logic
 */
export async function fetchRuffData(
  options: FetchRuffDataOptions = {},
): Promise<FetchRuffDataResult> {
  const config = {
    url: options.url ?? DEFAULT_CONFIG.url,
    timeout: options.timeout ?? DEFAULT_CONFIG.timeout,
    maxRetries: options.maxRetries ?? DEFAULT_CONFIG.maxRetries,
  };

  let lastError: Error | null = null;
  const maxAttempts = config.maxRetries + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Add delay before retry (exponential backoff)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await sleep(delay);
      }

      const response = await fetchWithTimeout(config.url, config.timeout);

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}`,
        );
      }

      const html = await response.text();

      return {
        success: true,
        html,
      };
    } catch (error) {
      lastError = error as Error;

      // Check if it's an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(
          `Request timeout after ${config.timeout}ms`,
        );
      }

      // Log retry attempt (will be visible in build logs)
      if (attempt < maxAttempts - 1) {
        console.warn(
          `Attempt ${attempt + 1}/${maxAttempts} failed: ${lastError.message}. Retrying...`,
        );
      }
    }
  }

  return {
    success: false,
    error: lastError?.message ?? 'Unknown error occurred',
  };
}

/**
 * Main execution when run as script
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchRuffData()
    .then((result) => {
      if (result.success) {
        console.log('Successfully fetched Ruff documentation');
        console.log(`HTML length: ${result.html?.length ?? 0} characters`);
        process.exit(0);
      } else {
        console.error('Failed to fetch Ruff documentation:');
        console.error(result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}
