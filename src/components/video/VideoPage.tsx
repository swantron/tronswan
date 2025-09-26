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
    if (random < 0.083) { // 1/12 chance
      path = '/gangnam1';
    } else if (random < 0.167) { // 2/12 chance
      path = '/gangnam2';
    } else if (random < 0.25) { // 3/12 chance
      path = '/hacking';
    } else if (random < 0.333) { // 4/12 chance
      path = '/dealwithit1';
    } else if (random < 0.417) { // 5/12 chance
      path = '/dealwithit2';
    } else if (random < 0.5) { // 6/12 chance
      path = '/dealwithit3';
    } else if (random < 0.583) { // 7/12 chance
      path = '/baseball1';
    } else if (random < 0.667) { // 8/12 chance
      path = '/baseball2';
    } else if (random < 0.75) { // 9/12 chance
      path = '/kingkong';
    } else if (random < 0.833) { // 10/12 chance
      path = '/buschleague';
    } else if (random < 0.917) { // 11/12 chance
      path = '/thumbsup';
    } else { // 12/12 chance
      path = '/jobwelldone';
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
