import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, describe, test } from 'vitest';

import GangamStyle from './GangamStyle';

describe('GangamStyle Component', () => {
  test('renders gangam style title', () => {
    render(<GangamStyle />);
    const titleElement = screen.getByText(/gangam style/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<GangamStyle />);
    const videoElement = screen.getByTestId('gangamstyle-modal-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<GangamStyle />);
    const videoElement = screen.getByTestId('gangamstyle-modal-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<GangamStyle />);
    const container = screen.getByTestId('gangamstyle-container');
    expect(container).toBeInTheDocument();
  });
});
