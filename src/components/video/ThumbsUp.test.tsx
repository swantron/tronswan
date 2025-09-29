import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import ThumbsUp from './ThumbsUp';

describe('ThumbsUp', () => {
  it('renders the component with correct title', () => {
    render(<ThumbsUp />);

    const title = screen.getByText('thumbs up');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');
  });

  it('renders the video element with correct attributes', () => {
    render(<ThumbsUp />);

    const video = screen.getByTestId('thumbsup-video');
    expect(video).toBeInTheDocument();
    expect((video as HTMLVideoElement).autoplay).toBe(true);
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect((video as HTMLVideoElement).loop).toBe(true);
    expect((video as HTMLVideoElement).playsInline).toBe(true);
    expect(video).toHaveClass('gangnam-video');
  });

  it('renders the video source with correct path', () => {
    render(<ThumbsUp />);

    const source = screen.getByTestId('thumbsup-video').querySelector('source');
    expect(source).toBeInTheDocument();
    expect(source).toHaveAttribute('src', '/thumbsup.mp4');
    expect(source).toHaveAttribute('type', 'video/mp4');
  });

  it('renders the container with correct test id', () => {
    render(<ThumbsUp />);

    const container = screen.getByTestId('thumbsup-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('gangnam-container');
  });

  it('renders fallback content for unsupported browsers', () => {
    render(<ThumbsUp />);

    const fallback = screen.getByText(
      'Your browser does not support the video tag.'
    );
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass('video-fallback');
  });

  it('renders download link in fallback', () => {
    render(<ThumbsUp />);

    const downloadLink = screen.getByText('Download MP4 version');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/thumbsup.mp4');
    expect(downloadLink).toHaveAttribute('download');
  });
});
