import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import Music from './components/music/Music';
import HealthPage from './components/status/HealthPage';
import SwantronDetail from './components/swantron/SwantronDetail';
import SwantronList from './components/swantron/SwantronList';
import Chomptron from './components/ui/Chomptron';
import ErrorBoundary from './components/ui/ErrorBoundary';
import FizzBuzz from './components/ui/FizzBuzz';
import Hello from './components/ui/Hello';
import MLB from './components/ui/MLB';
import PageTransition from './components/ui/PageTransition';
import Resume from './components/ui/Resume';
import SEO from './components/ui/SEO';
import StudyGuide from './components/ui/StudyGuide';
import Weather from './components/ui/Weather';
import Baseball2 from './components/video/Baseball2';
import BuschLeague from './components/video/BuschLeague';
import Coffee from './components/video/Coffee';
import DealWithFont from './components/video/DealWithFont';
import DealWithIt from './components/video/DealWithIt';
import DealWithWord from './components/video/DealWithWord';
import Dynomite from './components/video/Dynomite';
import GangamStyle from './components/video/GangamStyle';
import Hacking from './components/video/Hacking';
import JobWellDone from './components/video/JobWellDone';
import KingKong from './components/video/KingKong';
import Mishap from './components/video/Mishap';
import Peloton from './components/video/Peloton';
import Seeya from './components/video/Seeya';
import Shorts from './components/video/Shorts';
import ThumbsUp from './components/video/ThumbsUp';
import Working from './components/video/Working';
import Wrigley from './components/video/Wrigley';
import logo from './robotard-removebg-preview.png';
import { logger } from './utils/logger';
import './App.css';

function Home() {
  React.useEffect(() => {
    logger.info('Home page loaded', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    });
  }, []);

  const handleSwantronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Randomly choose between gangamstyle, hacking, dealwithit1, dealwithit2, dealwithit3, baseball1, baseball2, kingkong, buschleague, thumbsup, jobwelldone, coffee, mishap, peloton, seeya, dynomite, and working
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
      path = '/dealwithit';
    } else if (random < 0.235) {
      // 4/17 chance
      path = '/dealwithfont';
    } else if (random < 0.294) {
      // 5/17 chance
      path = '/dealwithword';
    } else if (random < 0.353) {
      // 6/17 chance
      path = '/wrigley';
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

    logger.info('Swantron link clicked', {
      selectedPath: path,
      randomValue: random,
      timestamp: new Date().toISOString(),
    });

    window.location.href = path;
  };

  return (
    <div className='home-container'>
      <h1 className='App-title' data-testid='app-title'>
        tronswan
      </h1>
      <img
        src={logo}
        className='App-logo'
        alt='logo'
        data-testid='app-logo'
        fetchPriority='high'
        loading='eager'
      />

      <div className='home-description'>
        <h2 className='swantron-link'>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href='#'
            onClick={handleSwantronClick}
            data-testid='swantron-link'
            role='button'
            aria-label='Navigate to random video'
          >
            tron swan dot com
          </a>
        </h2>
      </div>
    </div>
  );
}

function Navigation() {
  const location = useLocation();

  return (
    <nav className='main-nav'>
      <Link
        to='/'
        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - Home', {
            target: '/',
            timestamp: new Date().toISOString(),
          })
        }
      >
        home
      </Link>
      <Link
        to='/swantron'
        className={`nav-link ${location.pathname.startsWith('/swantron') ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - Swantron', {
            target: '/swantron',
            timestamp: new Date().toISOString(),
          })
        }
      >
        swantron
      </Link>
      <Link
        to='/weather'
        className={`nav-link ${location.pathname === '/weather' ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - Weather', {
            target: '/weather',
            timestamp: new Date().toISOString(),
          })
        }
      >
        weathertron
      </Link>
      <Link
        to='/chomptron'
        className={`nav-link ${location.pathname === '/chomptron' ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - Chomptron', {
            target: '/chomptron',
            timestamp: new Date().toISOString(),
          })
        }
      >
        chomptron
      </Link>
      <Link
        to='/music'
        className={`nav-link ${location.pathname === '/music' ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - Music', {
            target: '/music',
            timestamp: new Date().toISOString(),
          })
        }
      >
        music
      </Link>
      <Link
        to='/mlb'
        className={`nav-link ${location.pathname === '/mlb' ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - MLB', {
            target: '/mlb',
            timestamp: new Date().toISOString(),
          })
        }
      >
        mlb
      </Link>
      <Link
        to='/status'
        className={`nav-link ${location.pathname === '/status' ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - Status', {
            target: '/status',
            timestamp: new Date().toISOString(),
          })
        }
      >
        status
      </Link>
      <Link
        to='/shorts'
        className={`nav-link ${location.pathname === '/shorts' ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - Shorts', {
            target: '/shorts',
            timestamp: new Date().toISOString(),
          })
        }
      >
        shorts
      </Link>
      <Link
        to='/hello'
        className={`nav-link ${location.pathname === '/hello' ? 'active' : ''}`}
        onClick={() =>
          logger.info('Navigation clicked - Hello', {
            target: '/hello',
            timestamp: new Date().toISOString(),
          })
        }
      >
        hello
      </Link>
    </nav>
  );
}

function App() {
  React.useEffect(() => {
    logger.info('App initialized', {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
    });
  }, []);

  return (
    <Router>
      <div className='App' data-testid='app-container'>
        <header className='App-header' data-testid='app-header'>
          <div className='App-container'>
            <Navigation />

            <ErrorBoundary>
              <PageTransition>
                <Routes>
                  <Route
                    path='/'
                    element={
                      <>
                        <SEO />
                        <Home />
                      </>
                    }
                  />
                  <Route path='/chomptron' element={<Chomptron />} />
                  <Route path='/swantron' element={<SwantronList />} />
                  <Route path='/swantron/:id' element={<SwantronDetail />} />
                  <Route path='/weather' element={<Weather />} />
                  <Route path='/hacking' element={<Hacking />} />
                  <Route path='/gangamstyle' element={<GangamStyle />} />
                  <Route path='/dealwithit' element={<DealWithIt />} />
                  <Route path='/dealwithfont' element={<DealWithFont />} />
                  <Route path='/dealwithword' element={<DealWithWord />} />
                  <Route path='/wrigley' element={<Wrigley />} />
                  <Route path='/baseball2' element={<Baseball2 />} />
                  <Route path='/kingkong' element={<KingKong />} />
                  <Route path='/buschleague' element={<BuschLeague />} />
                  <Route path='/thumbsup' element={<ThumbsUp />} />
                  <Route path='/jobwelldone' element={<JobWellDone />} />
                  <Route path='/coffee' element={<Coffee />} />
                  <Route path='/mishap' element={<Mishap />} />
                  <Route path='/peloton' element={<Peloton />} />
                  <Route path='/seeya' element={<Seeya />} />
                  <Route path='/dynomite' element={<Dynomite />} />
                  <Route path='/working' element={<Working />} />
                  <Route path='/shorts' element={<Shorts />} />
                  <Route path='/music' element={<Music />} />
                  <Route path='/music/callback' element={<Music />} />
                  <Route path='/mlb' element={<MLB />} />
                  <Route path='/trontronbuzztron' element={<FizzBuzz />} />
                  <Route path='/hello' element={<Hello />} />
                  <Route path='/resume' element={<Resume />} />
                  <Route path='/study-guide' element={<StudyGuide />} />
                  <Route path='/status' element={<HealthPage />} />
                </Routes>
              </PageTransition>
            </ErrorBoundary>
          </div>
        </header>
      </div>
    </Router>
  );
}

export default App;
