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
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
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
  private baseUrl: string;
  private token: string;
  private owner: string;

  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.token = runtimeConfig.get('VITE_GITHUB_TOKEN');
    this.owner = runtimeConfig.getWithDefault('VITE_GITHUB_OWNER', 'swantron');
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.token) {
      throw new Error('GitHub token not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TronSwan-Health-Monitor'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(): Promise<GitHubUser> {
    return this.makeRequest('/user');
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    // Only get the specific tronswan repository
    return this.makeRequest(`/repos/${this.owner}/tronswan`).then(repo => [repo]);
  }

  async getAllRepositories(): Promise<GitHubRepository[]> {
    // Get all repositories for the swantron organization
    return this.makeRequest(`/users/${this.owner}/repos?sort=updated&per_page=10`);
  }

  async getRepository(name: string): Promise<GitHubRepository> {
    return this.makeRequest(`/repos/${this.owner}/${name}`);
  }

  async getWorkflows(repo: string): Promise<{ workflows: GitHubWorkflow[] }> {
    return this.makeRequest(`/repos/${this.owner}/${repo}/actions/workflows`);
  }

  async getWorkflowRuns(repo: string, workflowId?: number): Promise<{ workflow_runs: GitHubWorkflowRun[] }> {
    const endpoint = workflowId 
      ? `/repos/${this.owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=10`
      : `/repos/${this.owner}/${repo}/actions/runs?per_page=10`;
    return this.makeRequest(endpoint);
  }

  async getWorkflowRun(repo: string, runId: number): Promise<GitHubWorkflowRun> {
    return this.makeRequest(`/repos/${this.owner}/${repo}/actions/runs/${runId}`);
  }

  async getWorkflowRunJobs(repo: string, runId: number): Promise<{ jobs: any[] }> {
    return this.makeRequest(`/repos/${this.owner}/${repo}/actions/runs/${runId}/jobs`);
  }

  async getRepositoryCommits(repo: string, branch: string = 'main'): Promise<any[]> {
    return this.makeRequest(`/repos/${this.owner}/${repo}/commits?sha=${branch}&per_page=5`);
  }

  async getRepositoryBranches(repo: string): Promise<any[]> {
    return this.makeRequest(`/repos/${this.owner}/${repo}/branches`);
  }

  async getRepositoryIssues(repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<any[]> {
    return this.makeRequest(`/repos/${this.owner}/${repo}/issues?state=${state}&per_page=10`);
  }

  async getRepositoryPullRequests(repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<any[]> {
    return this.makeRequest(`/repos/${this.owner}/${repo}/pulls?state=${state}&per_page=10`);
  }
}

export default new GitHubService();
