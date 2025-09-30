import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, describe, test } from 'vitest';

import Wrigley from './Wrigley';

describe('Wrigley Component', () => {
  test('renders wrigley title', () => {
    render(<Wrigley />);
    const titleElement = screen.getByText(/wrigley/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<Wrigley />);
    const videoElement = screen.getByTestId('wrigley-modal-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<Wrigley />);
    const videoElement = screen.getByTestId('wrigley-modal-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<Wrigley />);
    const container = screen.getByTestId('wrigley-container');
    expect(container).toBeInTheDocument();
  });
});
