import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import FizzBuzz from './components/FizzBuzz';
import Gangnam1 from './components/Gangnam1';
import Gangnam2 from './components/Gangnam2';
import Hacking from './components/Hacking';
import HealthPage from './components/HealthPage';
import Hello from './components/Hello';
import RecipeDetail from './components/RecipeDetail';
import RecipeList from './components/RecipeList';
import Resume from './components/Resume';
import SEO from './components/SEO';
import SwantronDetail from './components/SwantronDetail';
import SwantronList from './components/SwantronList';
import Weather from './components/Weather';
import logo from './robotard-removebg-preview.png';
import './App.css';

function Home() {
  const handleSwantronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Randomly choose between gangnam1, gangnam2, and hacking
    const random = Math.random();
    let path;
    if (random < 0.33) {
      path = '/gangnam1';
    } else if (random < 0.66) {
      path = '/gangnam2';
    } else {
      path = '/hacking';
    }
    window.location.href = path;
  };

  return (
    <div className='home-container'>
      <h1 className='App-title' data-testid='app-title'>
        tronswan
      </h1>
      <img src={logo} className='App-logo' alt='logo' data-testid='app-logo' />

      <div className='home-description'>
        <h2 className='swantron-link'>
          <a
            href='#'
            onClick={handleSwantronClick}
            data-testid='swantron-link'
          >
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
