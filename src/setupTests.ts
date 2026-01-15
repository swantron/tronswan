// Vitest setup file
// This file is automatically loaded by Vitest before running tests
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock react-helmet-async globally for all tests
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'helmet' }, children),
  HelmetProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));
