import React from 'react';
import { useResumeData } from '../../hooks/useResumeData';
import ResumeContent from './ResumeContent';

function Resume() {
  const { content, loading, error, lastUpdated, refetch } = useResumeData();

  return (
    <ResumeContent
      content={content}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={refetch}
    />
  );
}

export default Resume;
