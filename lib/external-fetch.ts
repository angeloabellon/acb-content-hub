import "server-only";

type ExternalFetchOptions = {
  revalidate: number;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 8_000;

/**
 * Small, shared boundary for public upstreams. An unavailable provider must
 * never make a public route fail; callers can render their own empty state.
 */
export async function fetchExternal(
  url: string,
  { revalidate, timeoutMs = DEFAULT_TIMEOUT_MS }: ExternalFetchOptions,
): Promise<Response | undefined> {
  try {
    const response = await fetch(url, {
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });

    return response.ok ? response : undefined;
  } catch {
    return undefined;
  }
}
