import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, expect, describe, test } from 'vitest';
import '@testing-library/jest-dom';

import Hacking from './Hacking';

describe('Hacking Component', () => {
  test('renders hacking title', () => {
    render(<Hacking />);
    const titleElement = screen.getByText(/computer hacking skills/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<Hacking />);
    const videoElement = screen.getByTestId('hacking-modal-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<Hacking />);
    const videoElement = screen.getByTestId('hacking-modal-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<Hacking />);
    const container = screen.getByTestId('hacking-container');
    expect(container).toBeInTheDocument();
  });
});
