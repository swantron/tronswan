import React, { useState, useEffect } from 'react';
import githubService from '../services/githubService';
import '../styles/GitHubStatus.css';

interface GitHubData {
  user: any;
  repositories: any[];
  workflows: any[];
  workflowRuns: any[];
  loading: boolean;
  error: string | null;
}

interface GitHubStatusProps {
  data: GitHubData;
  onDataChange: (data: GitHubData) => void;
}

const GitHubStatus: React.FC<GitHubStatusProps> = ({ data, onDataChange }) => {
  const [selectedRepo, setSelectedRepo] = useState<string>('');

  useEffect(() => {
    loadGitHubData();
  }, []);

  const loadGitHubData = async () => {
    try {
      onDataChange({ ...data, loading: true, error: null });

      const repositories = await githubService.getRepositories();

      onDataChange({
        ...data,
        user: null, // Don't load user profile
        repositories,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading GitHub data:', error);
      onDataChange({
        ...data,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load GitHub data'
      });
    }
  };

  const loadWorkflowData = async (repo: string) => {
    if (!repo) return;

    try {
      const [workflows, workflowRuns] = await Promise.all([
        githubService.getWorkflows(repo),
        githubService.getWorkflowRuns(repo)
      ]);

      onDataChange({
        ...data,
        workflows: workflows.workflows || [],
        workflowRuns: workflowRuns.workflow_runs || [],
        error: null
      });
    } catch (error) {
      console.error('Error loading workflow data:', error);
      onDataChange({
        ...data,
        error: error instanceof Error ? error.message : 'Failed to load workflow data'
      });
    }
  };

  const handleRepoChange = (repo: string) => {
    setSelectedRepo(repo);
    if (repo) {
      loadWorkflowData(repo);
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
      <div className="github-status">
        <div className="github-loading">
          <div className="loading-spinner"></div>
          <p>Loading GitHub data...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="github-status">
        <div className="github-error">
          <h3>⚠️ GitHub Error</h3>
          <p>{data.error}</p>
          <button onClick={loadGitHubData} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="github-status">
      <div className="github-header">
        <h3>📊 GitHub Status</h3>
        <button onClick={loadGitHubData} className="refresh-button">
          🔄 Refresh
        </button>
      </div>


      {data.repositories && data.repositories.length > 0 && (
        <div className="github-repositories">
          <h4>📚 Recent Repositories</h4>
          <div className="repo-list">
            {data.repositories.slice(0, 5).map((repo) => (
              <div key={repo.id} className="repo-item">
                <div className="repo-header">
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="repo-name"
                  >
                    {repo.name}
                  </a>
                  <span className={`repo-visibility ${repo.private ? 'private' : 'public'}`}>
                    {repo.private ? '🔒' : '🌐'}
                  </span>
                </div>
                {repo.description && (
                  <p className="repo-description">{repo.description}</p>
                )}
                <div className="repo-stats">
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🍴 {repo.forks_count}</span>
                  {repo.language && <span>💻 {repo.language}</span>}
                  <span>🕒 {formatDate(repo.updated_at)}</span>
                </div>
                <button 
                  onClick={() => handleRepoChange(repo.name)}
                  className={`workflow-button ${selectedRepo === repo.name ? 'active' : ''}`}
                >
                  {selectedRepo === repo.name ? '📋 Hide Workflows' : '📋 View Workflows'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRepo && data.workflows && data.workflows.length > 0 && (
        <div className="github-workflows">
          <h4>⚙️ Workflows - {selectedRepo}</h4>
          <div className="workflow-list">
            {data.workflows.map((workflow) => (
              <div key={workflow.id} className="workflow-item">
                <div className="workflow-header">
                  <h5>{workflow.name}</h5>
                  <span className={`workflow-state ${workflow.state}`}>
                    {workflow.state === 'active' ? '🟢' : '🔴'} {workflow.state}
                  </span>
                </div>
                <p className="workflow-path">{workflow.path}</p>
                <div className="workflow-actions">
                  <a 
                    href={workflow.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="workflow-link"
                  >
                    🔗 View in GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRepo && data.workflowRuns && data.workflowRuns.length > 0 && (
        <div className="github-workflow-runs">
          <h4>🏃 Recent Workflow Runs - {selectedRepo}</h4>
          <div className="workflow-runs-list">
            {data.workflowRuns.slice(0, 5).map((run) => (
              <div key={run.id} className="workflow-run-item">
                <div className="run-header">
                  <div className="run-info">
                    <h5>{run.name}</h5>
                    <p className="run-branch">🌿 {run.head_branch}</p>
                  </div>
                  <div className="run-status">
                    <span className="status-icon">
                      {getStatusIcon(run.status, run.conclusion)}
                    </span>
                    <span className="status-text">
                      {getStatusText(run.status, run.conclusion)}
                    </span>
                  </div>
                </div>
                <div className="run-details">
                  <p className="run-commit">
                    💬 {run.head_commit.message}
                  </p>
                  <div className="run-meta">
                    <span>👤 {run.head_commit.author.name}</span>
                    <span>🕒 {formatDate(run.created_at)}</span>
                    <span># {run.run_number}</span>
                  </div>
                </div>
                <div className="run-actions">
                  <a 
                    href={run.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="run-link"
                  >
                    🔗 View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubStatus;
