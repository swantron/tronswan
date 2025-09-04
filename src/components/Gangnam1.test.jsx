import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Gangnam1 from './Gangnam1';

describe('Gangnam1 Component', () => {
  test('renders gangnam title', () => {
    render(<Gangnam1 />);
    const titleElement = screen.getByText(/gangnam style/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<Gangnam1 />);
    const videoElement = screen.getByTestId('gangnam1-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<Gangnam1 />);
    const videoElement = screen.getByTestId('gangnam1-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect(videoElement.autoplay).toBe(true);
    expect(videoElement.muted).toBe(true);
    expect(videoElement.loop).toBe(true);
    expect(videoElement.playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<Gangnam1 />);
    const container = screen.getByTestId('gangnam1-container');
    expect(container).toBeInTheDocument();
  });
});
