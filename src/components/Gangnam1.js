import React from 'react';
import '../styles/Gangnam.css';

const Gangnam1 = () => {
  return (
    <div className="gangnam-container" data-testid="gangnam1-container">
      <div className="gangnam-content">
        <h1 className="gangnam-title">gangnam style</h1>
        
        <div className="video-container">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="gangnam-video"
            data-testid="gangnam1-video"
          >
            <source src="/gangnam_1.mp4" type="video/mp4" />
            <p className="video-fallback">
              Your browser does not support the video tag. 
              <br />
              <a href="/gangnam_1.mp4" download>Download MP4 version</a>
            </p>
          </video>
        </div>
      </div>
    </div>
  );
};

export default Gangnam1;
