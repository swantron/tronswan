import logo from './robotard-removebg-preview.png';
import './App.css';

function App() {
  return (
    <div className="App" data-testid="app-container">
      <header className="App-header" data-testid="app-header">
        <img src={logo} className="App-logo" alt="logo" data-testid="app-logo" />
        <p data-testid="app-description">
          tron swan dot com
          a react joint
        </p>
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
      </header>
    </div>
  );
}

export default App;
