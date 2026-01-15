import React, { useState } from 'react';

import SEO from '../ui/SEO';
import VideoModal from './VideoModal';
import '../../styles/Video.css';

interface VideoPageProps {
  title: string;
  videoSrc: string;
  testId: string;
  url?: string;
}

const VideoPage: React.FC<VideoPageProps> = ({
  title,
  videoSrc,
  testId,
  url,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const currentVideo = { title, videoSrc, testId };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Navigate back to shorts page after a short delay
    setTimeout(() => {
      window.history.back();
    }, 300);
  };

  // Generate URL from testId if not provided
  const pageUrl = url || `/${testId}`;

  return (
    <div className='gangnam-container' data-testid={`${testId}-container`}>
      <SEO
        title={`${title} - Video Short | Tron Swan`}
        description={`Watch "${title}" - a short video clip from the tronswan video collection.`}
        keywords={`${title}, video short, tronswan videos, ${testId}`}
        url={pageUrl}
      />
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
