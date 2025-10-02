import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

import Working from './Working';

describe('Working Component', () => {
  it('renders the component with correct title', () => {
    render(<Working />);

    const title = screen.getByText('working');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2');
  });

  it('renders the video element with correct attributes', () => {
    render(<Working />);

    const video = screen.getByTestId('working-modal-video');
    expect(video).toBeInTheDocument();
    expect((video as HTMLVideoElement).autoplay).toBe(true);
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect((video as HTMLVideoElement).loop).toBe(true);
    expect((video as HTMLVideoElement).playsInline).toBe(true);
    expect(video).toHaveClass('video-modal-video');
  });

  it('renders the video source with correct path', () => {
    render(<Working />);

    const source = screen
      .getByTestId('working-modal-video')
      .querySelector('source');
    expect(source).toBeInTheDocument();
    expect(source).toHaveAttribute('src', '/working.mp4');
    expect(source).toHaveAttribute('type', 'video/mp4');
  });

  it('renders the container with correct test id', () => {
    render(<Working />);

    const container = screen.getByTestId('working-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('gangnam-container');
  });

  it('renders fallback content for unsupported browsers', () => {
    render(<Working />);

    const fallback = screen.getByText(
      'Your browser does not support the video tag.'
    );
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass('video-fallback');
  });

  it('renders download link in fallback', () => {
    render(<Working />);

    const downloadLink = screen.getByText('Download MP4 version');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/working.mp4');
    expect(downloadLink).toHaveAttribute('download');
  });
});
