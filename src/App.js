import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './robotard-removebg-preview.png';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import Weather from './components/Weather';
import FizzBuzz from './components/FizzBuzz';
import Hello from './components/Hello';
import SwantronList from './components/SwantronList';
import SwantronDetail from './components/SwantronDetail';
import ErrorBoundary from './components/ErrorBoundary';
import SEO from './components/SEO';
import './App.css';


function Home() {
  return (
    <div className="home-container">
      <h1 className="App-title" data-testid="app-title">tronswan</h1>
      <img src={logo} className="App-logo" alt="logo" data-testid="app-logo" />
      
      <div className="home-description">
        <h2 className="App-title" data-testid="swantron-link">
          <a 
            href="https://swantron.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
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
      <div className="App" data-testid="app-container">
        <header className="App-header" data-testid="app-header">
          <div className="App-container">
            <nav className="main-nav">
              <Link to="/" className="nav-link">tronswan</Link>
              <Link to="/recipes" className="nav-link">chomptron</Link>
              <Link to="/swantron" className="nav-link">swantron</Link>
              <Link to="/weather" className="nav-link">weathertron</Link>
              <Link to="/trontronbuzztron" className="nav-link">trontronbuzztron</Link>
              <Link to="/hello" className="nav-link">hello</Link>
            </nav>

            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<><SEO /><Home /></>} />
                <Route path="/recipes" element={<RecipeList />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route path="/swantron" element={<SwantronList />} />
                <Route path="/swantron/:id" element={<SwantronDetail />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/trontronbuzztron" element={<FizzBuzz />} />
                <Route path="/hello" element={<Hello />} />
              </Routes>
            </ErrorBoundary>

          </div>
        </header>
      </div>
    </Router>
  );
}

export default App;
