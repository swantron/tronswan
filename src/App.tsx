import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import ErrorBoundary from './components/ui/ErrorBoundary';
import Baseball1 from './components/video/Baseball1';
import Baseball2 from './components/video/Baseball2';
import BuschLeague from './components/video/BuschLeague';
import Coffee from './components/video/Coffee';
import DealWithIt1 from './components/video/DealWithIt1';
import DealWithIt2 from './components/video/DealWithIt2';
import DealWithIt3 from './components/video/DealWithIt3';
import KingKong from './components/video/KingKong';
import Mishap from './components/video/Mishap';
import Peloton from './components/video/Peloton';
import Seeya from './components/video/Seeya';
import ThumbsUp from './components/video/ThumbsUp';
import FizzBuzz from './components/ui/FizzBuzz';
import Gangnam1 from './components/video/Gangnam1';
import Gangnam2 from './components/video/Gangnam2';
import Hacking from './components/video/Hacking';
import JobWellDone from './components/video/JobWellDone';
import HealthPage from './components/status/HealthPage';
import Hello from './components/ui/Hello';
import RecipeDetail from './components/recipe/RecipeDetail';
import RecipeList from './components/recipe/RecipeList';
import Resume from './components/ui/Resume';
import SEO from './components/ui/SEO';
import SwantronDetail from './components/swantron/SwantronDetail';
import SwantronList from './components/swantron/SwantronList';
import Weather from './components/ui/Weather';
import logo from './robotard-removebg-preview.png';
import './App.css';

function Home() {
  const handleSwantronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Randomly choose between gangnam1, gangnam2, hacking, dealwithit1, dealwithit2, dealwithit3, baseball1, baseball2, kingkong, buschleague, thumbsup, jobwelldone, coffee, mishap, peloton, and seeya
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
          <a href='#' onClick={handleSwantronClick} data-testid='swantron-link'>
            tron swan dot com
          </a>
        </h2>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className='App' data-testid='app-container'>
        <header className='App-header' data-testid='app-header'>
          <div className='App-container'>
            <nav className='main-nav'>
              <Link to='/' className='nav-link'>
                tronswan
              </Link>
              <Link to='/swantron' className='nav-link'>
                swantron
              </Link>
              <Link to='/weather' className='nav-link'>
                weathertron
              </Link>
              <Link to='/recipes' className='nav-link'>
                chomptron
              </Link>
              <Link to='/hello' className='nav-link'>
                hello
              </Link>
              <Link to='/health' className='nav-link'>
                health
              </Link>
            </nav>

            <ErrorBoundary>
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
                <Route path='/recipes' element={<RecipeList />} />
                <Route path='/recipes/:id' element={<RecipeDetail />} />
                <Route path='/swantron' element={<SwantronList />} />
                <Route path='/swantron/:id' element={<SwantronDetail />} />
                <Route path='/weather' element={<Weather />} />
                <Route path='/hacking' element={<Hacking />} />
                <Route path='/gangnam1' element={<Gangnam1 />} />
                <Route path='/gangnam2' element={<Gangnam2 />} />
                <Route path='/dealwithit1' element={<DealWithIt1 />} />
                <Route path='/dealwithit2' element={<DealWithIt2 />} />
                <Route path='/dealwithit3' element={<DealWithIt3 />} />
                <Route path='/baseball1' element={<Baseball1 />} />
                <Route path='/baseball2' element={<Baseball2 />} />
                <Route path='/kingkong' element={<KingKong />} />
                <Route path='/buschleague' element={<BuschLeague />} />
                <Route path='/thumbsup' element={<ThumbsUp />} />
                <Route path='/jobwelldone' element={<JobWellDone />} />
                <Route path='/coffee' element={<Coffee />} />
                <Route path='/mishap' element={<Mishap />} />
                <Route path='/peloton' element={<Peloton />} />
                <Route path='/seeya' element={<Seeya />} />
                <Route path='/trontronbuzztron' element={<FizzBuzz />} />
                <Route path='/hello' element={<Hello />} />
                <Route path='/resume' element={<Resume />} />
                <Route path='/health' element={<HealthPage />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </header>
      </div>
    </Router>
  );
}

export default App;
