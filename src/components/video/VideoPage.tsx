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
    if (random < 0.063) { // 1/16 chance
      path = '/gangnam1';
    } else if (random < 0.125) { // 2/16 chance
      path = '/gangnam2';
    } else if (random < 0.188) { // 3/16 chance
      path = '/hacking';
    } else if (random < 0.25) { // 4/16 chance
      path = '/dealwithit1';
    } else if (random < 0.313) { // 5/16 chance
      path = '/dealwithit2';
    } else if (random < 0.375) { // 6/16 chance
      path = '/dealwithit3';
    } else if (random < 0.438) { // 7/16 chance
      path = '/baseball1';
    } else if (random < 0.5) { // 8/16 chance
      path = '/baseball2';
    } else if (random < 0.563) { // 9/16 chance
      path = '/kingkong';
    } else if (random < 0.625) { // 10/16 chance
      path = '/buschleague';
    } else if (random < 0.688) { // 11/16 chance
      path = '/thumbsup';
    } else if (random < 0.75) { // 12/16 chance
      path = '/jobwelldone';
    } else if (random < 0.813) { // 13/16 chance
      path = '/coffee';
    } else if (random < 0.875) { // 14/16 chance
      path = '/mishap';
    } else if (random < 0.938) { // 15/16 chance
      path = '/peloton';
    } else { // 16/16 chance
      path = '/seeya';
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
