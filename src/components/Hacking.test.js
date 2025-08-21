import React from 'react';
import { render, screen } from '@testing-library/react';
import Hacking from './Hacking';

describe('Hacking Component', () => {
  test('renders hacking title', () => {
    render(<Hacking />);
    const titleElement = screen.getByText(/Hacking in Progress/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders hacking subtitle', () => {
    render(<Hacking />);
    const subtitleElement = screen.getByText(/Accessing mainframe/i);
    expect(subtitleElement).toBeInTheDocument();
  });

  test('renders video element', () => {
    render(<Hacking />);
    const videoElement = screen.getByTestId('hacking-video');
    expect(videoElement).toBeInTheDocument();
  });

  test('video has correct attributes', () => {
    render(<Hacking />);
    const videoElement = screen.getByTestId('hacking-video');
    expect(videoElement).toHaveAttribute('autoPlay');
    expect(videoElement).toHaveAttribute('muted');
    expect(videoElement).toHaveAttribute('loop');
    expect(videoElement).toHaveAttribute('playsInline');
  });

  test('renders status information', () => {
    render(<Hacking />);
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress:/i)).toBeInTheDocument();
    expect(screen.getByText(/Target:/i)).toBeInTheDocument();
  });

  test('renders matrix effect', () => {
    render(<Hacking />);
    const matrixLines = screen.getAllByText(/01010101|10101010/);
    expect(matrixLines.length).toBeGreaterThan(0);
  });

  test('renders container with correct test id', () => {
    render(<Hacking />);
    const container = screen.getByTestId('hacking-container');
    expect(container).toBeInTheDocument();
  });
});
