import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { expect, describe, test, vi } from 'vitest';

import VideoModal from './VideoModal';

describe('VideoModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Video',
    videoSrc: '/test-video.mp4',
    testId: 'test-video',
  };

  test('renders modal when open', () => {
    render(<VideoModal {...defaultProps} />);

    expect(screen.getByTestId('test-video-modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('test-video-modal-content')).toBeInTheDocument();
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<VideoModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByTestId('test-video-modal-overlay')
    ).not.toBeInTheDocument();
  });

  test('renders video element with correct attributes', () => {
    render(<VideoModal {...defaultProps} />);

    const videoElement = screen.getByTestId('test-video-modal-video');
    expect(videoElement).toBeInTheDocument();
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<VideoModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByTestId('test-video-modal-close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<VideoModal {...defaultProps} onClose={onClose} />);

    const backdrop = screen.getByTestId('test-video-modal-overlay');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('handles escape key press', () => {
    const onClose = vi.fn();
    render(<VideoModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('prevents body scroll when modal is open', () => {
    render(<VideoModal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  test('restores body scroll when modal is closed', () => {
    const { rerender } = render(<VideoModal {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<VideoModal {...defaultProps} isOpen={false} />);

    expect(document.body.style.overflow).toBe('unset');
  });
});
