type FetchLike = typeof fetch;

const DEFAULT_TIMEOUT_MS = 3_000;

export async function probeSupabaseAuth(
  url: string,
  anonKey: string,
  fetchImplementation: FetchLike = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImplementation(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: anonKey },
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
