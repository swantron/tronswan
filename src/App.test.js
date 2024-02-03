import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders app container', () => {
    render(<App />);
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
  });

  test('renders app header', () => {
    render(<App />);
    const headerElement = screen.getByTestId('app-header');
    expect(headerElement).toBeInTheDocument();
  });

  test('renders logo', () => {
    render(<App />);
    const logoElement = screen.getByTestId('app-logo');
    expect(logoElement).toBeInTheDocument();
  });

  test('renders "swan tron dot com" link', () => {
    render(<App />);
    const linkElement = screen.getByTestId('swantron-link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://swantron.com');
  });

});
