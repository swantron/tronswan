import { logger } from '../utils/logger';
import { runtimeConfig } from '../utils/runtimeConfig';

interface CloudBuildStatus {
  id: string;
  projectId: string;
  status: 'QUEUED' | 'WORKING' | 'SUCCESS' | 'FAILURE' | 'CANCELLED' | 'TIMEOUT';
  createTime: string;
  startTime?: string;
  finishTime?: string;
  logUrl: string;
  substitutions?: Record<string, string>;
  images?: string[];
  steps?: Array<{
    name: string;
    args?: string[];
    env?: string[];
    id?: string;
    waitFor?: string[];
    timing?: {
      startTime: string;
      endTime: string;
    };
  }>;
  results?: {
    buildStepImages?: string[];
    buildStepOutputs?: string[];
    numArtifacts?: string;
  };
  trigger?: {
    name: string;
    id: string;
  };
  sourceProvenance?: {
    resolvedRepoSource?: {
      commitSha: string;
      branchName?: string;
      tagName?: string;
    };
  };
}

interface CloudBuildsResponse {
  builds: CloudBuildStatus[];
  nextPageToken?: string;
}

class GoogleCloudBuildService {
  private baseUrl: string;
  private apiKey: string;
  private projectId: string;

  constructor() {
    this.baseUrl = 'https://cloudbuild.googleapis.com/v1';
    this.apiKey = '';
    this.projectId = '';
  }

  private async makeRequest(endpoint: string): Promise<unknown> {
    if (!this.apiKey) {
      this.apiKey = runtimeConfig.get('VITE_GCP_API_KEY');
    }
    
    if (!this.projectId) {
      this.projectId = runtimeConfig.getWithDefault('VITE_GCP_PROJECT_ID', 'chomptron');
    }

    if (!this.apiKey) {
      logger.error('GCP API key not configured', { endpoint });
      throw new Error('GCP API key not configured');
    }

    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}key=${this.apiKey}`;

    logger.debug('Making GCP Cloud Build API request', {
      endpoint,
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
    });

    const response = await logger.measureAsync(
      'gcp-cloudbuild-api-call',
      async () => {
        return await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      },
      { endpoint }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('GCP Cloud Build API request failed', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `GCP Cloud Build API error: ${response.status} ${response.statusText}`
      );
    }

    logger.info('GCP Cloud Build API request successful', {
      endpoint,
      status: response.status,
    });

    return response.json();
  }

  async getRecentBuilds(pageSize: number = 10): Promise<CloudBuildStatus[]> {
    logger.info('Fetching recent Cloud Build builds', {
      projectId: this.projectId,
      pageSize,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = (await this.makeRequest(
        `/projects/${this.projectId}/builds?pageSize=${pageSize}`
      )) as CloudBuildsResponse;

      logger.info('Cloud Build builds fetched successfully', {
        buildCount: response.builds?.length || 0,
        timestamp: new Date().toISOString(),
      });

      return response.builds || [];
    } catch (error) {
      // Cloud Build API requires OAuth2, not API keys
      if (error instanceof Error && error.message.includes('401')) {
        logger.warn('Cloud Build API requires OAuth2 authentication', {
          message: 'API keys are not supported for Cloud Build. OAuth2 credentials are required.',
        });
        throw new Error('Cloud Build API requires OAuth2 authentication. API keys are not supported.');
      }
      throw error;
    }
  }

  async getBuild(buildId: string): Promise<CloudBuildStatus> {
    logger.info('Fetching Cloud Build build details', {
      projectId: this.projectId,
      buildId,
      timestamp: new Date().toISOString(),
    });

    const build = (await this.makeRequest(
      `/projects/${this.projectId}/builds/${buildId}`
    )) as CloudBuildStatus;

    logger.info('Cloud Build build details fetched successfully', {
      buildId,
      status: build.status,
      timestamp: new Date().toISOString(),
    });

    return build;
  }
}

export default new GoogleCloudBuildService();
