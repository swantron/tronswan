import { logger } from '../utils/logger';

export interface ServiceCheck {
  serviceName: string;
  timestamp: Date;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
}

export interface Incident {
  id: string;
  serviceName: string;
  startTime: Date;
  endTime?: Date;
  status: 'degraded' | 'down';
  resolved: boolean;
  duration?: number;
}

export interface UptimeStats {
  serviceName: string;
  uptimePercentage: number;
  totalChecks: number;
  healthyChecks: number;
  avgResponseTime: number;
  incidents: Incident[];
}

class UptimeService {
  private readonly STORAGE_KEY = 'tronswan_uptime_history';
  private readonly MAX_HISTORY_DAYS = 30;
  private readonly MAX_CHECKS_PER_SERVICE = 1000;

  private history: ServiceCheck[] = [];
  private incidents: Incident[] = [];

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as {
          history: Array<
            Omit<ServiceCheck, 'timestamp'> & { timestamp: string }
          >;
          incidents: Array<
            Omit<Incident, 'startTime' | 'endTime'> & {
              startTime: string;
              endTime?: string;
            }
          >;
        };
        this.history = data.history.map(check => ({
          ...check,
          timestamp: new Date(check.timestamp),
        }));
        this.incidents = data.incidents.map(incident => ({
          ...incident,
          startTime: new Date(incident.startTime),
          endTime: incident.endTime ? new Date(incident.endTime) : undefined,
        }));
        this.cleanOldData();
      }
    } catch (error) {
      logger.error('Failed to load uptime history', { error });
      this.history = [];
      this.incidents = [];
    }
  }

  private saveHistory() {
    try {
      const data = {
        history: this.history,
        incidents: this.incidents,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save uptime history', { error });
    }
  }

  private cleanOldData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.MAX_HISTORY_DAYS);

    this.history = this.history.filter(check => check.timestamp >= cutoffDate);

    this.incidents = this.incidents.filter(
      incident => incident.startTime >= cutoffDate
    );

    this.saveHistory();
  }

  recordCheck(check: ServiceCheck) {
    this.history.push(check);

    const serviceHistory = this.history.filter(
      h => h.serviceName === check.serviceName
    );

    if (serviceHistory.length > this.MAX_CHECKS_PER_SERVICE) {
      const toRemove = serviceHistory.length - this.MAX_CHECKS_PER_SERVICE;
      const checksToRemove = serviceHistory.slice(0, toRemove);
      this.history = this.history.filter(h => !checksToRemove.includes(h));
    }

    this.updateIncidents(check);
    this.saveHistory();
  }

  private updateIncidents(check: ServiceCheck) {
    const openIncident = this.incidents.find(
      i => i.serviceName === check.serviceName && !i.resolved
    );

    if (check.status === 'healthy') {
      if (openIncident) {
        openIncident.resolved = true;
        openIncident.endTime = check.timestamp;
        openIncident.duration =
          openIncident.endTime.getTime() - openIncident.startTime.getTime();

        logger.info('Incident resolved', {
          incident: openIncident,
          duration: `${Math.round(openIncident.duration / 1000)}s`,
        });
      }
    } else {
      if (!openIncident) {
        const incident: Incident = {
          id: `${check.serviceName}-${Date.now()}`,
          serviceName: check.serviceName,
          startTime: check.timestamp,
          status: check.status,
          resolved: false,
        };
        this.incidents.push(incident);

        logger.warn('New incident detected', {
          incident,
          serviceName: check.serviceName,
          status: check.status,
        });
      } else if (openIncident.status !== check.status) {
        openIncident.status = check.status;
      }
    }
  }

  getUptimeStats(serviceName: string, days: number = 30): UptimeStats {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const serviceHistory = this.history.filter(
      check =>
        check.serviceName === serviceName && check.timestamp >= cutoffDate
    );

    const totalChecks = serviceHistory.length;
    const healthyChecks = serviceHistory.filter(
      check => check.status === 'healthy'
    ).length;

    const uptimePercentage =
      totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100;

    const responseTimes = serviceHistory
      .filter(check => check.responseTime !== undefined)
      .map(check => check.responseTime as number);

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const serviceIncidents = this.incidents.filter(
      incident =>
        incident.serviceName === serviceName && incident.startTime >= cutoffDate
    );

    return {
      serviceName,
      uptimePercentage,
      totalChecks,
      healthyChecks,
      avgResponseTime,
      incidents: serviceIncidents,
    };
  }

  getAllIncidents(days: number = 7): Incident[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.incidents
      .filter(incident => incident.startTime >= cutoffDate)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  getRecentIncidents(limit: number = 10): Incident[] {
    return this.incidents
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  clearHistory() {
    this.history = [];
    this.incidents = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const uptimeService = new UptimeService();
