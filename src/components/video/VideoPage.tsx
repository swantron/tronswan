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
    if (random < 0.059) {
      // 1/17 chance
      path = '/gangamstyle';
    } else if (random < 0.118) {
      // 2/17 chance
      path = '/hacking';
    } else if (random < 0.176) {
      // 3/17 chance
      path = '/dealwithit1';
    } else if (random < 0.235) {
      // 4/17 chance
      path = '/dealwithit2';
    } else if (random < 0.294) {
      // 5/17 chance
      path = '/dealwithit3';
    } else if (random < 0.353) {
      // 6/17 chance
      path = '/baseball1';
    } else if (random < 0.412) {
      // 7/17 chance
      path = '/baseball2';
    } else if (random < 0.471) {
      // 8/17 chance
      path = '/kingkong';
    } else if (random < 0.529) {
      // 9/17 chance
      path = '/buschleague';
    } else if (random < 0.588) {
      // 10/17 chance
      path = '/thumbsup';
    } else if (random < 0.647) {
      // 11/17 chance
      path = '/jobwelldone';
    } else if (random < 0.706) {
      // 12/17 chance
      path = '/coffee';
    } else if (random < 0.765) {
      // 13/17 chance
      path = '/mishap';
    } else if (random < 0.824) {
      // 14/17 chance
      path = '/peloton';
    } else if (random < 0.882) {
      // 15/17 chance
      path = '/seeya';
    } else if (random < 0.941) {
      // 16/17 chance
      path = '/dynomite';
    } else {
      // 17/17 chance
      path = '/working';
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
