import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

import KingKong from './KingKong';

describe('KingKong', () => {
  it('renders the component with correct title', async () => {
    render(<KingKong />);

    await waitFor(() => {
      const title = screen.getByText('kong tron');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H2');
    });
  });

  it('renders the video element with correct attributes', async () => {
    render(<KingKong />);

    await waitFor(() => {
      const video = screen.getByTestId('kingkong-modal-video');
      expect(video).toBeInTheDocument();
      expect((video as HTMLVideoElement).autoplay).toBe(true);
      expect((video as HTMLVideoElement).muted).toBe(true);
      expect((video as HTMLVideoElement).loop).toBe(true);
      expect((video as HTMLVideoElement).playsInline).toBe(true);
      expect(video).toHaveClass('video-modal-video');
    });
  });

  it('renders the video source with correct path', async () => {
    render(<KingKong />);

    await waitFor(() => {
      const video = screen.getByTestId('kingkong-modal-video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', '/kingkong.mp4');
    });
  });

  it('renders the container with correct test id', () => {
    render(<KingKong />);

    const container = screen.getByTestId('kingkong-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('gangnam-container');
  });

  it('renders fallback content for unsupported browsers', async () => {
    render(<KingKong />);

    await waitFor(() => {
      const fallback = screen.getByText(
        'Your browser does not support the video tag.'
      );
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveClass('video-fallback');
    });
  });

  it('renders download link in fallback', async () => {
    render(<KingKong />);

    await waitFor(() => {
      const downloadLink = screen.getByText('Download MP4 version');
      expect(downloadLink).toBeInTheDocument();
      expect(downloadLink).toHaveAttribute('href', '/kingkong.mp4');
      expect(downloadLink).toHaveAttribute('download');
    });
  });
});
