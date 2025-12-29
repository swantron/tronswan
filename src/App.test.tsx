import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, expect, describe, test, beforeEach } from 'vitest';
// Imports necessary utilities from the testing library and jest-dom for DOM assertions.

import App from './App'; // Imports the App component to be tested.
import { logger } from './utils/logger';
import '@testing-library/jest-dom'; // Provides the extended matchers like toBeInTheDocument for easier DOM node assertions.

// Mock the SEO component to prevent react-helmet-async errors in tests
vi.mock('./components/ui/SEO', () => ({
  default: function MockSEO() {
    return null; // Return null to render nothing
  },
}));

// Mock logger
vi.mock('./utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    configWarn: vi.fn(),
    apiError: vi.fn(),
  },
}));

// Mock window.location
const mockLocation = {
  href: 'http://localhost/',
  origin: 'http://localhost',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
  configurable: true,
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
    const navLinks = screen
      .getAllByRole('link')
      .filter(link => link.closest('nav'));
    expect(navLinks).toHaveLength(9);

    // Check specific navigation text
    expect(screen.getByRole('link', { name: 'home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'swantron' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'weathertron' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'chomptron' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'hello' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'health' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'shorts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'music' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'mlb' })).toBeInTheDocument();
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
    expect(swantronLink.tagName).toBe('A');
    expect(swantronLink).toHaveTextContent('tron swan dot com');
  });

  // Test to check if the home container is rendered.
  test('renders home container', () => {
    render(<App />);
    const homeContainer = screen
      .getByTestId('swantron-link')
      .closest('.home-container');
    expect(homeContainer).toBeInTheDocument();
  });

  // Test that App component logs initialization
  test('logs app initialization on mount', () => {
    render(<App />);
    expect(logger.info).toHaveBeenCalledWith('App initialized', {
      timestamp: expect.any(String),
      nodeEnv: expect.any(String),
      userAgent: expect.any(String),
    });
  });

  // Test that Home component logs page load
  test('logs home page load on mount', () => {
    render(<App />);
    expect(logger.info).toHaveBeenCalledWith('Home page loaded', {
      timestamp: expect.any(String),
      userAgent: expect.any(String),
      referrer: expect.any(String),
    });
  });

  // Test navigation link onClick handlers
  describe('Navigation link clicks', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('logs when home link is clicked', () => {
      render(<App />);
      const homeLink = screen.getByRole('link', { name: 'home' });
      fireEvent.click(homeLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - Home', {
        target: '/',
        timestamp: expect.any(String),
      });
    });

    test('logs when swantron link is clicked', () => {
      render(<App />);
      const swantronLink = screen.getByRole('link', { name: 'swantron' });
      fireEvent.click(swantronLink);
      expect(logger.info).toHaveBeenCalledWith(
        'Navigation clicked - Swantron',
        {
          target: '/swantron',
          timestamp: expect.any(String),
        }
      );
    });

    test('logs when music link is clicked', () => {
      render(<App />);
      const musicLink = screen.getByRole('link', { name: 'music' });
      fireEvent.click(musicLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - Music', {
        target: '/music',
        timestamp: expect.any(String),
      });
    });

    test('logs when mlb link is clicked', () => {
      render(<App />);
      const mlbLink = screen.getByRole('link', { name: 'mlb' });
      fireEvent.click(mlbLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - MLB', {
        target: '/mlb',
        timestamp: expect.any(String),
      });
    });

    test('logs when weather link is clicked', () => {
      render(<App />);
      const weatherLink = screen.getByRole('link', { name: 'weathertron' });
      fireEvent.click(weatherLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - Weather', {
        target: '/weather',
        timestamp: expect.any(String),
      });
    });

    test('logs when chomptron link is clicked', () => {
      render(<App />);
      const chomptronLink = screen.getByRole('link', { name: 'chomptron' });
      fireEvent.click(chomptronLink);
      expect(logger.info).toHaveBeenCalledWith(
        'Navigation clicked - Chomptron',
        {
          target: '/chomptron',
          timestamp: expect.any(String),
        }
      );
    });

    test('logs when health link is clicked', () => {
      render(<App />);
      const healthLink = screen.getByRole('link', { name: 'health' });
      fireEvent.click(healthLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - Health', {
        target: '/health',
        timestamp: expect.any(String),
      });
    });

    test('logs when shorts link is clicked', () => {
      render(<App />);
      const shortsLink = screen.getByRole('link', { name: 'shorts' });
      fireEvent.click(shortsLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - Shorts', {
        target: '/shorts',
        timestamp: expect.any(String),
      });
    });

    test('logs when hello link is clicked', () => {
      render(<App />);
      const helloLink = screen.getByRole('link', { name: 'hello' });
      fireEvent.click(helloLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - Hello', {
        target: '/hello',
        timestamp: expect.any(String),
      });
    });
  });

  // Test handleSwantronClick function
  describe('Swantron link click handler', () => {
    beforeEach(() => {
      mockLocation.href = '';
      vi.clearAllMocks();
    });

    test('redirects to /gangamstyle when random < 0.059', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.05);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(logger.info).toHaveBeenCalledWith('Swantron link clicked', {
        selectedPath: '/gangamstyle',
        randomValue: 0.05,
        timestamp: expect.any(String),
      });
      expect(window.location.href).toBe('/gangamstyle');
    });

    test('redirects to /hacking when random < 0.118', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/hacking');
    });

    test('redirects to /dealwithit when random < 0.176', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.15);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/dealwithit');
    });

    test('redirects to /dealwithfont when random < 0.235', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.2);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/dealwithfont');
    });

    test('redirects to /dealwithword when random < 0.294', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.25);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/dealwithword');
    });

    test('redirects to /wrigley when random < 0.353', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.3);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/wrigley');
    });

    test('redirects to /baseball2 when random < 0.412', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.4);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/baseball2');
    });

    test('redirects to /kingkong when random < 0.471', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.45);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/kingkong');
    });

    test('redirects to /buschleague when random < 0.529', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/buschleague');
    });

    test('redirects to /thumbsup when random < 0.588', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.55);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/thumbsup');
    });

    test('redirects to /jobwelldone when random < 0.647', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.6);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/jobwelldone');
    });

    test('redirects to /coffee when random < 0.706', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.65);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/coffee');
    });

    test('redirects to /mishap when random < 0.765', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.72);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/mishap');
    });

    test('redirects to /peloton when random < 0.824', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/peloton');
    });

    test('redirects to /seeya when random < 0.882', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.85);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/seeya');
    });

    test('redirects to /dynomite when random < 0.941', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/dynomite');
    });

    test('redirects to /working when random >= 0.941', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.95);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      expect(window.location.href).toBe('/working');
    });

    test('prevents default behavior and redirects on click', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      render(<App />);
      const swantronLink = screen.getByTestId('swantron-link');
      fireEvent.click(swantronLink);
      // The click handler calls preventDefault internally and redirects
      expect(window.location.href).toBe('/buschleague');
      expect(logger.info).toHaveBeenCalledWith('Swantron link clicked', {
        selectedPath: '/buschleague',
        randomValue: 0.5,
        timestamp: expect.any(String),
      });
    });
  });
});
