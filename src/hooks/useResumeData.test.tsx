import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { GoogleDocsService } from '../services/googleDocsService';

import { useResumeData } from './useResumeData';

// Mock the GoogleDocsService
vi.mock('../services/googleDocsService', () => ({
  GoogleDocsService: {
    getResumeContent: vi.fn(),
  },
}));

describe('useResumeData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useResumeData());

    expect(result.current.loading).toBe(true);
    expect(result.current.content).toBe('');
    expect(result.current.error).toBe(null);
    expect(result.current.lastUpdated).toBe(null);
  });

  it('should load content successfully', async () => {
    const mockContent = 'Test resume content';
    (GoogleDocsService.getResumeContent as any).mockResolvedValue(mockContent);

    const { result } = renderHook(() => useResumeData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).toBe(mockContent);
    expect(result.current.error).toBe(null);
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('API Error');
    (GoogleDocsService.getResumeContent as any).mockRejectedValue(mockError);

    const { result } = renderHook(() => useResumeData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).toBe('');
    expect(result.current.error).toBe('API Error');
    expect(result.current.lastUpdated).toBe(null);
  });

  it('should refetch data when refetch is called', async () => {
    const mockContent = 'Updated content';
    (GoogleDocsService.getResumeContent as any).mockResolvedValue(mockContent);

    const { result } = renderHook(() => useResumeData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(GoogleDocsService.getResumeContent).toHaveBeenCalledTimes(2);
    });
  });
});
