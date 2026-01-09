import React, { useState, useEffect } from 'react';

import { uptimeService, Incident } from '../../services/uptimeService';
import '../../styles/IncidentHistory.css';

interface IncidentHistoryProps {
  days?: number;
}

function IncidentHistory({ days = 7 }: IncidentHistoryProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const allIncidents = uptimeService.getAllIncidents(days);
    setIncidents(allIncidents);
  }, [days]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
  };

  const resolvedIncidents = incidents.filter(i => i.resolved);
  const activeIncidents = incidents.filter(i => !i.resolved);

  return (
    <div className='incident-history'>
      <div className='incident-header'>
        <h2>Incident History</h2>
        <span className='incident-count'>
          {incidents.length === 0 ? (
            <span className='no-incidents'>
              ✓ No incidents in last {days} days
            </span>
          ) : (
            <>
              {activeIncidents.length > 0 && (
                <span className='active-incidents'>
                  {activeIncidents.length} active
                </span>
              )}
              {resolvedIncidents.length > 0 && (
                <span className='resolved-incidents'>
                  {resolvedIncidents.length} resolved
                </span>
              )}
            </>
          )}
        </span>
        {incidents.length > 3 && (
          <button
            className='expand-toggle'
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼ Show less' : '▶ Show all'}
          </button>
        )}
      </div>

      {incidents.length > 0 && (
        <div className='incident-timeline'>
          {(expanded ? incidents : incidents.slice(0, 3)).map(incident => (
            <div
              key={incident.id}
              className={`incident-item ${incident.resolved ? 'resolved' : 'active'} status-${incident.status}`}
            >
              <div className='incident-icon'>
                {incident.resolved
                  ? '✓'
                  : incident.status === 'down'
                    ? '🔴'
                    : '⚠️'}
              </div>
              <div className='incident-details'>
                <div className='incident-service'>{incident.serviceName}</div>
                <div className='incident-status'>
                  {incident.resolved && incident.endTime ? (
                    <span className='status-resolved'>
                      Resolved {formatTimestamp(incident.endTime)}
                    </span>
                  ) : (
                    <span className='status-ongoing'>
                      {incident.status === 'down' ? 'Down' : 'Degraded'} since{' '}
                      {formatTimestamp(incident.startTime)}
                    </span>
                  )}
                </div>
                {incident.duration !== undefined && (
                  <div className='incident-duration'>
                    Duration: {formatDuration(incident.duration)}
                  </div>
                )}
                {!incident.resolved && (
                  <div className='incident-duration'>
                    Ongoing for:{' '}
                    {formatDuration(Date.now() - incident.startTime.getTime())}
                  </div>
                )}
              </div>
              <div className='incident-timestamp'>
                {incident.startTime.toLocaleDateString()}{' '}
                {incident.startTime.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IncidentHistory;
