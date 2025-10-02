import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock runtimeConfig before importing
vi.mock('../utils/runtimeConfig', () => ({
  runtimeConfig: {
    get: vi.fn(() => 'test-token'),
    getWithDefault: vi.fn(() => 'swantron'),
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Import after mocking
import githubService from './githubService';

describe('GitHubService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('should fetch user data successfully', async () => {
      const mockUser = {
        login: 'swantron',
        id: 12345,
        node_id: 'test-node-id',
        avatar_url: 'https://avatar.example.com',
        gravatar_id: null,
        url: 'https://api.github.com/users/swantron',
        html_url: 'https://github.com/swantron',
        followers_url: 'https://api.github.com/users/swantron/followers',
        following_url: 'https://api.github.com/users/swantron/following',
        gists_url: 'https://api.github.com/users/swantron/gists',
        starred_url: 'https://api.github.com/users/swantron/starred',
        subscriptions_url:
          'https://api.github.com/users/swantron/subscriptions',
        organizations_url: 'https://api.github.com/users/swantron/orgs',
        repos_url: 'https://api.github.com/users/swantron/repos',
        events_url: 'https://api.github.com/users/swantron/events',
        received_events_url:
          'https://api.github.com/users/swantron/received_events',
        type: 'User',
        site_admin: false,
        name: 'Swantron',
        company: null,
        blog: 'https://swantron.com',
        location: 'Bozeman, MT',
        email: null,
        hireable: null,
        bio: 'Full stack developer',
        twitter_username: null,
        public_repos: 50,
        public_gists: 10,
        followers: 100,
        following: 50,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      const result = await githubService.getUser();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token test-token',
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TronSwan-Health-Monitor',
          }),
        })
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('getRepositories', () => {
    it('should fetch specific tronswan repository', async () => {
      const mockRepo = {
        id: 12345,
        name: 'tronswan',
        full_name: 'swantron/tronswan',
        private: false,
        html_url: 'https://github.com/swantron/tronswan',
        description: 'TronSwan website',
        language: 'TypeScript',
        stargazers_count: 10,
        forks_count: 5,
        updated_at: '2023-01-01T00:00:00Z',
        default_branch: 'main',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepo),
      } as Response);

      const result = await githubService.getRepositories();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/tronswan',
        expect.any(Object)
      );
      expect(result).toEqual([mockRepo]);
    });
  });

  describe('getAllRepositories', () => {
    it('should fetch all repositories for the owner', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'swantron/repo1',
          private: false,
          html_url: 'https://github.com/swantron/repo1',
          description: 'Repo 1',
          language: 'JavaScript',
          stargazers_count: 5,
          forks_count: 2,
          updated_at: '2023-01-01T00:00:00Z',
          default_branch: 'main',
        },
        {
          id: 2,
          name: 'repo2',
          full_name: 'swantron/repo2',
          private: true,
          html_url: 'https://github.com/swantron/repo2',
          description: 'Repo 2',
          language: 'Python',
          stargazers_count: 3,
          forks_count: 1,
          updated_at: '2023-01-02T00:00:00Z',
          default_branch: 'main',
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepos),
      } as Response);

      const result = await githubService.getAllRepositories();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/users/swantron/repos?sort=updated&per_page=10',
        expect.any(Object)
      );
      expect(result).toEqual(mockRepos);
    });
  });

  describe('getRepository', () => {
    it('should fetch specific repository by name', async () => {
      const mockRepo = {
        id: 12345,
        name: 'test-repo',
        full_name: 'swantron/test-repo',
        private: false,
        html_url: 'https://github.com/swantron/test-repo',
        description: 'Test repository',
        language: 'TypeScript',
        stargazers_count: 0,
        forks_count: 0,
        updated_at: '2023-01-01T00:00:00Z',
        default_branch: 'main',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepo),
      } as Response);

      const result = await githubService.getRepository('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo',
        expect.any(Object)
      );
      expect(result).toEqual(mockRepo);
    });
  });

  describe('getWorkflows', () => {
    it('should fetch workflows for a repository', async () => {
      const mockWorkflows = {
        workflows: [
          {
            id: 1,
            name: 'CI/CD',
            path: '.github/workflows/ci.yml',
            state: 'active' as const,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            url: 'https://api.github.com/repos/swantron/test-repo/actions/workflows/1',
            html_url:
              'https://github.com/swantron/test-repo/actions/workflows/ci.yml',
            badge_url:
              'https://github.com/swantron/test-repo/workflows/CI/CD/badge.svg',
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkflows),
      } as Response);

      const result = await githubService.getWorkflows('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/actions/workflows',
        expect.any(Object)
      );
      expect(result).toEqual(mockWorkflows);
    });
  });

  describe('getWorkflowRuns', () => {
    it('should fetch workflow runs without workflow ID', async () => {
      const mockRuns = {
        workflow_runs: [
          {
            id: 1,
            name: 'CI/CD',
            head_branch: 'main',
            head_sha: 'abc123',
            run_number: 1,
            event: 'push',
            status: 'completed' as const,
            conclusion: 'success' as const,
            workflow_id: 1,
            url: 'https://api.github.com/repos/swantron/test-repo/actions/runs/1',
            html_url: 'https://github.com/swantron/test-repo/actions/runs/1',
            jobs_url:
              'https://api.github.com/repos/swantron/test-repo/actions/runs/1/jobs',
            logs_url:
              'https://api.github.com/repos/swantron/test-repo/actions/runs/1/logs',
            check_suite_url:
              'https://api.github.com/repos/swantron/test-repo/check-suites/1',
            artifacts_url:
              'https://api.github.com/repos/swantron/test-repo/actions/runs/1/artifacts',
            cancel_url:
              'https://api.github.com/repos/swantron/test-repo/actions/runs/1/cancel',
            rerun_url:
              'https://api.github.com/repos/swantron/test-repo/actions/runs/1/rerun',
            workflow_url:
              'https://api.github.com/repos/swantron/test-repo/actions/workflows/1',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            head_commit: {
              id: 'abc123',
              tree_id: 'def456',
              message: 'Test commit',
              timestamp: '2023-01-01T00:00:00Z',
              author: { name: 'Swantron', email: 'swantron@example.com' },
              committer: { name: 'Swantron', email: 'swantron@example.com' },
            },
            repository: {
              id: 12345,
              name: 'test-repo',
              full_name: 'swantron/test-repo',
              private: false,
              html_url: 'https://github.com/swantron/test-repo',
              description: 'Test repository',
              language: 'TypeScript',
              stargazers_count: 0,
              forks_count: 0,
              updated_at: '2023-01-01T00:00:00Z',
              default_branch: 'main',
            },
            head_repository: {
              id: 12345,
              name: 'test-repo',
              full_name: 'swantron/test-repo',
              private: false,
              html_url: 'https://github.com/swantron/test-repo',
              description: 'Test repository',
              language: 'TypeScript',
              stargazers_count: 0,
              forks_count: 0,
              updated_at: '2023-01-01T00:00:00Z',
              default_branch: 'main',
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRuns),
      } as Response);

      const result = await githubService.getWorkflowRuns('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/actions/runs?per_page=10',
        expect.any(Object)
      );
      expect(result).toEqual(mockRuns);
    });

    it('should fetch workflow runs with workflow ID', async () => {
      const mockRuns = { workflow_runs: [] };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRuns),
      } as Response);

      const result = await githubService.getWorkflowRuns('test-repo', 123);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/actions/workflows/123/runs?per_page=10',
        expect.any(Object)
      );
      expect(result).toEqual(mockRuns);
    });
  });

  describe('getWorkflowRun', () => {
    it('should fetch specific workflow run', async () => {
      const mockRun = {
        id: 1,
        name: 'CI/CD',
        head_branch: 'main',
        head_sha: 'abc123',
        run_number: 1,
        event: 'push',
        status: 'completed' as const,
        conclusion: 'success' as const,
        workflow_id: 1,
        url: 'https://api.github.com/repos/swantron/test-repo/actions/runs/1',
        html_url: 'https://github.com/swantron/test-repo/actions/runs/1',
        jobs_url:
          'https://api.github.com/repos/swantron/test-repo/actions/runs/1/jobs',
        logs_url:
          'https://api.github.com/repos/swantron/test-repo/actions/runs/1/logs',
        check_suite_url:
          'https://api.github.com/repos/swantron/test-repo/check-suites/1',
        artifacts_url:
          'https://api.github.com/repos/swantron/test-repo/actions/runs/1/artifacts',
        cancel_url:
          'https://api.github.com/repos/swantron/test-repo/actions/runs/1/cancel',
        rerun_url:
          'https://api.github.com/repos/swantron/test-repo/actions/runs/1/rerun',
        workflow_url:
          'https://api.github.com/repos/swantron/test-repo/actions/workflows/1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        head_commit: {
          id: 'abc123',
          tree_id: 'def456',
          message: 'Test commit',
          timestamp: '2023-01-01T00:00:00Z',
          author: { name: 'Swantron', email: 'swantron@example.com' },
          committer: { name: 'Swantron', email: 'swantron@example.com' },
        },
        repository: {
          id: 12345,
          name: 'test-repo',
          full_name: 'swantron/test-repo',
          private: false,
          html_url: 'https://github.com/swantron/test-repo',
          description: 'Test repository',
          language: 'TypeScript',
          stargazers_count: 0,
          forks_count: 0,
          updated_at: '2023-01-01T00:00:00Z',
          default_branch: 'main',
        },
        head_repository: {
          id: 12345,
          name: 'test-repo',
          full_name: 'swantron/test-repo',
          private: false,
          html_url: 'https://github.com/swantron/test-repo',
          description: 'Test repository',
          language: 'TypeScript',
          stargazers_count: 0,
          forks_count: 0,
          updated_at: '2023-01-01T00:00:00Z',
          default_branch: 'main',
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRun),
      } as Response);

      const result = await githubService.getWorkflowRun('test-repo', 1);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/actions/runs/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockRun);
    });
  });

  describe('getWorkflowRunJobs', () => {
    it('should fetch jobs for a workflow run', async () => {
      const mockJobs = {
        jobs: [
          {
            id: 1,
            run_id: 1,
            run_url:
              'https://api.github.com/repos/swantron/test-repo/actions/runs/1',
            node_id: 'test-node-id',
            head_sha: 'abc123',
            url: 'https://api.github.com/repos/swantron/test-repo/actions/jobs/1',
            html_url:
              'https://github.com/swantron/test-repo/actions/runs/1/jobs/1',
            status: 'completed',
            conclusion: 'success',
            started_at: '2023-01-01T00:00:00Z',
            completed_at: '2023-01-01T00:05:00Z',
            name: 'test-job',
            steps: [],
            check_run_url:
              'https://api.github.com/repos/swantron/test-repo/check-runs/1',
            labels: ['ubuntu-latest'],
            runner_id: 1,
            runner_name: 'GitHub Actions 1',
            runner_group_id: 1,
            runner_group_name: 'GitHub Actions',
            workflow_name: 'CI/CD',
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJobs),
      } as Response);

      const result = await githubService.getWorkflowRunJobs('test-repo', 1);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/actions/runs/1/jobs',
        expect.any(Object)
      );
      expect(result).toEqual(mockJobs);
    });
  });

  describe('getRepositoryCommits', () => {
    it('should fetch commits with default branch', async () => {
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            message: 'Test commit',
            author: {
              name: 'Swantron',
              email: 'swantron@example.com',
              date: '2023-01-01T00:00:00Z',
            },
            committer: {
              name: 'Swantron',
              email: 'swantron@example.com',
              date: '2023-01-01T00:00:00Z',
            },
          },
          author: { login: 'swantron', id: 12345 },
          committer: { login: 'swantron', id: 12345 },
          parents: [],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCommits),
      } as Response);

      const result = await githubService.getRepositoryCommits('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/commits?sha=main&per_page=5',
        expect.any(Object)
      );
      expect(result).toEqual(mockCommits);
    });

    it('should fetch commits with specific branch', async () => {
      const mockCommits = [];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCommits),
      } as Response);

      const result = await githubService.getRepositoryCommits(
        'test-repo',
        'develop'
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/commits?sha=develop&per_page=5',
        expect.any(Object)
      );
      expect(result).toEqual(mockCommits);
    });
  });

  describe('getRepositoryBranches', () => {
    it('should fetch repository branches', async () => {
      const mockBranches = [
        {
          name: 'main',
          commit: {
            sha: 'abc123',
            url: 'https://api.github.com/repos/swantron/test-repo/commits/abc123',
          },
          protected: false,
        },
        {
          name: 'develop',
          commit: {
            sha: 'def456',
            url: 'https://api.github.com/repos/swantron/test-repo/commits/def456',
          },
          protected: false,
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBranches),
      } as Response);

      const result = await githubService.getRepositoryBranches('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/branches',
        expect.any(Object)
      );
      expect(result).toEqual(mockBranches);
    });
  });

  describe('getRepositoryIssues', () => {
    it('should fetch open issues by default', async () => {
      const mockIssues = [
        {
          id: 1,
          number: 1,
          title: 'Test issue',
          state: 'open',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          user: { login: 'swantron', id: 12345 },
          labels: [],
          assignees: [],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockIssues),
      } as Response);

      const result = await githubService.getRepositoryIssues('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/issues?state=open&per_page=10',
        expect.any(Object)
      );
      expect(result).toEqual(mockIssues);
    });

    it('should fetch issues with specific state', async () => {
      const mockIssues = [];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockIssues),
      } as Response);

      const result = await githubService.getRepositoryIssues(
        'test-repo',
        'closed'
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/issues?state=closed&per_page=10',
        expect.any(Object)
      );
      expect(result).toEqual(mockIssues);
    });
  });

  describe('getRepositoryPullRequests', () => {
    it('should fetch open pull requests by default', async () => {
      const mockPRs = [
        {
          id: 1,
          number: 1,
          title: 'Test PR',
          state: 'open',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          user: { login: 'swantron', id: 12345 },
          head: { ref: 'feature-branch', sha: 'abc123' },
          base: { ref: 'main', sha: 'def456' },
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPRs),
      } as Response);

      const result = await githubService.getRepositoryPullRequests('test-repo');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/pulls?state=open&per_page=10',
        expect.any(Object)
      );
      expect(result).toEqual(mockPRs);
    });

    it('should fetch pull requests with specific state', async () => {
      const mockPRs = [];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPRs),
      } as Response);

      const result = await githubService.getRepositoryPullRequests(
        'test-repo',
        'all'
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/swantron/test-repo/pulls?state=all&per_page=10',
        expect.any(Object)
      );
      expect(result).toEqual(mockPRs);
    });
  });
});
