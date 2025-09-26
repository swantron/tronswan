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
    if (random < 0.067) { // 1/15 chance
      path = '/gangnam1';
    } else if (random < 0.133) { // 2/15 chance
      path = '/gangnam2';
    } else if (random < 0.2) { // 3/15 chance
      path = '/hacking';
    } else if (random < 0.267) { // 4/15 chance
      path = '/dealwithit1';
    } else if (random < 0.333) { // 5/15 chance
      path = '/dealwithit2';
    } else if (random < 0.4) { // 6/15 chance
      path = '/dealwithit3';
    } else if (random < 0.467) { // 7/15 chance
      path = '/baseball1';
    } else if (random < 0.533) { // 8/15 chance
      path = '/baseball2';
    } else if (random < 0.6) { // 9/15 chance
      path = '/kingkong';
    } else if (random < 0.667) { // 10/15 chance
      path = '/buschleague';
    } else if (random < 0.733) { // 11/15 chance
      path = '/thumbsup';
    } else if (random < 0.8) { // 12/15 chance
      path = '/jobwelldone';
    } else if (random < 0.867) { // 13/15 chance
      path = '/coffee';
    } else if (random < 0.933) { // 14/15 chance
      path = '/mishap';
    } else { // 15/15 chance
      path = '/peloton';
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
