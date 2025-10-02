import { useState, useEffect } from 'react';

import { GoogleDocsService } from '../services/googleDocsService';

interface ResumeData {
  content: string;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useResumeData = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    content: '',
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchResumeData = async () => {
    try {
      setResumeData(prev => ({ ...prev, loading: true, error: null }));

      const content = await GoogleDocsService.getResumeContent();

      setResumeData({
        content,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setResumeData({
        content: '',
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to load resume data',
        lastUpdated: null,
      });
    }
  };

  useEffect(() => {
    fetchResumeData();
  }, []);

  return {
    ...resumeData,
    refetch: fetchResumeData,
  };
};
