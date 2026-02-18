import { logger } from '../utils/logger';

export interface GistServiceData {
  url: string;
  status: 'up' | 'down';
  uptimePercent: number;
  avgResponseMs: number;
  totalChecks: number;
  healthyChecks: number;
  lastResponseMs: number;
  lastChecked: string;
}

export interface GistIncident {
  service: string;
  status: string;
  startTime: string;
  endTime: string | null;
  durationMs: number | null;
  resolved: boolean;
}

export interface UptimeData {
  monitoringSince: string;
  lastCheck: string;
  services: Record<string, GistServiceData>;
  incidents: GistIncident[];
}

// TODO: Replace with your actual Gist raw URL after creating the Gist
const GIST_RAW_URL =
  'https://gist.githubusercontent.com/swantron/29651cabd005a75bac63afb74339ad74/raw/uptime.json';

const CACHE_TTL_MS = 60_000; // 60 seconds

let cachedData: UptimeData | null = null;
let cachedAt = 0;

export async function fetchUptimeData(): Promise<UptimeData | null> {
  const now = Date.now();
  if (cachedData && now - cachedAt < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const res = await fetch(GIST_RAW_URL, { cache: 'no-cache' });
    if (!res.ok) {
      logger.error('Failed to fetch uptime data', { status: res.status });
      return cachedData;
    }
    const data: UptimeData = await res.json();
    cachedData = data;
    cachedAt = now;
    return data;
  } catch (error) {
    logger.error('Failed to fetch uptime data', { error });
    return cachedData;
  }
}

export function getServiceUptime(
  data: UptimeData,
  serviceKey: string
): number | undefined {
  return data?.services?.[serviceKey]?.uptimePercent;
}

export function getIncidents(
  data: UptimeData,
  days: number = 7
): GistIncident[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return data.incidents
    .filter(i => new Date(i.startTime).getTime() > cutoff)
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
}
