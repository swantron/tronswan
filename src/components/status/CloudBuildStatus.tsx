import React, { useState, useEffect } from 'react';

import googleCloudBuildService from '../../services/googleCloudBuildService';
import { logger } from '../../utils/logger';
import '../../styles/CloudBuildStatus.css';

interface CloudBuild {
  id: string;
  projectId: string;
  status: 'QUEUED' | 'WORKING' | 'SUCCESS' | 'FAILURE' | 'CANCELLED' | 'TIMEOUT';
  createTime: string;
  startTime?: string;
  finishTime?: string;
  logUrl: string;
  sourceProvenance?: {
    resolvedRepoSource?: {
      commitSha: string;
      branchName?: string;
      tagName?: string;
    };
  };
}

interface CloudBuildData {
  builds: CloudBuild[];
  loading: boolean;
  error: string | null;
}

interface CloudBuildStatusProps {
  data: CloudBuildData;
  onDataChange: (data: CloudBuildData) => void;
}

const CloudBuildStatus: React.FC<CloudBuildStatusProps> = ({ data, onDataChange }) => {
  useEffect(() => {
    loadCloudBuilds();
  }, []);

  const loadCloudBuilds = async () => {
    try {
      onDataChange({ ...data, loading: true, error: null });

      const builds = await googleCloudBuildService.getRecentBuilds(10);

      onDataChange({
        builds,
        loading: false,
        error: null,
      });
    } catch (error) {
      logger.error('Error loading Cloud Build data', { error });
      onDataChange({
        ...data,
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to load Cloud Build data',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '✅';
      case 'FAILURE':
        return '❌';
      case 'CANCELLED':
        return '⏹️';
      case 'TIMEOUT':
        return '⏰';
      case 'WORKING':
        return '🔄';
      case 'QUEUED':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'status-success';
      case 'FAILURE':
        return 'status-failure';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'TIMEOUT':
      case 'WORKING':
      case 'QUEUED':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDuration = (startTime?: string, finishTime?: string) => {
    if (!startTime || !finishTime) return 'N/A';
    const duration = new Date(finishTime).getTime() - new Date(startTime).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
  };

  if (data.loading) {
    return (
      <div className='cloudbuild-status loading'>
        <div className='loading-spinner' />
        <p>Loading Cloud Build data...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className='cloudbuild-status error'>
        <h3>Google Cloud Build - Chomptron</h3>
        <div className='error-content'>
          <div className='error-icon'>ℹ️</div>
          <p><strong>Cloud Build requires OAuth2 authentication</strong></p>
          <p>{data.error}</p>
          <div className='error-details'>
            <p>To view Cloud Build history:</p>
            <ul>
              <li>Use the <a href="https://console.cloud.google.com/cloud-build/builds?project=chomptron" target="_blank" rel="noopener noreferrer">GCP Console</a></li>
              <li>Or set up OAuth2 credentials for this application</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='cloudbuild-status'>
      <h3>Google Cloud Build - Chomptron</h3>
      <div className='cloudbuild-header'>
        <p>Recent builds from GCP Cloud Build</p>
      </div>
      
      {(data.builds?.length || 0) === 0 ? (
        <p className='no-data'>No builds found</p>
      ) : (
        <div className='builds-list'>
          {(data.builds || []).map((build: CloudBuild) => (
            <div key={build.id} className='build-item'>
              <div className='build-header'>
                <h4>Build {build.id.substring(0, 8)}</h4>
                <span className={`status ${getStatusClass(build.status)}`}>
                  {getStatusIcon(build.status)}
                  {build.status}
                </span>
              </div>
              <div className='build-details'>
                {build.sourceProvenance?.resolvedRepoSource?.branchName && (
                  <p>
                    <strong>Branch:</strong> {build.sourceProvenance.resolvedRepoSource.branchName}
                  </p>
                )}
                {build.sourceProvenance?.resolvedRepoSource?.commitSha && (
                  <p>
                    <strong>Commit:</strong>{' '}
                    {build.sourceProvenance.resolvedRepoSource.commitSha.substring(0, 7)}
                  </p>
                )}
                <p>
                  <strong>Created:</strong> {formatDate(build.createTime)}
                </p>
                {build.startTime && build.finishTime && (
                  <p>
                    <strong>Duration:</strong> {getDuration(build.startTime, build.finishTime)}
                  </p>
                )}
                <p>
                  <strong>Logs:</strong>{' '}
                  <a
                    href={build.logUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    View Logs
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudBuildStatus;
