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
import Footer from './components/ui/Footer';
import Hello from './components/ui/Hello';
import MLB from './components/ui/MLB';
import PageTransition from './components/ui/PageTransition';
import Projects from './components/ui/Projects';
import Resume from './components/ui/Resume';
import SEO from './components/ui/SEO';
import StudyGuide from './components/ui/StudyGuide';
import Weather from './components/ui/Weather';
import Wrenchtron from './components/ui/Wrenchtron';
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
        tron swan dot com
      </h1>
      <p className='App-tagline' data-testid='app-tagline'>
        projects &amp; experiments by joseph swanson
      </p>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        href='#'
        onClick={handleSwantronClick}
        data-testid='swantron-link'
        role='button'
        aria-label='Click the robot for a random video'
        title='click the robot for chaos'
        className='logo-link'
      >
        <img
          src={logo}
          className='App-logo'
          alt='logo'
          data-testid='app-logo'
          fetchPriority='high'
          loading='eager'
        />
      </a>

      <div className='home-cta-row'>
        <Link
          to='/projects'
          className='projects-cta'
          data-testid='projects-link'
        >
          projects →
        </Link>
      </div>
    </div>
  );
}

function Navigation() {
  const location = useLocation();
  const path = location.pathname;

  const isProjectsActive =
    path === '/projects' ||
    path === '/weathertron' ||
    path === '/chomptron' ||
    path === '/wrenchtron' ||
    path === '/music' ||
    path.startsWith('/music/') ||
    path === '/mlb';
  const isAboutActive = path === '/hello' || path === '/resume';
  const isBlogActive = path.startsWith('/swantron');

  return (
    <nav className='main-nav'>
      <Link
        to='/'
        className={`nav-link ${path === '/' ? 'active' : ''}`}
        aria-current={path === '/' ? 'page' : undefined}
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
        to='/projects'
        className={`nav-link ${isProjectsActive ? 'active' : ''}`}
        aria-current={isProjectsActive ? 'page' : undefined}
        onClick={() =>
          logger.info('Navigation clicked - Projects', {
            target: '/projects',
            timestamp: new Date().toISOString(),
          })
        }
      >
        projects
      </Link>
      <Link
        to='/hello'
        className={`nav-link ${isAboutActive ? 'active' : ''}`}
        aria-current={isAboutActive ? 'page' : undefined}
        onClick={() =>
          logger.info('Navigation clicked - About', {
            target: '/hello',
            timestamp: new Date().toISOString(),
          })
        }
      >
        about
      </Link>
      <Link
        to='/swantron'
        className={`nav-link ${isBlogActive ? 'active' : ''}`}
        aria-current={isBlogActive ? 'page' : undefined}
        onClick={() =>
          logger.info('Navigation clicked - Blog', {
            target: '/swantron',
            timestamp: new Date().toISOString(),
          })
        }
      >
        blog
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
                  <Route path='/projects' element={<Projects />} />
                  <Route path='/chomptron' element={<Chomptron />} />
                  <Route path='/wrenchtron' element={<Wrenchtron />} />
                  <Route path='/swantron' element={<SwantronList />} />
                  <Route path='/swantron/:id' element={<SwantronDetail />} />
                  <Route path='/weathertron' element={<Weather />} />
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
          <Footer />
        </header>
      </div>
    </Router>
  );
}

export default App;
