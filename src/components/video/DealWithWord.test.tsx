import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, describe, test } from 'vitest';

import DealWithWord from './DealWithWord';

describe('DealWithWord Component', () => {
  test('renders deal with word title', () => {
    render(<DealWithWord />);
    const titleElement = screen.getByText(/deal with word/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<DealWithWord />);
    const videoElement = screen.getByTestId('dealwithword-modal-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<DealWithWord />);
    const videoElement = screen.getByTestId('dealwithword-modal-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<DealWithWord />);
    const container = screen.getByTestId('dealwithword-container');
    expect(container).toBeInTheDocument();
  });
});
