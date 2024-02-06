import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom'; // Provides the extended matchers like toBeInTheDocument

// Mocking fetch call before the tests
beforeAll(() => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      main: {
        temp: '50',
        feels_like: '48',
        pressure: '1000',
        humidity: '10'
      }
    })
  }));
});

afterEach(() => {
  fetch.mockClear();
});

describe('App Component', () => {
  test('renders app container', async () => {
    render(<App />);
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
  });

  test('renders app header', async () => {
    render(<App />);
    const headerElement = screen.getByTestId('app-header');
    expect(headerElement).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<App />);
    const loadingMessage = screen.getByText(/Loading.../i);
    expect(loadingMessage).toBeInTheDocument();
  });

  // Uncomment and update this test to check for the logo's presence after loading completes
  test('renders logo after loading completes', async () => {
    render(<App />);
    const logoElement = await waitFor(() => screen.getByTestId('app-logo'));
    expect(logoElement).toBeInTheDocument();
  });

  // Example test for error message display (you would need to adjust fetch mock for an error scenario)
  test('renders error message on API call failure', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('API call failed')));
    render(<App />);
    const errorMessage = await waitFor(() => screen.getByText(/api call to openweathermap failed.. check the console/i));
    expect(errorMessage).toBeInTheDocument();
  });
});
