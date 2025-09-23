import React from 'react';
import '../styles/Gangnam.css';

const DealWithIt2 = () => {
  return (
    <div className='gangnam-container' data-testid='dealwithit2-container'>
      <div className='gangnam-content'>
        <h1 className='gangnam-title'>deal with it</h1>

        <div className='video-container'>
          <video
            autoPlay
            muted
            loop
            playsInline
            className='gangnam-video'
            data-testid='dealwithit2-video'
          >
            <source src='/dealwithit_2.mp4' type='video/mp4' />
            <p className='video-fallback'>
              Your browser does not support the video tag.
              <br />
              <a href='/dealwithit_2.mp4' download>
                Download MP4 version
              </a>
            </p>
          </video>
        </div>
      </div>
    </div>
  );
};

export default DealWithIt2;
