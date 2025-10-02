import React, { useEffect } from 'react';
import '../../styles/VideoModal.css';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoSrc: string;
  testId: string;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  title,
  videoSrc,
  testId,
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='video-modal-overlay'
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleBackdropClick(e as any);
        }
      }}
      role='button'
      tabIndex={0}
      data-testid={`${testId}-modal-overlay`}
    >
      <div
        className='video-modal-content'
        data-testid={`${testId}-modal-content`}
      >
        <button
          className='video-modal-close'
          onClick={onClose}
          data-testid={`${testId}-modal-close`}
          aria-label='Close video'
        >
          ×
        </button>

        <div className='video-modal-header'>
          <h2 className='video-modal-title'>{title}</h2>
        </div>

        <div className='video-modal-video-container'>
          <video
            autoPlay
            muted
            loop
            playsInline
            className='video-modal-video'
            data-testid={`${testId}-modal-video`}
          >
            <source src={videoSrc} type='video/mp4' />
            <p className='video-fallback'>
              Your browser does not support the video tag.
              <br />
              <a href={videoSrc} download>
                Download MP4 version
              </a>
            </p>
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
