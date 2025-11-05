import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { GoogleDocsService } from './googleDocsService';

// Mock fetch
global.fetch = vi.fn();

describe('GoogleDocsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    delete process.env.VITE_GOOGLE_DOCS_API_KEY;
  });

  it('should return fallback content when API key is not available', async () => {
    const content = await GoogleDocsService.getResumeContent();

    expect(content).toContain('Resume Template');
    expect(content).toContain('Contact Information');
    expect(content).toContain('Professional Summary');
  });

  it('should fetch content from Google Docs API when key is available', async () => {
    vi.stubEnv('VITE_GOOGLE_DOCS_API_KEY', 'test-api-key');

    const mockContent = `
# My Resume

## Contact
Email: test@example.com

## Experience
Software Engineer at Test Company
    `.trim();

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => mockContent,
    });

    const content = await GoogleDocsService.getResumeContent();

    expect(content).toContain('My Resume');
    expect(content).toContain('test@example.com');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('googleapis.com/drive/v3/files')
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('mimeType=text/plain')
    );

    vi.unstubAllEnvs();
  });

  it('should handle API errors gracefully', async () => {
    vi.stubEnv('VITE_GOOGLE_DOCS_API_KEY', 'test-api-key');

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    });

    const content = await GoogleDocsService.getResumeContent();

    expect(content).toContain('Resume Template');
    expect(content).toContain('This content is loaded from your Google Doc');

    vi.unstubAllEnvs();
  });

  it('should handle network errors gracefully', async () => {
    vi.stubEnv('VITE_GOOGLE_DOCS_API_KEY', 'test-api-key');

    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const content = await GoogleDocsService.getResumeContent();

    expect(content).toContain('Resume Template');
    expect(content).toContain('This content is loaded from your Google Doc');

    vi.unstubAllEnvs();
  });

  it('should include document ID in API request', async () => {
    vi.stubEnv('VITE_GOOGLE_DOCS_API_KEY', 'test-api-key');

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => 'Resume content',
    });

    await GoogleDocsService.getResumeContent();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('1zeZ_mN27_KVgUuOovUn4nHb_w8CDRUBrj5xOiIVTz8M')
    );

    vi.unstubAllEnvs();
  });

  it('should return fallback content with all required sections', async () => {
    const content = await GoogleDocsService.getResumeContent();

    expect(content).toContain('Contact Information');
    expect(content).toContain('Professional Summary');
    expect(content).toContain('Technical Skills');
    expect(content).toContain('Professional Experience');
    expect(content).toContain('Education');
    expect(content).toContain('Projects & Achievements');
    expect(content).toContain('Certifications');
  });

  it('should handle 401 unauthorized errors', async () => {
    vi.stubEnv('VITE_GOOGLE_DOCS_API_KEY', 'invalid-key');

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    const content = await GoogleDocsService.getResumeContent();

    expect(content).toContain('Resume Template');

    vi.unstubAllEnvs();
  });

  it('should handle 403 forbidden errors', async () => {
    vi.stubEnv('VITE_GOOGLE_DOCS_API_KEY', 'test-api-key');

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    });

    const content = await GoogleDocsService.getResumeContent();

    expect(content).toContain('Resume Template');

    vi.unstubAllEnvs();
  });

  it('should handle 500 server errors', async () => {
    vi.stubEnv('VITE_GOOGLE_DOCS_API_KEY', 'test-api-key');

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const content = await GoogleDocsService.getResumeContent();

    expect(content).toContain('Resume Template');

    vi.unstubAllEnvs();
  });

  it('should handle empty response text', async () => {
    vi.stubEnv('VITE_GOOGLE_DOCS_API_KEY', 'test-api-key');

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '',
    });

    const content = await GoogleDocsService.getResumeContent();

    expect(content).toBe('');

    vi.unstubAllEnvs();
  });
});

