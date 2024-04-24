// Imports necessary utilities from the testing library and jest-dom for DOM assertions.
import { render, screen, waitFor } from '@testing-library/react';
import App from './App'; // Imports the App component to be tested.
import '@testing-library/jest-dom'; // Provides the extended matchers like toBeInTheDocument for easier DOM node assertions.

// Global setup for tests, mocking the fetch API call before all tests run.
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

// Cleans up mocks to prevent tests from affecting each other
afterEach(() => {
  fetch.mockClear();
});

// Grouping related tests about the App component.
describe('App Component', () => {
  // Test to ensure the App container is rendered properly.
  test('renders app container', async () => {
    render(<App />);
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
  });

  // Test to ensure the App header is rendered.
  test('renders app header', async () => {
    render(<App />);
    const headerElement = screen.getByTestId('app-header');
    expect(headerElement).toBeInTheDocument();
  });

  // Test to check if the loading message is displayed before data loads.
  test('renders loading state', () => {
    render(<App />);
    const loadingMessage = screen.getByText(/Loading.../i);
    expect(loadingMessage).toBeInTheDocument();
  });

  // Test to check if the logo is present after data has successfully loaded.
  test('renders logo after loading completes', async () => {
    render(<App />);
    const logoElement = await waitFor(() => screen.getByTestId('app-logo'));
    expect(logoElement).toBeInTheDocument();
  });

  // Test to simulate an API failure and check if an error message is displayed.
  test('renders error message on API call failure', async () => {
    // Mock the fetch to simulate an API failure.
    fetch.mockImplementationOnce(() => Promise.reject(new Error('API call failed')));
    render(<App />);
    // Expect to find an error message on the screen after the failed API call.
    const errorMessage = await waitFor(() => screen.getByText(/api call to openweathermap failed.. check the console/i));
    expect(errorMessage).toBeInTheDocument();
  });
});
