import React, { useState, useEffect } from 'react';

import githubService, {
  type GitHubRepository,
  type GitHubWorkflowRun,
  type GitHubUser,
} from '../../services/githubService';
import { logger } from '../../utils/logger';

import '../../styles/GitHubStatus.css';

const WATCHED_REPOS: { name: string; label: string }[] = [
  { name: 'tronswan', label: 'Tronswan' },
  { name: 'chomptron', label: 'Chomptron' },
  { name: 'wrenchtron', label: 'Wrenchtron' },
  { name: 'swantron', label: 'Swantron' },
  { name: 'mt', label: 'MT' },
  { name: 'uptime-monitor', label: 'Uptime Monitor' },
  { name: 'minifier-cli', label: 'Minifier CLI' },
];

export interface GitHubData {
  user: GitHubUser | null;
  repositories: GitHubRepository[];
  repoActions: Record<string, GitHubWorkflowRun[]>;
  loading: boolean;
  error: string | null;
}

interface GitHubStatusProps {
  data: GitHubData;
  onDataChange: (data: GitHubData) => void;
}

const GitHubStatus: React.FC<GitHubStatusProps> = ({ data, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'repos'>('actions');
  const [activeRepo, setActiveRepo] = useState<string>('tronswan');

  useEffect(() => {
    loadGitHubData();
    // loadGitHubData is defined in the component and shouldn't be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGitHubData = async () => {
    try {
      onDataChange({ ...data, loading: true, error: null });

      const [repositories, ...actionResults] = await Promise.all([
        githubService.getAllRepositories(),
        ...WATCHED_REPOS.map(repo => githubService.getWorkflowRuns(repo.name)),
      ]);

      const repoActions: Record<string, GitHubWorkflowRun[]> = {};
      WATCHED_REPOS.forEach((repo, i) => {
        repoActions[repo.name] = actionResults[i].workflow_runs || [];
      });

      logger.info('GitHub workflow runs loaded', {
        repos: WATCHED_REPOS.map(r => ({
          name: r.name,
          count: repoActions[r.name].length,
        })),
      });

      onDataChange({
        ...data,
        user: null,
        repositories,
        repoActions,
        loading: false,
        error: null,
      });
    } catch (error) {
      logger.error('Error loading GitHub data', { error });
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
          return '';
        case 'failure':
          return '';
        case 'cancelled':
          return '';
        case 'skipped':
          return '';
        case 'timed_out':
          return '';
        case 'action_required':
          return '';
        default:
          return '';
      }
    } else if (status === 'in_progress') {
      return '';
    } else if (status === 'queued') {
      return '';
    }
    return '';
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

  const totalActions = Object.values(data.repoActions || {}).flat().length;
  const activeActions = data.repoActions?.[activeRepo] || [];

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
        <div className='error-icon' />
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
          Actions ({totalActions})
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
            <h3>GitHub Actions & Deployments</h3>

            {/* Repository Selector */}
            <div className='repo-tabs'>
              {WATCHED_REPOS.map(repo => (
                <button
                  key={repo.name}
                  className={`repo-tab ${activeRepo === repo.name ? 'active' : ''}`}
                  onClick={() => setActiveRepo(repo.name)}
                >
                  {repo.label}
                </button>
              ))}
            </div>

            {/* Actions for selected repo */}
            <div className='actions-section'>
              {activeActions.length === 0 ? (
                <p className='no-data'>No workflow runs found</p>
              ) : (
                <div className='actions-list'>
                  {activeActions.map((action: GitHubWorkflowRun) => (
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
                {(data.repositories || []).map((repo: GitHubRepository) => (
                  <div key={repo.id} className='repository-item'>
                    <div className='repo-header'>
                      <h4>{repo.name}</h4>
                      <span
                        className={`status ${repo.private ? 'private' : 'public'}`}
                      >
                        {repo.private ? 'Private' : 'Public'}
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
