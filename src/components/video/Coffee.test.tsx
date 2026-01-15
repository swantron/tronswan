import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

import Coffee from './Coffee';

describe('Coffee', () => {
  it('renders the component with correct title', () => {
    render(<Coffee />);

    const title = screen.getByText('coffee');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2');
  });

  it('renders the video element with correct attributes', () => {
    render(<Coffee />);

    const video = screen.getByTestId('coffee-modal-video');
    expect(video).toBeInTheDocument();
    expect((video as HTMLVideoElement).autoplay).toBe(true);
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect((video as HTMLVideoElement).loop).toBe(true);
    expect((video as HTMLVideoElement).playsInline).toBe(true);
    expect(video).toHaveClass('video-modal-video');
  });

  it('renders the video source with correct path', () => {
    render(<Coffee />);

    const video = screen.getByTestId('coffee-modal-video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/coffee.mp4');
  });

  it('renders the container with correct test id', () => {
    render(<Coffee />);

    const container = screen.getByTestId('coffee-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('gangnam-container');
  });

  it('renders fallback content for unsupported browsers', () => {
    render(<Coffee />);

    const fallback = screen.getByText(
      'Your browser does not support the video tag.'
    );
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass('video-fallback');
  });

  it('renders download link in fallback', () => {
    render(<Coffee />);

    const downloadLink = screen.getByText('Download MP4 version');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/coffee.mp4');
    expect(downloadLink).toHaveAttribute('download');
  });
});
