import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, describe, test } from 'vitest';

import DealWithIt2 from './DealWithIt2';

describe('DealWithIt2 Component', () => {
  test('renders deal with it title', () => {
    render(<DealWithIt2 />);
    const titleElement = screen.getByText(/deal with it/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<DealWithIt2 />);
    const videoElement = screen.getByTestId('dealwithit2-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<DealWithIt2 />);
    const videoElement = screen.getByTestId('dealwithit2-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<DealWithIt2 />);
    const container = screen.getByTestId('dealwithit2-container');
    expect(container).toBeInTheDocument();
  });
});
