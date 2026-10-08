import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock logger before importing
vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    measureAsync: vi.fn((label, fn) => fn()),
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

  describe('getAllRepositories', () => {
    it('should fetch repositories through the server proxy', async () => {
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
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepos),
      } as any);

      const result = await githubService.getAllRepositories();

      expect(fetch).toHaveBeenCalledWith(
        '/api/github/repos',
        expect.any(Object)
      );
      expect(result).toEqual(mockRepos);
    });

    it('should throw when the proxy request fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      } as any);

      await expect(githubService.getAllRepositories()).rejects.toThrow(
        'GitHub API error: 503 Service Unavailable'
      );
    });
  });

  describe('getWorkflowRuns', () => {
    it('should fetch workflow runs for a repo through the server proxy', async () => {
      const mockRuns = { workflow_runs: [{ id: 1, name: 'CI' }] };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRuns),
      } as any);

      const result = await githubService.getWorkflowRuns('tronswan');

      expect(fetch).toHaveBeenCalledWith(
        '/api/github/repos/tronswan/runs',
        expect.any(Object)
      );
      expect(result).toEqual(mockRuns);
    });
  });

  it('should never send credentials from the browser', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as any);

    await githubService.getAllRepositories();

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.stringify(init)).not.toMatch(/authorization/i);
  });
});
