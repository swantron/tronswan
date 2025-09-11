import { runtimeConfig } from '../utils/runtimeConfig';

export interface GitLabPipeline {
  id: number;
  status: 'success' | 'failed' | 'running' | 'pending' | 'canceled' | 'skipped';
  ref: string;
  web_url: string;
  created_at: string;
  updated_at: string;
  duration?: number;
  finished_at?: string;
  user: {
    name: string;
    username: string;
  };
  commit: {
    id: string;
    short_id: string;
    title: string;
    message: string;
    author_name: string;
    author_email: string;
  };
}

export interface GitLabProject {
  id: number;
  name: string;
  path: string;
  web_url: string;
  avatar_url?: string;
  last_activity_at: string;
}

export interface GitLabJob {
  id: number;
  status: 'success' | 'failed' | 'running' | 'pending' | 'canceled' | 'skipped';
  stage: string;
  name: string;
  ref: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  duration?: number;
  web_url: string;
  user: {
    name: string;
    username: string;
  };
}

class GitLabService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = runtimeConfig.getWithDefault('VITE_GITLAB_URL', 'https://gitlab.com/api/v4');
    this.token = runtimeConfig.get('VITE_GITLAB_TOKEN');
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getPipelines(projectId: string, perPage: number = 10): Promise<GitLabPipeline[]> {
    try {
      return await this.makeRequest<GitLabPipeline[]>(
        `/projects/${projectId}/pipelines?per_page=${perPage}&order_by=updated_at&sort=desc`
      );
    } catch (error) {
      console.error('Error fetching GitLab pipelines:', error);
      throw error;
    }
  }

  async getPipelineJobs(projectId: string, pipelineId: number): Promise<GitLabJob[]> {
    try {
      return await this.makeRequest<GitLabJob[]>(
        `/projects/${projectId}/pipelines/${pipelineId}/jobs`
      );
    } catch (error) {
      console.error('Error fetching GitLab pipeline jobs:', error);
      throw error;
    }
  }

  async getProject(projectId: string): Promise<GitLabProject> {
    try {
      return await this.makeRequest<GitLabProject>(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error fetching GitLab project:', error);
      throw error;
    }
  }

  async getProjects(): Promise<GitLabProject[]> {
    try {
      return await this.makeRequest<GitLabProject[]>('/projects?membership=true&per_page=20');
    } catch (error) {
      console.error('Error fetching GitLab projects:', error);
      throw error;
    }
  }
}

export default new GitLabService();
