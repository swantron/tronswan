import React from 'react';
import '../styles/Hacking.css';

const Hacking = () => {
  return (
    <div className="hacking-container" data-testid="hacking-container">
      <div className="hacking-content">
        <h1 className="hacking-title">🤖 Hacking in Progress...</h1>
        <p className="hacking-subtitle">Accessing mainframe... Bypassing firewalls...</p>
        
        <div className="video-container">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="hacking-video"
            data-testid="hacking-video"
          >
            {/* Prioritize web-optimized formats for better performance */}
            <source src="/hacking.webm" type="video/webm" />
            <source src="/hacking.mp4" type="video/mp4" />
            <source src="/hacking.mov" type="video/quicktime" />
            <p className="video-fallback">
              Your browser does not support the video tag. 
              <br />
              <a href="/hacking.mp4" download>Download MP4 version</a>
            </p>
          </video>
        </div>
        
        <div className="hacking-status">
          <div className="status-line">
            <span className="status-label">Status:</span>
            <span className="status-value">INTRUDING</span>
          </div>
          <div className="status-line">
            <span className="status-label">Progress:</span>
            <span className="status-value">99.9%</span>
          </div>
          <div className="status-line">
            <span className="status-label">Target:</span>
            <span className="status-value">MAINFRAME</span>
          </div>
        </div>
        
        <div className="matrix-effect">
          <div className="matrix-line">01010101 10101010 01010101 10101010</div>
          <div className="matrix-line">10101010 01010101 10101010 01010101</div>
          <div className="matrix-line">01010101 10101010 01010101 10101010</div>
        </div>
      </div>
    </div>
  );
};

export default Hacking;
