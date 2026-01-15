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
  // Handle escape key press and scroll position
  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      document.addEventListener('keydown', handleEscape);
      
      // Prevent body scroll when modal is open and preserve scroll position
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className='video-modal-overlay'
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
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
            key={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            controls
            className='video-modal-video'
            data-testid={`${testId}-modal-video`}
            src={videoSrc}
          >
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
