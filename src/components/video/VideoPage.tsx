import React from 'react';
import '../../styles/Video.css';

interface VideoPageProps {
  title: string;
  videoSrc: string;
  testId: string;
}

const VideoPage: React.FC<VideoPageProps> = ({ title, videoSrc, testId }) => {
  const handleRandomClick = () => {
    // Randomly choose between all video components
    const random = Math.random();
    let path;
    if (random < 0.077) { // 1/13 chance
      path = '/gangnam1';
    } else if (random < 0.154) { // 2/13 chance
      path = '/gangnam2';
    } else if (random < 0.231) { // 3/13 chance
      path = '/hacking';
    } else if (random < 0.308) { // 4/13 chance
      path = '/dealwithit1';
    } else if (random < 0.385) { // 5/13 chance
      path = '/dealwithit2';
    } else if (random < 0.462) { // 6/13 chance
      path = '/dealwithit3';
    } else if (random < 0.538) { // 7/13 chance
      path = '/baseball1';
    } else if (random < 0.615) { // 8/13 chance
      path = '/baseball2';
    } else if (random < 0.692) { // 9/13 chance
      path = '/kingkong';
    } else if (random < 0.769) { // 10/13 chance
      path = '/buschleague';
    } else if (random < 0.846) { // 11/13 chance
      path = '/thumbsup';
    } else if (random < 0.923) { // 12/13 chance
      path = '/jobwelldone';
    } else { // 13/13 chance
      path = '/coffee';
    }
    window.location.href = path;
  };

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

        <div className='video-actions'>
          <button 
            onClick={handleRandomClick}
            className='random-button'
            data-testid={`${testId}-random-button`}
          >
            Random Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
