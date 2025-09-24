import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, describe, test } from 'vitest';

import VideoPage from './VideoPage';

describe('VideoPage Component', () => {
  const mockProps = {
    title: 'Test Video',
    videoSrc: '/test-video.mp4',
    testId: 'test-video'
  };

  test('renders title correctly', () => {
    render(<VideoPage {...mockProps} />);
    const titleElement = screen.getByText('Test Video');
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element with correct source', () => {
    render(<VideoPage {...mockProps} />);
    const videoElement = screen.getByTestId('test-video-video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement.querySelector('source')?.getAttribute('src')).toBe('/test-video.mp4');
  });

  test('video has correct attributes', () => {
    render(<VideoPage {...mockProps} />);
    const videoElement = screen.getByTestId('test-video-video');
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<VideoPage {...mockProps} />);
    const container = screen.getByTestId('test-video-container');
    expect(container).toBeInTheDocument();
  });

  test('renders fallback content with download link', () => {
    render(<VideoPage {...mockProps} />);
    const fallbackElement = screen.getByText('Your browser does not support the video tag.');
    expect(fallbackElement).toBeInTheDocument();
    
    const downloadLink = screen.getByText('Download MP4 version');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/test-video.mp4');
  });
});
