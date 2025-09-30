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
    { id: 'gangnam_1', title: 'gangam style', path: '/gangamstyle' },
    { id: 'hacking', title: 'hacking', path: '/hacking' },
    { id: 'dealwithit', title: 'deal with it', path: '/dealwithit' },
    { id: 'dealwithfont', title: 'deal with font', path: '/dealwithfont' },
    { id: 'dealwithword', title: 'deal with word', path: '/dealwithword' },
    { id: 'wrigley', title: 'wrigley', path: '/wrigley' },
    { id: 'baseball_2', title: 'glove up', path: '/baseball2' },
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
