import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Shorts from './Shorts';

const ShortsWithRouter = () => (
  <BrowserRouter>
    <Shorts />
  </BrowserRouter>
);

describe('Shorts Component', () => {
  it('renders the shorts title and subtitle', () => {
    render(<ShortsWithRouter />);
    
    const title = screen.getByText('Shorts');
    const subtitle = screen.getByText('All your favorite videos in one place');
    
    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
    expect(title.tagName).toBe('H1');
  });

  it('renders all video items in the grid', () => {
    render(<ShortsWithRouter />);
    
    // Check for some key video items
    expect(screen.getByTestId('shorts-item-gangamstyle')).toBeInTheDocument();
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

  it('renders links with correct paths', () => {
    render(<ShortsWithRouter />);
    
    const gangamLink = screen.getByTestId('shorts-item-gangamstyle');
    const hackingLink = screen.getByTestId('shorts-item-hacking');
    
    expect(gangamLink).toHaveAttribute('href', '/gangamstyle');
    expect(hackingLink).toHaveAttribute('href', '/hacking');
  });

  it('renders container with correct classes', () => {
    render(<ShortsWithRouter />);
    
    const container = screen.getByText('Shorts').closest('.shorts-container');
    expect(container).toBeInTheDocument();
    
    const grid = screen.getByText('Shorts').closest('.shorts-container')?.querySelector('.shorts-grid');
    expect(grid).toBeInTheDocument();
  });
});
