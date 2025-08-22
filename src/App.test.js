// Imports necessary utilities from the testing library and jest-dom for DOM assertions.
import { render, screen } from '@testing-library/react';
import App from './App'; // Imports the App component to be tested.
import '@testing-library/jest-dom'; // Provides the extended matchers like toBeInTheDocument for easier DOM node assertions.

// Mock the SEO component to prevent react-helmet-async errors in tests
jest.mock('./components/SEO', () => {
  return function MockSEO() {
    return null; // Return null to render nothing
  };
});

// Grouping related tests about the App component.
describe('App Component', () => {
  // Test to ensure the App container is rendered properly.
  test('renders app container', () => {
    render(<App />);
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
  });

  // Test to ensure the App header is rendered.
  test('renders app header', () => {
    render(<App />);
    const headerElement = screen.getByTestId('app-header');
    expect(headerElement).toBeInTheDocument();
  });

  // Test to check if the navigation links are rendered.
  test('renders navigation links', () => {
    render(<App />);
    // Test navigation links specifically - only the nav bar links, not the swantron link
    const navLinks = screen.getAllByRole('link').filter(link => link.closest('nav'));
    expect(navLinks).toHaveLength(7);
    
    // Check specific navigation text
    expect(screen.getByRole('link', { name: 'tronswan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'chomptron' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'swantron' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'weathertron' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'hacking' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'trontronbuzztron' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'hello' })).toBeInTheDocument();
  });

  // Test to check if the home page content is rendered by default.
  test('renders home page content by default', () => {
    render(<App />);
    const titleElement = screen.getByTestId('app-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('tronswan');
    
    const logoElement = screen.getByTestId('app-logo');
    expect(logoElement).toBeInTheDocument();
    
    const swantronLink = screen.getByTestId('swantron-link');
    expect(swantronLink).toBeInTheDocument();
    expect(swantronLink).toHaveAttribute('href', 'https://swantron.com');
    expect(swantronLink).toHaveTextContent('tron swan dot com');
    
    const getItButton = screen.getByTestId('get-it-button');
    expect(getItButton).toBeInTheDocument();
    expect(getItButton).toHaveTextContent('get it');
  });

  // Test to check if the home container is rendered.
  test('renders home container', () => {
    render(<App />);
    const homeContainer = screen.getByTestId('swantron-link').closest('.home-container');
    expect(homeContainer).toBeInTheDocument();
  });
});
