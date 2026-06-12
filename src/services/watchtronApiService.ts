import { logger } from '../utils/logger';

// watchtron is the deploy-verification side of the blended status view. Its
// control plane exposes the last verified deploy (and history) per fleet
// service at /api/status (public, CORS-enabled). We overlay that as
// "deploy provenance" on the uptime-monitor heartbeat shown on /status.

export interface WatchtronVerdict {
  pass: boolean;
  whiteBox: boolean;
  endToEnd: boolean | null;
  servedVersion: string | null;
  versionMatch: boolean | null;
  p95LatencyMs: number;
  at: string;
}

export interface WatchtronHistoryEntry {
  at: string;
  pass: boolean;
  p95: number;
  version: string | null;
}

export interface WatchtronService {
  name: string;
  url: string;
  lastVerdict: WatchtronVerdict | null;
  history?: WatchtronHistoryEntry[];
}

export interface WatchtronStatus {
  services: WatchtronService[];
}

const WATCHTRON_STATUS_URL = 'https://watch.swantron.com/api/status';
const CACHE_TTL_MS = 60_000; // 60 seconds

let cachedData: WatchtronStatus | null = null;
let cachedAt = 0;

export async function fetchWatchtronStatus(): Promise<WatchtronStatus | null> {
  const now = Date.now();
  if (cachedData && now - cachedAt < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const res = await fetch(WATCHTRON_STATUS_URL, { cache: 'no-cache' });
    if (!res.ok) {
      logger.error('Failed to fetch watchtron status', { status: res.status });
      return cachedData;
    }
    const data: WatchtronStatus = await res.json();
    cachedData = data;
    cachedAt = now;
    return data;
  } catch (error) {
    logger.error('Failed to fetch watchtron status', { error });
    return cachedData;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Find the watchtron fleet entry whose URL shares a hostname with `url`. The two
 * systems key services differently (e.g. `mtServices` vs `mt`, and jswan's URLs
 * differ by path), so hostname is the reliable join.
 */
export function getDeployForUrl(
  status: WatchtronStatus | null,
  url: string
): WatchtronService | undefined {
  const host = hostOf(url);
  if (!status || !host) return undefined;
  return status.services.find(s => hostOf(s.url) === host);
}
