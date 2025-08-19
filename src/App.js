import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './robotard-removebg-preview.png';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import Weather from './components/Weather';
import FizzBuzz from './components/FizzBuzz';
import ErrorBoundary from './components/ErrorBoundary';
import SEO from './components/SEO';
import './App.css';


function Home() {
  return (
    <div className="home-container">
      <h1 className="App-title" data-testid="app-title">tronswan</h1>
      <img src={logo} className="App-logo" alt="logo" data-testid="app-logo" />
      
      <div className="home-description">
        <p>🤖 Welcome to the robot playground where technology meets creativity</p>
        <p>Explore our collection of robot-powered tools and discover the future of digital interaction</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App" data-testid="app-container">
        <header className="App-header" data-testid="app-header">
          <div className="App-container">
            <nav className="main-nav">
              <Link to="/" className="nav-link">tronswan</Link>
              <Link to="/recipes" className="nav-link">chomptron</Link>
              <Link to="/weather" className="nav-link">weathertron</Link>
              <Link to="/trontronbuzztron" className="nav-link">trontronbuzztron</Link>
            </nav>

            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<><SEO /><Home /></>} />
                <Route path="/recipes" element={<RecipeList />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/trontronbuzztron" element={<FizzBuzz />} />
              </Routes>
            </ErrorBoundary>

            <div className="external-links">
              <a
                className="App-link"
                href="https://swantron.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="swantron-link"
              >
                swan tron dot com
              </a>
              <a
                className="App-link"
                href="https://chomptron.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="chomptron-link"
              >
                chomp tron dot com
              </a>
            </div>
          </div>
        </header>
      </div>
    </Router>
  );
}

export default App;
