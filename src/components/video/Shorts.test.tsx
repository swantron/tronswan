import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import Shorts from './Shorts';

// Mock react-helmet-async is already done globally in setupTests.ts

const ShortsWithRouter = () => (
  <BrowserRouter>
    <Shorts />
  </BrowserRouter>
);

describe('Shorts Component', () => {
  it('renders the shorts title', () => {
    render(<ShortsWithRouter />);

    const title = screen.getByText('shorts');

    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');
  });

  it('renders all video items in the grid', () => {
    render(<ShortsWithRouter />);

    // Check for some key video items
    expect(screen.getByTestId('shorts-item-gangnam_1')).toBeInTheDocument();
    expect(screen.getByTestId('shorts-item-hacking')).toBeInTheDocument();
    expect(screen.getByTestId('shorts-item-working')).toBeInTheDocument();
    expect(screen.getByTestId('shorts-item-dynomite')).toBeInTheDocument();
  });

  it('renders video titles correctly', () => {
    render(<ShortsWithRouter />);

    expect(screen.getByText('gangam style')).toBeInTheDocument();
    expect(screen.getByText('hacking')).toBeInTheDocument();
    expect(screen.getByText('glove up')).toBeInTheDocument();
    expect(screen.getByText('kong tron')).toBeInTheDocument();
    expect(screen.getByText('busch dot league')).toBeInTheDocument();
  });

  it('renders video preview elements', () => {
    const { container } = render(<ShortsWithRouter />);

    // Check that preview videos have correct attributes
    const videoElements = container.querySelectorAll('.shorts-preview-video');
    expect(videoElements.length).toBeGreaterThan(0);

    videoElements.forEach(video => {
      expect((video as HTMLVideoElement).muted).toBe(true);
      expect((video as HTMLVideoElement).loop).toBe(true);
      expect((video as HTMLVideoElement).playsInline).toBe(true);
      expect(video).toHaveAttribute('preload', 'metadata');
    });
  });

  it('renders play overlay buttons', () => {
    render(<ShortsWithRouter />);

    const playButtons = screen.getAllByText('▶');
    expect(playButtons.length).toBeGreaterThan(0);

    playButtons.forEach(button => {
      expect(button).toHaveClass('shorts-play-button');
    });
  });

  it('renders clickable video items with correct roles', () => {
    render(<ShortsWithRouter />);

    const gangamItem = screen.getByTestId('shorts-item-gangnam_1');
    const hackingItem = screen.getByTestId('shorts-item-hacking');

    expect(gangamItem).toHaveAttribute('role', 'button');
    expect(gangamItem).toHaveAttribute('tabIndex', '0');
    expect(hackingItem).toHaveAttribute('role', 'button');
    expect(hackingItem).toHaveAttribute('tabIndex', '0');
  });

  it('renders container with correct classes', () => {
    render(<ShortsWithRouter />);

    const container = screen.getByText('shorts').closest('.shorts-container');
    expect(container).toBeInTheDocument();

    const grid = screen
      .getByText('shorts')
      .closest('.shorts-container')
      ?.querySelector('.shorts-grid');
    expect(grid).toBeInTheDocument();
  });
});
