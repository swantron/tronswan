import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, describe, test } from 'vitest';

import DealWithFont from './DealWithFont';

describe('DealWithFont Component', () => {
  test('renders deal with font title', () => {
    render(<DealWithFont />);
    const titleElement = screen.getByText(/deal with font/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<DealWithFont />);
    const videoElement = screen.getByTestId('dealwithfont-modal-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<DealWithFont />);
    const videoElement = screen.getByTestId('dealwithfont-modal-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<DealWithFont />);
    const container = screen.getByTestId('dealwithfont-container');
    expect(container).toBeInTheDocument();
  });
});
