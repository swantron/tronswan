import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, describe, test } from 'vitest';

import Baseball1 from './Baseball1';

describe('Baseball1 Component', () => {
  test('renders baseball title', () => {
    render(<Baseball1 />);
    const titleElement = screen.getByText(/baseball/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<Baseball1 />);
    const videoElement = screen.getByTestId('baseball1-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<Baseball1 />);
    const videoElement = screen.getByTestId('baseball1-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<Baseball1 />);
    const container = screen.getByTestId('baseball1-container');
    expect(container).toBeInTheDocument();
  });
});
