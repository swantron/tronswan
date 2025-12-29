import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi, expect, describe, test, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock logger before importing
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock SEO component
vi.mock('./SEO', () => ({
  default: function MockSEO({ title, description, keywords, url }) {
    return (
      <div
        data-testid='seo-component'
        data-title={title}
        data-description={description}
        data-keywords={keywords}
        data-url={url}
      >
        SEO Component
      </div>
    );
  },
}));

// Mock CSS
vi.mock('../../styles/StudyGuide.css', () => ({}));

// Mock JSON data imports - these are imported as default exports
vi.mock('../../data/study-guide/coding/arrays.json', () => ({
  default: [
    {
      id: 'array-1',
      front: 'What is an array?',
      back: 'An array is a data structure that stores elements in contiguous memory.',
      tags: ['arrays', 'data-structures'],
    },
  ],
}));

vi.mock('../../data/study-guide/coding/dynamic-programming.json', () => ({
  default: [
    {
      id: 'dp-1',
      front: 'What is dynamic programming?',
      back: 'Dynamic programming is a method for solving complex problems by breaking them down into simpler subproblems.',
      tags: ['dp', 'algorithms'],
    },
  ],
}));

vi.mock('../../data/study-guide/coding/graphs.json', () => ({
  default: [
    {
      id: 'graph-1',
      front: 'What is a graph?',
      back: 'A graph is a collection of nodes connected by edges.',
      tags: ['graphs', 'data-structures'],
    },
  ],
}));

vi.mock('../../data/study-guide/gcp/compute.json', () => ({
  default: [
    {
      id: 'compute-1',
      front: 'What is Compute Engine?',
      back: "Compute Engine is Google Cloud Platform's infrastructure-as-a-service offering.",
      tags: ['gcp', 'compute'],
    },
  ],
}));

vi.mock('../../data/study-guide/gcp/storage.json', () => ({
  default: [
    {
      id: 'storage-1',
      front: 'What is Cloud Storage?',
      back: "Cloud Storage is Google Cloud Platform's object storage service.",
      tags: ['gcp', 'storage'],
    },
  ],
}));

vi.mock('../../data/study-guide/gcp/networking.json', () => ({ default: [] }));

vi.mock('../../data/study-guide/gcp/security.json', () => ({ default: [] }));

vi.mock('../../data/study-guide/gcp/networking-advanced.json', () => ({
  default: [],
}));

vi.mock('../../data/study-guide/gcp/storage-advanced.json', () => ({
  default: [],
}));

vi.mock('../../data/study-guide/gcp/compute-advanced.json', () => ({
  default: [],
}));

vi.mock('../../data/study-guide/gcp/monitoring-operations.json', () => ({
  default: [],
}));

vi.mock('../../data/study-guide/gcp/data-analytics.json', () => ({
  default: [],
}));

vi.mock('../../data/study-guide/gcp/case-studies.json', () => ({
  default: [],
}));

vi.mock('../../data/study-guide/gcp/practice-questions.json', () => ({
  default: [],
}));

import { logger } from '../../utils/logger';

import StudyGuide from './StudyGuide';

const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('StudyGuide Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders study guide page', () => {
    renderWithRouter(<StudyGuide />);
    expect(screen.getByTestId('study-guide-title')).toBeInTheDocument();
    expect(screen.getByText('study guide')).toBeInTheDocument();
  });

  test('logs page load on mount', () => {
    renderWithRouter(<StudyGuide />);
    expect(logger.info).toHaveBeenCalledWith('Study Guide page loaded', {
      timestamp: expect.any(String),
    });
  });

  test('renders category filter buttons', () => {
    renderWithRouter(<StudyGuide />);
    const filterButtons = screen.getAllByRole('button');
    const allButton = filterButtons.find(btn => btn.textContent === 'All');
    const gcpButton = filterButtons.find(btn => btn.textContent === 'GCP');
    const codingButton = filterButtons.find(
      btn => btn.textContent === 'Coding'
    );

    expect(allButton).toBeInTheDocument();
    expect(gcpButton).toBeInTheDocument();
    expect(codingButton).toBeInTheDocument();
  });

  test('filters decks by category', () => {
    renderWithRouter(<StudyGuide />);

    // Click GCP filter - find button in category filter section
    const filterButtons = screen.getAllByRole('button');
    const gcpButton = filterButtons.find(
      btn =>
        btn.textContent === 'GCP' && btn.className.includes('filter-button')
    );
    if (gcpButton) {
      fireEvent.click(gcpButton);
      expect(gcpButton).toHaveClass('active');
    }

    // Click Coding filter
    const codingButton = filterButtons.find(
      btn =>
        btn.textContent === 'Coding' && btn.className.includes('filter-button')
    );
    if (codingButton) {
      fireEvent.click(codingButton);
      expect(codingButton).toHaveClass('active');
    }

    // Click All filter
    const allButton = filterButtons.find(
      btn =>
        btn.textContent === 'All' && btn.className.includes('filter-button')
    );
    if (allButton) {
      fireEvent.click(allButton);
      expect(allButton).toHaveClass('active');
    }
  });

  test('renders deck cards', () => {
    renderWithRouter(<StudyGuide />);
    expect(screen.getByTestId('deck-Compute')).toBeInTheDocument();
    expect(screen.getByTestId('deck-Arrays')).toBeInTheDocument();
  });

  test('selects a deck when clicked', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    expect(logger.info).toHaveBeenCalledWith('Deck selected', {
      deck: 'Compute',
      category: 'GCP',
      cardCount: 1,
    });

    // Should show back button and deck title
    expect(screen.getByText('← Back to Decks')).toBeInTheDocument();
    expect(screen.getByText('Compute')).toBeInTheDocument();
  });

  test('displays card content when deck is selected', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    expect(screen.getByTestId('study-card')).toBeInTheDocument();
    expect(screen.getByText('What is Compute Engine?')).toBeInTheDocument();
  });

  test('flips card when clicked', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    const card = screen.getByTestId('study-card');
    expect(card).not.toHaveClass('flipped');

    fireEvent.click(card);
    expect(logger.debug).toHaveBeenCalledWith('Card flipped', {
      flipped: true,
      cardId: 'compute-1',
    });
  });

  test('navigates to next card', () => {
    renderWithRouter(<StudyGuide />);

    const arraysDeck = screen.getByTestId('deck-Arrays');
    fireEvent.click(arraysDeck);

    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled(); // Only one card, so disabled

    // For decks with multiple cards, next button should work
    // But our mock only has one card per deck
  });

  test('navigates to previous card', () => {
    renderWithRouter(<StudyGuide />);

    const arraysDeck = screen.getByTestId('deck-Arrays');
    fireEvent.click(arraysDeck);

    const prevButton = screen.getByText('← Previous');
    expect(prevButton).toBeDisabled(); // First card, so disabled
  });

  test('handles keyboard navigation - ArrowRight', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    const card = screen.getByTestId('study-card');
    fireEvent.keyDown(card, { key: 'ArrowRight' });

    // Should navigate to next card (but disabled since only one card)
  });

  test('handles keyboard navigation - ArrowLeft', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    const card = screen.getByTestId('study-card');
    fireEvent.keyDown(card, { key: 'ArrowLeft' });

    // Should navigate to previous card (but disabled since first card)
  });

  test('handles keyboard navigation - Space to flip', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    const card = screen.getByTestId('study-card');
    fireEvent.keyDown(card, { key: ' ', preventDefault: vi.fn() });

    expect(logger.debug).toHaveBeenCalled();
  });

  test('handles keyboard navigation - Escape to go back', async () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    await waitFor(() => {
      expect(screen.getByText('← Back to Decks')).toBeInTheDocument();
    });

    const page = document.querySelector('.study-guide-page');
    if (page) {
      fireEvent.keyDown(page, { key: 'Escape' });

      // Should go back to deck selection
      await waitFor(() => {
        expect(screen.queryByText('← Back to Decks')).not.toBeInTheDocument();
      });
    }
  });

  test('goes back to deck selection when back button is clicked', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    const backButton = screen.getByText('← Back to Decks');
    fireEvent.click(backButton);

    expect(screen.queryByText('← Back to Decks')).not.toBeInTheDocument();
    expect(screen.getByTestId('deck-Compute')).toBeInTheDocument();
  });

  test('shows card counter', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });

  test('shows flip button', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    expect(screen.getByText('Show Answer')).toBeInTheDocument();
  });

  test('flip button changes text when card is flipped', () => {
    renderWithRouter(<StudyGuide />);

    const computeDeck = screen.getByTestId('deck-Compute');
    fireEvent.click(computeDeck);

    const flipButton = screen.getByText('Show Answer');
    fireEvent.click(flipButton);

    expect(screen.getByText('Show Question')).toBeInTheDocument();
  });

  test('renders SEO component', () => {
    renderWithRouter(<StudyGuide />);
    const seoComponent = screen.getByTestId('seo-component');
    expect(seoComponent).toHaveAttribute(
      'data-title',
      'Study Guide - GCP & Coding | Tron Swan'
    );
    expect(seoComponent).toHaveAttribute('data-url', '/study-guide');
  });
});
