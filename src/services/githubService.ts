import { logger } from '../utils/logger';
import { runtimeConfig } from '../utils/runtimeConfig';

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

interface GitHubJob {
  id: number;
  run_id: number;
  run_url: string;
  node_id: string;
  head_sha: string;
  url: string;
  html_url: string;
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
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  name: string;
  steps: Array<{
    name: string;
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
    number: number;
    started_at: string | null;
    completed_at: string | null;
  }>;
  check_run_url: string;
  labels: string[];
  runner_id: number | null;
  runner_name: string | null;
  runner_group_id: number | null;
  runner_group_name: string | null;
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

interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
}

interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection: {
    enabled: boolean;
    required_status_checks: {
      enforcement_level: string;
      contexts: string[];
    };
  } | null;
}

interface GitHubIssue {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  state: 'open' | 'closed';
  title: string;
  body: string | null;
  user: GitHubUser;
  labels: Array<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string | null;
    color: string;
    default: boolean;
  }>;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  milestone: {
    url: string;
    html_url: string;
    labels_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    description: string | null;
    creator: GitHubUser;
    open_issues: number;
    closed_issues: number;
    state: 'open' | 'closed';
    created_at: string;
    updated_at: string;
    due_on: string | null;
    closed_at: string | null;
  } | null;
  locked: boolean;
  active_lock_reason: string | null;
  comments: number;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface GitHubPullRequest {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  number: number;
  state: 'open' | 'closed';
  locked: boolean;
  title: string;
  user: GitHubUser;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: Array<{
    id: number;
    node_id: string;
    url: string;
    html_url: string;
    name: string;
    slug: string;
    description: string | null;
    privacy: string;
    permission: string;
    members_url: string;
    repositories_url: string;
    parent: {
      id: number;
      node_id: string;
      url: string;
      html_url: string;
      name: string;
      slug: string;
      description: string | null;
      privacy: string;
      permission: string;
      members_url: string;
      repositories_url: string;
    } | null;
  }>;
  labels: Array<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string | null;
    color: string;
    default: boolean;
  }>;
  milestone: {
    url: string;
    html_url: string;
    labels_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    description: string | null;
    creator: GitHubUser;
    open_issues: number;
    closed_issues: number;
    state: 'open' | 'closed';
    created_at: string;
    updated_at: string;
    due_on: string | null;
    closed_at: string | null;
  } | null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubUser;
    repo: GitHubRepository;
  };
  base: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubUser;
    repo: GitHubRepository;
  };
  _links: {
    self: {
      href: string;
    };
    html: {
      href: string;
    };
    issue: {
      href: string;
    };
    comments: {
      href: string;
    };
    review_comments: {
      href: string;
    };
    review_comment: {
      href: string;
    };
    commits: {
      href: string;
    };
    statuses: {
      href: string;
    };
  };
  author_association: string;
  auto_merge: boolean | null;
  active_lock_reason: string | null;
}

class GitHubService {
  private baseUrl: string;
  private token: string;
  private owner: string;

  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.token = runtimeConfig.get('VITE_GITHUB_TOKEN');
    this.owner = runtimeConfig.getWithDefault('VITE_GITHUB_OWNER', 'swantron');
  }

  private async makeRequest(endpoint: string): Promise<unknown> {
    if (!this.token) {
      logger.error('GitHub token not configured', { endpoint });
      throw new Error('GitHub token not configured');
    }

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
          headers: {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'TronSwan-Health-Monitor',
          },
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

  async getUser(): Promise<GitHubUser> {
    logger.info('Fetching GitHub user data', {
      timestamp: new Date().toISOString(),
    });

    const user = (await this.makeRequest('/user')) as GitHubUser;

    logger.info('GitHub user data fetched successfully', {
      userId: user.id,
      username: user.login,
      name: user.name,
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    logger.info('Fetching GitHub repositories', {
      owner: this.owner,
      repository: 'tronswan',
      timestamp: new Date().toISOString(),
    });

    // Only get the specific tronswan repository
    const repo = (await this.makeRequest(
      `/repos/${this.owner}/tronswan`
    )) as GitHubRepository;

    logger.info('GitHub repository data fetched successfully', {
      repositoryId: repo.id,
      repositoryName: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      timestamp: new Date().toISOString(),
    });

    return [repo];
  }

  async getAllRepositories(): Promise<GitHubRepository[]> {
    logger.info('Fetching all GitHub repositories', {
      owner: this.owner,
      sort: 'updated',
      perPage: 10,
      timestamp: new Date().toISOString(),
    });

    // Get all repositories for the swantron organization
    const repos = (await this.makeRequest(
      `/users/${this.owner}/repos?sort=updated&per_page=10`
    )) as GitHubRepository[];

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

  async getRepository(name: string): Promise<GitHubRepository> {
    return this.makeRequest(
      `/repos/${this.owner}/${name}`
    ) as Promise<GitHubRepository>;
  }

  async getWorkflows(repo: string): Promise<{ workflows: GitHubWorkflow[] }> {
    return this.makeRequest(
      `/repos/${this.owner}/${repo}/actions/workflows`
    ) as Promise<{ workflows: GitHubWorkflow[] }>;
  }

  async getWorkflowRuns(
    repo: string,
    workflowId?: number
  ): Promise<{ workflow_runs: GitHubWorkflowRun[] }> {
    const endpoint = workflowId
      ? `/repos/${this.owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=10`
      : `/repos/${this.owner}/${repo}/actions/runs?per_page=10`;
    return this.makeRequest(endpoint) as Promise<{
      workflow_runs: GitHubWorkflowRun[];
    }>;
  }

  async getWorkflowRun(
    repo: string,
    runId: number
  ): Promise<GitHubWorkflowRun> {
    return this.makeRequest(
      `/repos/${this.owner}/${repo}/actions/runs/${runId}`
    ) as Promise<GitHubWorkflowRun>;
  }

  async getWorkflowRunJobs(
    repo: string,
    runId: number
  ): Promise<{ jobs: GitHubJob[] }> {
    return this.makeRequest(
      `/repos/${this.owner}/${repo}/actions/runs/${runId}/jobs`
    ) as Promise<{ jobs: GitHubJob[] }>;
  }

  async getRepositoryCommits(
    repo: string,
    branch: string = 'main'
  ): Promise<GitHubCommit[]> {
    return this.makeRequest(
      `/repos/${this.owner}/${repo}/commits?sha=${branch}&per_page=5`
    ) as Promise<GitHubCommit[]>;
  }

  async getRepositoryBranches(repo: string): Promise<GitHubBranch[]> {
    return this.makeRequest(`/repos/${this.owner}/${repo}/branches`) as Promise<
      GitHubBranch[]
    >;
  }

  async getRepositoryIssues(
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubIssue[]> {
    return this.makeRequest(
      `/repos/${this.owner}/${repo}/issues?state=${state}&per_page=10`
    ) as Promise<GitHubIssue[]>;
  }

  async getRepositoryPullRequests(
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubPullRequest[]> {
    return this.makeRequest(
      `/repos/${this.owner}/${repo}/pulls?state=${state}&per_page=10`
    ) as Promise<GitHubPullRequest[]>;
  }
}

export default new GitHubService();
