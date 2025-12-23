import React, { useState } from 'react';

import VideoModal from './VideoModal';
import './Shorts.css';

interface VideoItem {
  id: string;
  title: string;
  videoSrc: string;
  thumbnail?: string;
}

const Shorts: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const videos: VideoItem[] = [
    { id: 'gangnam_1', title: 'gangam style', videoSrc: '/gangnam_1.mp4' },
    { id: 'hacking', title: 'hacking', videoSrc: '/hacking.mp4' },
    { id: 'dealwithit', title: 'deal with it', videoSrc: '/dealwithit.mp4' },
    {
      id: 'dealwithfont',
      title: 'deal with font',
      videoSrc: '/dealwithfont.mp4',
    },
    {
      id: 'dealwithword',
      title: 'deal with word',
      videoSrc: '/dealwithword.mp4',
    },
    { id: 'wrigley', title: 'wrigley', videoSrc: '/wrigley.mp4' },
    { id: 'baseball_2', title: 'glove up', videoSrc: '/baseball_2.mp4' },
    { id: 'kingkong', title: 'kong tron', videoSrc: '/kingkong.mp4' },
    {
      id: 'buschleague',
      title: 'busch dot league',
      videoSrc: '/buschleague.mp4',
    },
    { id: 'thumbsup', title: 'thumbs up', videoSrc: '/thumbsup.mp4' },
    { id: 'jobwelldone', title: 'job well done', videoSrc: '/jobwelldone.mp4' },
    { id: 'coffee', title: 'coffee', videoSrc: '/coffee.mp4' },
    { id: 'mishap', title: 'mishap', videoSrc: '/mishap.mp4' },
    { id: 'peloton', title: 'peloton', videoSrc: '/peloton.mp4' },
    { id: 'seeya', title: 'seeya', videoSrc: '/seeya.mp4' },
    { id: 'dynomite', title: 'dynomite', videoSrc: '/dynomite.mp4' },
    { id: 'working', title: 'working', videoSrc: '/working.mp4' },
    {
      id: 'hard-at-work',
      title: 'hard at work',
      videoSrc: '/hard-at-work.mp4',
    },
  ];

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  return (
    <div className='shorts-container'>
      <div className='shorts-header'>
        <h1 className='shorts-title'>Shorts</h1>
      </div>

      <div className='shorts-grid'>
        {videos.map(video => (
          <div
            key={video.id}
            className='shorts-item'
            data-testid={`shorts-item-${video.id}`}
            onClick={() => handleVideoClick(video)}
            role='button'
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleVideoClick(video);
              }
            }}
          >
            <div className='shorts-thumbnail'>
              <video
                className='shorts-preview-video'
                muted
                loop
                playsInline
                preload='metadata'
              >
                <source src={video.videoSrc} type='video/mp4' />
              </video>
              <div className='shorts-play-overlay'>
                <div className='shorts-play-button'>▶</div>
              </div>
            </div>
            <div className='shorts-info'>
              <h3 className='shorts-video-title'>{video.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedVideo.title}
          videoSrc={selectedVideo.videoSrc}
          testId={selectedVideo.id}
        />
      )}
    </div>
  );
};

export default Shorts;
