import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, describe, test } from 'vitest';

import DealWithIt1 from './DealWithIt1';

describe('DealWithIt1 Component', () => {
  test('renders deal with it title', () => {
    render(<DealWithIt1 />);
    const titleElement = screen.getByText(/deal with it/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<DealWithIt1 />);
    const videoElement = screen.getByTestId('dealwithit1-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<DealWithIt1 />);
    const videoElement = screen.getByTestId('dealwithit1-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<DealWithIt1 />);
    const container = screen.getByTestId('dealwithit1-container');
    expect(container).toBeInTheDocument();
  });
});
