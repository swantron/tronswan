import React from 'react';
import { Link } from 'react-router-dom';
import VideoPage from './VideoPage';
import './Shorts.css';

interface VideoItem {
  id: string;
  title: string;
  path: string;
  thumbnail?: string;
}

const Shorts: React.FC = () => {
  const videos: VideoItem[] = [
    { id: 'gangamstyle', title: 'gangam style', path: '/gangamstyle' },
    { id: 'hacking', title: 'hacking', path: '/hacking' },
    { id: 'dealwithit1', title: 'deal with it 1', path: '/dealwithit1' },
    { id: 'dealwithit2', title: 'deal with it 2', path: '/dealwithit2' },
    { id: 'dealwithit3', title: 'deal with it 3', path: '/dealwithit3' },
    { id: 'baseball1', title: 'baseball 1', path: '/baseball1' },
    { id: 'baseball2', title: 'glove up', path: '/baseball2' },
    { id: 'kingkong', title: 'kong tron', path: '/kingkong' },
    { id: 'buschleague', title: 'busch dot league', path: '/buschleague' },
    { id: 'thumbsup', title: 'thumbs up', path: '/thumbsup' },
    { id: 'jobwelldone', title: 'job well done', path: '/jobwelldone' },
    { id: 'coffee', title: 'coffee', path: '/coffee' },
    { id: 'mishap', title: 'mishap', path: '/mishap' },
    { id: 'peloton', title: 'peloton', path: '/peloton' },
    { id: 'seeya', title: 'seeya', path: '/seeya' },
    { id: 'dynomite', title: 'dynomite', path: '/dynomite' },
    { id: 'working', title: 'working', path: '/working' },
  ];

  return (
    <div className="shorts-container">
      <div className="shorts-header">
        <h1 className="shorts-title">Shorts</h1>
        <p className="shorts-subtitle">All your favorite videos in one place</p>
      </div>
      
      <div className="shorts-grid">
        {videos.map((video) => (
          <Link
            key={video.id}
            to={video.path}
            className="shorts-item"
            data-testid={`shorts-item-${video.id}`}
          >
            <div className="shorts-thumbnail">
              <video
                className="shorts-preview-video"
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src={`/${video.id}.mp4`} type="video/mp4" />
              </video>
              <div className="shorts-play-overlay">
                <div className="shorts-play-button">▶</div>
              </div>
            </div>
            <div className="shorts-info">
              <h3 className="shorts-video-title">{video.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shorts;
