import React from 'react';
import { render, screen } from '@testing-library/react';
import Gangnam2 from './Gangnam2';

describe('Gangnam2 Component', () => {
  test('renders gangnam title', () => {
    render(<Gangnam2 />);
    const titleElement = screen.getByText(/gangnam style/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<Gangnam2 />);
    const videoElement = screen.getByTestId('gangnam2-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<Gangnam2 />);
    const videoElement = screen.getByTestId('gangnam2-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect(videoElement.autoplay).toBe(true);
    expect(videoElement.muted).toBe(true);
    expect(videoElement.loop).toBe(true);
    expect(videoElement.playsInline).toBe(true);
  });

  test('renders container with correct test id', () => {
    render(<Gangnam2 />);
    const container = screen.getByTestId('gangnam2-container');
    expect(container).toBeInTheDocument();
  });
});
