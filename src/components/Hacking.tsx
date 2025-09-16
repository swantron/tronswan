import React from 'react';
import '../styles/Hacking.css';

const Hacking = () => {
  return (
    <div className='hacking-container' data-testid='hacking-container'>
      <div className='hacking-content'>
        <h1 className='hacking-title'>computer hacking skills</h1>

        <div className='video-container'>
          <video
            autoPlay
            muted
            loop
            playsInline
            className='hacking-video'
            data-testid='hacking-video'
          >
            {/* Prioritize web-optimized formats for better performance */}
            <source src='/hacking.webm' type='video/webm' />
            <source src='/hacking.mp4' type='video/mp4' />
            <source src='/hacking.mov' type='video/quicktime' />
            <p className='video-fallback'>
              Your browser does not support the video tag.
              <br />
              <a href='/hacking.mp4' download>
                Download MP4 version
              </a>
            </p>
          </video>
        </div>
      </div>
    </div>
  );
};

export default Hacking;
