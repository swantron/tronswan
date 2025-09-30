import React, { useState, useEffect } from 'react';
import VideoModal from './VideoModal';
import '../../styles/Video.css';

interface VideoPageProps {
  title: string;
  videoSrc: string;
  testId: string;
}

const VideoPage: React.FC<VideoPageProps> = ({ title, videoSrc, testId }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [currentVideo, setCurrentVideo] = useState({ title, videoSrc, testId });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Navigate back to shorts page after a short delay
    setTimeout(() => {
      window.history.back();
    }, 300);
  };

  return (
    <div className='gangnam-container' data-testid={`${testId}-container`}>
      <VideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentVideo.title}
        videoSrc={currentVideo.videoSrc}
        testId={currentVideo.testId}
      />
    </div>
  );
};

export default VideoPage;
