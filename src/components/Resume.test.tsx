import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi, expect, describe, test, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import Resume from './Resume';
import { GoogleDocsService } from '../services/googleDocsService';

// Mock the GoogleDocsService
vi.mock('../services/googleDocsService', () => ({
  GoogleDocsService: {
    getResumeContent: vi.fn(),
  },
}));

// Mock the SEO component to prevent react-helmet-async errors in tests
vi.mock('./components/SEO', () => ({
  default: function MockSEO() {
    return null; // Return null to render nothing
  },
}));

describe('Resume Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state initially', () => {
    (GoogleDocsService.getResumeContent as any).mockResolvedValue('Test content');
    
    render(<Resume />);
    
    expect(screen.getByText('Loading resume content from Google Doc...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // loading spinner
  });

  test('renders resume content after loading', async () => {
    const mockContent = `John Doe
Email: john@example.com
Website: john.com
LinkedIn: linkedin.com/in/john
Location: New York, NY

Professional Summary
Experienced developer with 5+ years of experience.

Technical Skills
React, TypeScript
Node.js, Python

Professional Experience
Software Engineer at Tech Corp (2020-2023)
Junior Developer at Startup Inc (2018-2020)

Education
Bachelor of Science in Computer Science
University of Technology (2014-2018)

Projects & Achievements
Built multiple web applications
Contributed to open source

Certifications
AWS Certified Solutions Architect
Google Cloud Professional Developer`;

    (GoogleDocsService.getResumeContent as any).mockResolvedValue(mockContent);
    
    render(<Resume />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Professional Experience')).toBeInTheDocument();
  });

  test('renders error state when API fails', async () => {
    (GoogleDocsService.getResumeContent as any).mockRejectedValue(new Error('API Error'));
    
    render(<Resume />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Resume')).toBeInTheDocument();
    });
    
    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  test('renders refresh button', async () => {
    const mockContent = 'Test content';
    (GoogleDocsService.getResumeContent as any).mockResolvedValue(mockContent);
    
    render(<Resume />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh Content' })).toBeInTheDocument();
    });
  });

  test('renders Google Doc link in footer', async () => {
    const mockContent = 'Test content';
    (GoogleDocsService.getResumeContent as any).mockResolvedValue(mockContent);
    
    render(<Resume />);
    
    await waitFor(() => {
      const googleDocLink = screen.getByRole('link', { name: 'View original Google Doc version' });
      expect(googleDocLink).toHaveAttribute('href', 'https://docs.google.com/document/d/1zeZ_mN27_KVgUuOovUn4nHb_w8CDRUBrj5xOiIVTz8M/edit?usp=sharing');
      expect(googleDocLink).toHaveAttribute('target', '_blank');
      expect(googleDocLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('renders last updated date', async () => {
    const mockContent = 'Test content';
    (GoogleDocsService.getResumeContent as any).mockResolvedValue(mockContent);
    
    render(<Resume />);
    
    await waitFor(() => {
      const lastUpdatedText = screen.getByText(/Last updated:/);
      expect(lastUpdatedText).toBeInTheDocument();
    });
  });
});
