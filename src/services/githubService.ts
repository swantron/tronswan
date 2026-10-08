import { logger } from '../utils/logger';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
}

interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state: 'active' | 'disabled' | 'deleted';
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
}

interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  run_number: number;
  event: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null;
  workflow_id: number;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  jobs_url: string;
  logs_url: string;
  check_suite_url: string;
  artifacts_url: string;
  cancel_url: string;
  rerun_url: string;
  workflow_url: string;
  triggering_actor?: {
    login: string;
  };
  actor?: {
    login: string;
  };
  head_commit: {
    id: string;
    tree_id: string;
    message: string;
    timestamp: string;
    author: {
      name: string;
      email: string;
    };
    committer: {
      name: string;
      email: string;
    };
  };
  repository: GitHubRepository;
  head_repository: GitHubRepository;
}

interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

class GitHubService {
  // Requests go through tronswan's own server (server.js), which holds the
  // GitHub token. Never put a token in client code: it ships in the bundle.
  private baseUrl = '/api/github';

  private async makeRequest(endpoint: string): Promise<unknown> {
    const url = `${this.baseUrl}${endpoint}`;

    logger.debug('Making GitHub API request', {
      endpoint,
      url,
      timestamp: new Date().toISOString(),
    });

    const response = await logger.measureAsync(
      'github-api-call',
      async () => {
        return await fetch(url, {
          headers: { Accept: 'application/json' },
        });
      },
      { endpoint }
    );

    if (!response.ok) {
      logger.error('GitHub API request failed', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        url,
      });
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    logger.info('GitHub API request successful', {
      endpoint,
      status: response.status,
      url,
    });

    return response.json();
  }

  async getAllRepositories(): Promise<GitHubRepository[]> {
    logger.info('Fetching all GitHub repositories', {
      sort: 'updated',
      perPage: 10,
      timestamp: new Date().toISOString(),
    });

    const repos = (await this.makeRequest('/repos')) as GitHubRepository[];

    logger.info('All GitHub repositories fetched successfully', {
      repositoryCount: repos.length,
      repositories: repos.map(r => ({
        id: r.id,
        name: r.name,
        private: r.private,
      })),
      timestamp: new Date().toISOString(),
    });

    return repos;
  }

  async getWorkflowRuns(
    repo: string
  ): Promise<{ workflow_runs: GitHubWorkflowRun[] }> {
    return this.makeRequest(
      `/repos/${encodeURIComponent(repo)}/runs`
    ) as Promise<{ workflow_runs: GitHubWorkflowRun[] }>;
  }
}

export type { GitHubRepository, GitHubWorkflowRun, GitHubUser, GitHubWorkflow };

export default new GitHubService();
