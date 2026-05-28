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
    const navLinks = screen
      .getAllByRole('link')
      .filter(link => link.closest('nav'));
    expect(navLinks).toHaveLength(4);

    expect(screen.getByRole('link', { name: 'home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'projects' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'about' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'blog' })).toBeInTheDocument();
  });

  // Footer should render the status link and a github link.
  test('renders footer with status and github links', () => {
    render(<App />);
    const footer = screen.getByTestId('app-footer');
    expect(footer).toBeInTheDocument();

    const statusLink = screen.getByTestId('footer-status-link');
    expect(statusLink).toBeInTheDocument();
    expect(statusLink).toHaveAttribute('href', '/status');

    const githubLink = screen.getByTestId('footer-github-link');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/swantron');
  });

  // Home should render the new tagline.
  test('renders home tagline', () => {
    render(<App />);
    const tagline = screen.getByTestId('app-tagline');
    expect(tagline).toBeInTheDocument();
    expect(tagline).toHaveTextContent(/joseph swanson/i);
  });

  // Test to check if the home page content is rendered by default.
  test('renders home page content by default', () => {
    render(<App />);
    const titleElement = screen.getByTestId('app-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('tron swan dot com');

    const logoElement = screen.getByTestId('app-logo');
    expect(logoElement).toBeInTheDocument();

    const swantronLink = screen.getByTestId('swantron-link');
    expect(swantronLink).toBeInTheDocument();
    expect(swantronLink.tagName).toBe('A');

    const projectsLink = screen.getByTestId('projects-link');
    expect(projectsLink).toBeInTheDocument();
    expect(projectsLink).toHaveTextContent('projects');
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

    test('logs when projects link is clicked', () => {
      render(<App />);
      const projectsNavLink = screen.getByRole('link', { name: 'projects' });
      fireEvent.click(projectsNavLink);
      expect(logger.info).toHaveBeenCalledWith(
        'Navigation clicked - Projects',
        {
          target: '/projects',
          timestamp: expect.any(String),
        }
      );
    });

    test('logs when about link is clicked', () => {
      render(<App />);
      const aboutLink = screen.getByRole('link', { name: 'about' });
      fireEvent.click(aboutLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - About', {
        target: '/hello',
        timestamp: expect.any(String),
      });
    });

    test('logs when blog link is clicked', () => {
      render(<App />);
      const blogLink = screen.getByRole('link', { name: 'blog' });
      fireEvent.click(blogLink);
      expect(logger.info).toHaveBeenCalledWith('Navigation clicked - Blog', {
        target: '/swantron',
        timestamp: expect.any(String),
      });
    });

    test('logs when footer status link is clicked', () => {
      render(<App />);
      const statusLink = screen.getByTestId('footer-status-link');
      fireEvent.click(statusLink);
      expect(logger.info).toHaveBeenCalledWith('Footer clicked - Status', {
        target: '/status',
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
