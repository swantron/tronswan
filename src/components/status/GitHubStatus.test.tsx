import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import githubService from '../../services/githubService';

import GitHubStatus from './GitHubStatus';

// Mock the CSS import
vi.mock('../../styles/GitHubStatus.css', () => ({}));

// Mock the githubService
vi.mock('../../services/githubService', () => ({
  default: {
    getAllRepositories: vi.fn(),
    getWorkflowRuns: vi.fn(),
  },
}));

describe('GitHubStatus Component', () => {
  const mockRepositoryData = [
    {
      id: 123456,
      name: 'tronswan',
      description: 'A React application',
      language: 'TypeScript',
      stargazers_count: 5,
      forks_count: 2,
      private: false,
      html_url: 'https://github.com/swantron/tronswan',
      updated_at: '2024-01-15T10:30:00Z',
    },
  ];

  const mockWorkflowRuns = {
    workflow_runs: [
      {
        id: 123456789,
        name: 'CI/CD Pipeline',
        status: 'completed',
        conclusion: 'success',
        head_branch: 'main',
        head_sha: 'abc123def456',
        triggering_actor: { login: 'swantron' },
        actor: { login: 'swantron' },
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:35:00Z',
        html_url: 'https://github.com/swantron/tronswan/actions/runs/123456789',
      },
    ],
  };

  const defaultProps = {
    data: {
      user: null,
      repositories: [],
      tronswanActions: [],
      chomptronActions: [],
      loading: false,
      error: null,
    },
    onDataChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (githubService.getAllRepositories as vi.Mock).mockResolvedValue(
      mockRepositoryData
    );
    (githubService.getWorkflowRuns as vi.Mock).mockResolvedValue(
      mockWorkflowRuns
    );
  });

  describe('Component Initialization', () => {
    it('loads GitHub data on mount', async () => {
      render(<GitHubStatus {...defaultProps} />);

      await waitFor(() => {
        expect(githubService.getAllRepositories).toHaveBeenCalled();
        expect(githubService.getWorkflowRuns).toHaveBeenCalledWith('tronswan');
        expect(githubService.getWorkflowRuns).toHaveBeenCalledWith('chomptron');
      });
    });

    it('calls onDataChange with loading state initially', async () => {
      render(<GitHubStatus {...defaultProps} />);

      await waitFor(() => {
        expect(defaultProps.onDataChange).toHaveBeenCalledWith({
          ...defaultProps.data,
          loading: true,
          error: null,
        });
      });
    });
  });

  describe('Loading State', () => {
    it('renders loading spinner when loading', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{ ...defaultProps.data, loading: true }}
        />
      );

      expect(screen.getByText('Loading GitHub data...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error message when error occurs', () => {
      const errorMessage = 'API Error';
      render(
        <GitHubStatus
          {...defaultProps}
          data={{ ...defaultProps.data, error: errorMessage }}
        />
      );

      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      expect(
        screen.getByText('Check your GitHub API token configuration')
      ).toBeInTheDocument();
    });

    it('handles error during data loading', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      (githubService.getAllRepositories as vi.Mock).mockRejectedValue(
        new Error('Network Error')
      );

      render(<GitHubStatus {...defaultProps} />);

      await waitFor(() => {
        expect(defaultProps.onDataChange).toHaveBeenCalledWith({
          ...defaultProps.data,
          loading: false,
          error: 'Network Error',
        });
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Tab Navigation', () => {
    it('renders both tabs with correct labels', () => {
      render(<GitHubStatus {...defaultProps} />);

      expect(screen.getByText('Actions (0)')).toBeInTheDocument();
      expect(screen.getByText('Repos (0)')).toBeInTheDocument();
    });

    it('shows correct counts in tabs', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            repositories: mockRepositoryData,
            tronswanActions: mockWorkflowRuns.workflow_runs,
          }}
        />
      );

      expect(screen.getByText('Actions (1)')).toBeInTheDocument();
      expect(screen.getByText('Repos (1)')).toBeInTheDocument();
    });

    it('switches to repos tab when clicked', () => {
      render(<GitHubStatus {...defaultProps} />);

      const reposTab = screen.getByText('Repos (0)');
      fireEvent.click(reposTab);

      expect(reposTab).toHaveClass('active');
      expect(screen.getByText('Actions (0)')).not.toHaveClass('active');
    });

    it('switches to actions tab when clicked', () => {
      render(<GitHubStatus {...defaultProps} />);

      const actionsTab = screen.getByText('Actions (0)');
      fireEvent.click(actionsTab);

      expect(actionsTab).toHaveClass('active');
      expect(screen.getByText('Repos (0)')).not.toHaveClass('active');
    });
  });

  describe('Actions Tab', () => {
    it('renders no actions message when no actions', () => {
      render(<GitHubStatus {...defaultProps} />);

      const noDataMessages = screen.getAllByText('No workflow runs found');
      expect(noDataMessages).toHaveLength(2); // One for tronswan, one for chomptron
    });

    it('renders actions list when actions are available', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            tronswanActions: mockWorkflowRuns.workflow_runs,
          }}
        />
      );

      expect(screen.getByText('CI/CD Pipeline')).toBeInTheDocument();
    });

    it('renders action status icons correctly', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            tronswanActions: mockWorkflowRuns.workflow_runs,
          }}
        />
      );

      // Check for success icon
      expect(screen.getByText(/✅/)).toBeInTheDocument();
    });

    it('renders action details correctly', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            tronswanActions: mockWorkflowRuns.workflow_runs,
          }}
        />
      );

      expect(screen.getByText('main')).toBeInTheDocument();
      expect(screen.getByText('abc123d')).toBeInTheDocument();
      expect(screen.getByText('swantron')).toBeInTheDocument();
    });

    it('renders action links correctly', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            tronswanActions: mockWorkflowRuns.workflow_runs,
          }}
        />
      );

      const viewDetailsLink = screen.getByRole('link', {
        name: 'View Details',
      });
      expect(viewDetailsLink).toHaveAttribute(
        'href',
        'https://github.com/swantron/tronswan/actions/runs/123456789'
      );
      expect(viewDetailsLink).toHaveAttribute('target', '_blank');
      expect(viewDetailsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Repos Tab', () => {
    it('renders no repos message when no repositories', () => {
      render(<GitHubStatus {...defaultProps} />);

      // Switch to repos tab
      fireEvent.click(screen.getByText('Repos (0)'));

      expect(screen.getByText('No repositories found')).toBeInTheDocument();
    });

    it('renders repositories list when repositories are available', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            repositories: mockRepositoryData,
          }}
        />
      );

      // Switch to repos tab
      fireEvent.click(screen.getByText('Repos (1)'));

      expect(screen.getByText('tronswan')).toBeInTheDocument();
    });

    it('renders repository visibility correctly', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            repositories: mockRepositoryData,
          }}
        />
      );

      // Switch to repos tab
      fireEvent.click(screen.getByText('Repos (1)'));

      expect(screen.getByText(/🌐/)).toBeInTheDocument();
      expect(screen.getByText(/Public/)).toBeInTheDocument();
    });

    it('renders repository details correctly', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            repositories: mockRepositoryData,
          }}
        />
      );

      // Switch to repos tab
      fireEvent.click(screen.getByText('Repos (1)'));

      expect(screen.getByText('A React application')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('renders repository links correctly', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            repositories: mockRepositoryData,
          }}
        />
      );

      // Switch to repos tab
      fireEvent.click(screen.getByText('Repos (1)'));

      const repoLink = screen.getByRole('link', {
        name: 'https://github.com/swantron/tronswan',
      });
      expect(repoLink).toHaveAttribute(
        'href',
        'https://github.com/swantron/tronswan'
      );
      expect(repoLink).toHaveAttribute('target', '_blank');
      expect(repoLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty arrays', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            repositories: [],
            actions: [],
          }}
        />
      );

      expect(screen.getByText('Actions (0)')).toBeInTheDocument();
      expect(screen.getByText('Repos (0)')).toBeInTheDocument();
    });

    it('handles null arrays', () => {
      render(
        <GitHubStatus
          {...defaultProps}
          data={{
            ...defaultProps.data,
            repositories: null,
            actions: null,
          }}
        />
      );

      expect(screen.getByText('Actions (0)')).toBeInTheDocument();
      expect(screen.getByText('Repos (0)')).toBeInTheDocument();
    });
  });
});
