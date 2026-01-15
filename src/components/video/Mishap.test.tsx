import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

import Mishap from './Mishap';

describe('Mishap', () => {
  it('renders the component with correct title', () => {
    render(<Mishap />);

    const title = screen.getByText('mishap');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2');
  });

  it('renders the video element with correct attributes', () => {
    render(<Mishap />);

    const video = screen.getByTestId('mishap-modal-video');
    expect(video).toBeInTheDocument();
    expect((video as HTMLVideoElement).autoplay).toBe(true);
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect((video as HTMLVideoElement).loop).toBe(true);
    expect((video as HTMLVideoElement).playsInline).toBe(true);
    expect(video).toHaveClass('video-modal-video');
  });

  it('renders the video source with correct path', () => {
    render(<Mishap />);

    const video = screen.getByTestId('mishap-modal-video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/mishap.mp4');
  });

  it('renders the container with correct test id', () => {
    render(<Mishap />);

    const container = screen.getByTestId('mishap-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('gangnam-container');
  });

  it('renders fallback content for unsupported browsers', () => {
    render(<Mishap />);

    const fallback = screen.getByText(
      'Your browser does not support the video tag.'
    );
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass('video-fallback');
  });

  it('renders download link in fallback', () => {
    render(<Mishap />);

    const downloadLink = screen.getByText('Download MP4 version');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/mishap.mp4');
    expect(downloadLink).toHaveAttribute('download');
  });
});
