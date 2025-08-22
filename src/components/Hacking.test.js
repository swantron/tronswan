import React from 'react';
import { render, screen } from '@testing-library/react';
import Hacking from './Hacking';

describe('Hacking Component', () => {
  test('renders hacking title', () => {
    render(<Hacking />);
    const titleElement = screen.getByText(/computer hacking skills/i);
    expect(titleElement).toBeInTheDocument();
  });



  test('renders video element', () => {
    render(<Hacking />);
    const videoElement = screen.getByTestId('hacking-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<Hacking />);
    const videoElement = screen.getByTestId('hacking-video');
    // Check that video element exists and has the expected properties
    expect(videoElement).toBeInTheDocument();
    expect(videoElement.autoplay).toBe(true);
    expect(videoElement.muted).toBe(true);
    expect(videoElement.loop).toBe(true);
    expect(videoElement.playsInline).toBe(true);
  });



  test('renders container with correct test id', () => {
    render(<Hacking />);
    const container = screen.getByTestId('hacking-container');
    expect(container).toBeInTheDocument();
  });
});
