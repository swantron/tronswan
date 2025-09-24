import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Baseball2 from './Baseball2';

describe('Baseball2', () => {
  it('renders the component with correct title', () => {
    render(<Baseball2 />);
    
    const title = screen.getByText('glove up');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');
  });

  it('renders the video element with correct attributes', () => {
    render(<Baseball2 />);
    
    const video = screen.getByTestId('baseball2-video');
    expect(video).toBeInTheDocument();
    expect((video as HTMLVideoElement).autoplay).toBe(true);
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect((video as HTMLVideoElement).loop).toBe(true);
    expect((video as HTMLVideoElement).playsInline).toBe(true);
    expect(video).toHaveClass('gangnam-video');
  });

  it('renders the video source with correct path', () => {
    render(<Baseball2 />);
    
    const source = screen.getByTestId('baseball2-video').querySelector('source');
    expect(source).toBeInTheDocument();
    expect(source).toHaveAttribute('src', '/baseball_2.mp4');
    expect(source).toHaveAttribute('type', 'video/mp4');
  });

  it('renders the container with correct test id', () => {
    render(<Baseball2 />);
    
    const container = screen.getByTestId('baseball2-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('gangnam-container');
  });

  it('renders fallback content for unsupported browsers', () => {
    render(<Baseball2 />);
    
    const fallback = screen.getByText('Your browser does not support the video tag.');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass('video-fallback');
  });

  it('renders download link in fallback', () => {
    render(<Baseball2 />);
    
    const downloadLink = screen.getByText('Download MP4 version');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/baseball_2.mp4');
    expect(downloadLink).toHaveAttribute('download');
  });
});
