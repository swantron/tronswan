import React, { useState, useEffect } from 'react';

import githubService from '../services/githubService';
import '../styles/GitHubStatus.css';

interface GitHubData {
  user: any;
  repositories: any[];
  actions: any[];
  loading: boolean;
  error: string | null;
}

interface GitHubStatusProps {
  data: GitHubData;
  onDataChange: (data: GitHubData) => void;
}

const GitHubStatus: React.FC<GitHubStatusProps> = ({ data, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'repos'>('actions');

  useEffect(() => {
    loadGitHubData();
  }, []);

  const loadGitHubData = async () => {
    try {
      onDataChange({ ...data, loading: true, error: null });

      const [repositories, actions] = await Promise.all([
        githubService.getAllRepositories(),
        githubService.getWorkflowRuns('tronswan'),
      ]);

      onDataChange({
        ...data,
        user: null, // Don't load user profile
        repositories,
        actions: actions.workflow_runs || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading GitHub data:', error);
      onDataChange({
        ...data,
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to load GitHub data',
      });
    }
  };

  const getStatusIcon = (status: string, conclusion?: string | null) => {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return '✅';
        case 'failure':
          return '❌';
        case 'cancelled':
          return '⏹️';
        case 'skipped':
          return '⏭️';
        case 'timed_out':
          return '⏰';
        case 'action_required':
          return '⚠️';
        default:
          return '❓';
      }
    } else if (status === 'in_progress') {
      return '🔄';
    } else if (status === 'queued') {
      return '⏳';
    }
    return '❓';
  };

  const getStatusClass = (status: string, conclusion?: string | null) => {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return 'status-success';
        case 'failure':
          return 'status-failure';
        case 'cancelled':
          return 'status-cancelled';
        case 'skipped':
        case 'timed_out':
        case 'action_required':
          return 'status-pending';
        default:
          return 'status-unknown';
      }
    } else if (status === 'in_progress' || status === 'queued') {
      return 'status-pending';
    }
    return 'status-unknown';
  };

  const getStatusText = (status: string, conclusion?: string | null) => {
    if (status === 'completed') {
      return conclusion || 'Unknown';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (data.loading) {
    return (
      <div className='github-status loading'>
        <div className='loading-spinner' />
        <p>Loading GitHub data...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className='github-status error'>
        <div className='error-icon'>⚠️</div>
        <p>Error: {data.error}</p>
        <small>Check your GitHub API token configuration</small>
      </div>
    );
  }

  return (
    <div className='github-status'>
      <div className='github-tabs'>
        <button
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions ({data.actions?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'repos' ? 'active' : ''}`}
          onClick={() => setActiveTab('repos')}
        >
          Repos ({data.repositories?.length || 0})
        </button>
      </div>

      <div className='github-content'>
        {activeTab === 'actions' && (
          <div className='actions-tab'>
            <h3>GitHub Actions</h3>
            <div className='actions-header'>
              <p>Recent workflow runs for tronswan repository</p>
            </div>
            {(data.actions?.length || 0) === 0 ? (
              <p className='no-data'>No workflow runs found</p>
            ) : (
              <div className='actions-list'>
                {(data.actions || []).map((action: any) => (
                  <div key={action.id} className='action-item'>
                    <div className='action-header'>
                      <h4>{action.name}</h4>
                      <span
                        className={`status ${getStatusClass(action.status, action.conclusion)}`}
                      >
                        {getStatusIcon(action.status, action.conclusion)}
                        {getStatusText(action.status, action.conclusion)}
                      </span>
                    </div>
                    <div className='action-details'>
                      <p>
                        <strong>Branch:</strong> {action.head_branch || 'N/A'}
                      </p>
                      <p>
                        <strong>Commit:</strong>{' '}
                        {action.head_sha
                          ? action.head_sha.substring(0, 7)
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>Triggered by:</strong>{' '}
                        {action.triggering_actor?.login ||
                          action.actor?.login ||
                          'Unknown'}
                      </p>
                      <p>
                        <strong>Created:</strong>{' '}
                        {action.created_at
                          ? formatDate(action.created_at)
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>Updated:</strong>{' '}
                        {action.updated_at
                          ? formatDate(action.updated_at)
                          : 'N/A'}
                      </p>
                      {action.html_url && (
                        <p>
                          <strong>URL:</strong>{' '}
                          <a
                            href={action.html_url}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            View Details
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'repos' && (
          <div className='repos-tab'>
            <h3>Repositories</h3>
            <div className='repos-header'>
              <p>Recent repositories in swantron organization</p>
            </div>
            {(data.repositories?.length || 0) === 0 ? (
              <p className='no-data'>No repositories found</p>
            ) : (
              <div className='repositories-list'>
                {(data.repositories || []).map((repo: any) => (
                  <div key={repo.id} className='repository-item'>
                    <div className='repo-header'>
                      <h4>{repo.name}</h4>
                      <span
                        className={`status ${repo.private ? 'private' : 'public'}`}
                      >
                        {repo.private ? '🔒' : '🌐'}
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <div className='repo-details'>
                      <p>
                        <strong>Description:</strong>{' '}
                        {repo.description || 'No description'}
                      </p>
                      <p>
                        <strong>Language:</strong> {repo.language || 'Unknown'}
                      </p>
                      <p>
                        <strong>Stars:</strong> {repo.stargazers_count || 0}
                      </p>
                      <p>
                        <strong>Forks:</strong> {repo.forks_count || 0}
                      </p>
                      <p>
                        <strong>Last Updated:</strong>{' '}
                        {repo.updated_at
                          ? formatDate(repo.updated_at)
                          : 'Unknown'}
                      </p>
                      <p>
                        <strong>URL:</strong>{' '}
                        <a
                          href={repo.html_url}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {repo.html_url}
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubStatus;
