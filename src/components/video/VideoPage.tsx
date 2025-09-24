import React from 'react';
import '../../styles/Video.css';

interface VideoPageProps {
  title: string;
  videoSrc: string;
  testId: string;
}

const VideoPage: React.FC<VideoPageProps> = ({ title, videoSrc, testId }) => {
  return (
    <div className='gangnam-container' data-testid={`${testId}-container`}>
      <div className='gangnam-content'>
        <h1 className='gangnam-title'>{title}</h1>

        <div className='video-container'>
          <video
            autoPlay
            muted
            loop
            playsInline
            className='gangnam-video'
            data-testid={`${testId}-video`}
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

export default VideoPage;
