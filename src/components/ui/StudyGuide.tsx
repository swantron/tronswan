import React, { useState, useEffect } from 'react';

import type { StudyCard, StudyDeck } from '../../types/studyGuide';
import { logger } from '../../utils/logger';
import '../../styles/StudyGuide.css';
import arraysCards from '../../data/study-guide/coding/arrays.json';
import dpCards from '../../data/study-guide/coding/dynamic-programming.json';
import graphsCards from '../../data/study-guide/coding/graphs.json';
import computeAdvancedCards from '../../data/study-guide/gcp/compute-advanced.json';
import computeCards from '../../data/study-guide/gcp/compute.json';
import dataAnalyticsCards from '../../data/study-guide/gcp/data-analytics.json';
import monitoringCards from '../../data/study-guide/gcp/monitoring-operations.json';
import networkingAdvancedCards from '../../data/study-guide/gcp/networking-advanced.json';
import networkingCards from '../../data/study-guide/gcp/networking.json';
import securityCards from '../../data/study-guide/gcp/security.json';
import storageAdvancedCards from '../../data/study-guide/gcp/storage-advanced.json';
import storageCards from '../../data/study-guide/gcp/storage.json';
import caseStudiesCards from '../../data/study-guide/gcp/case-studies.json';
import practiceQuestionsCards from '../../data/study-guide/gcp/practice-questions.json';

import SEO from './SEO';

const decks: StudyDeck[] = [
  {
    name: 'Compute',
    subcategory: 'Compute',
    category: 'GCP',
    cards: computeCards as StudyCard[],
  },
  {
    name: 'Storage',
    subcategory: 'Storage',
    category: 'GCP',
    cards: storageCards as StudyCard[],
  },
  {
    name: 'Networking',
    subcategory: 'Networking',
    category: 'GCP',
    cards: networkingCards as StudyCard[],
  },
  {
    name: 'Security',
    subcategory: 'Security',
    category: 'GCP',
    cards: securityCards as StudyCard[],
  },
  {
    name: 'Networking Advanced',
    subcategory: 'Networking',
    category: 'GCP',
    cards: networkingAdvancedCards as StudyCard[],
  },
  {
    name: 'Storage Advanced',
    subcategory: 'Storage',
    category: 'GCP',
    cards: storageAdvancedCards as StudyCard[],
  },
  {
    name: 'Compute Advanced',
    subcategory: 'Compute',
    category: 'GCP',
    cards: computeAdvancedCards as StudyCard[],
  },
  {
    name: 'Monitoring & Operations',
    subcategory: 'Monitoring & Operations',
    category: 'GCP',
    cards: monitoringCards as StudyCard[],
  },
  {
    name: 'Data & Analytics',
    subcategory: 'Data & Analytics',
    category: 'GCP',
    cards: dataAnalyticsCards as StudyCard[],
  },
  {
    name: 'Case Studies',
    subcategory: 'Case Studies',
    category: 'GCP',
    cards: caseStudiesCards as StudyCard[],
  },
  {
    name: 'Practice Questions',
    subcategory: 'Practice Questions',
    category: 'GCP',
    cards: practiceQuestionsCards as StudyCard[],
  },
  {
    name: 'Arrays',
    subcategory: 'Arrays',
    category: 'Coding',
    cards: arraysCards as StudyCard[],
  },
  {
    name: 'Graphs',
    subcategory: 'Graphs',
    category: 'Coding',
    cards: graphsCards as StudyCard[],
  },
  {
    name: 'Dynamic Programming',
    subcategory: 'Dynamic Programming',
    category: 'Coding',
    cards: dpCards as StudyCard[],
  },
];

function StudyGuide() {
  const [selectedDeck, setSelectedDeck] = useState<StudyDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'GCP' | 'Coding'
  >('all');

  useEffect(() => {
    logger.info('Study Guide page loaded', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  const filteredDecks = decks.filter(
    deck => selectedCategory === 'all' || deck.category === selectedCategory
  );

  const handleDeckSelect = (deck: StudyDeck) => {
    setSelectedDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    logger.info('Deck selected', {
      deck: deck.name,
      category: deck.category,
      cardCount: deck.cards.length,
    });
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    logger.debug('Card flipped', {
      flipped: !isFlipped,
      cardId: selectedDeck?.cards[currentCardIndex]?.id,
    });
  };

  const handleNextCard = () => {
    if (selectedDeck && currentCardIndex < selectedDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!selectedDeck) return;

    switch (e.key) {
      case 'ArrowRight':
        handleNextCard();
        break;
      case 'ArrowLeft':
        handlePrevCard();
        break;
      case ' ':
        e.preventDefault();
        handleCardFlip();
        break;
      case 'Escape':
        setSelectedDeck(null);
        setIsFlipped(false);
        break;
    }
  };

  const currentCard = selectedDeck?.cards[currentCardIndex];

  return (
    <div className='study-guide-page' onKeyDown={handleKeyPress} tabIndex={0}>
      <SEO
        title='Study Guide - GCP & Coding | Tron Swan'
        description='Study guide for GCP Professional Cloud Architect certification and coding interview preparation. Flashcard-style learning for cloud architecture and algorithm problems.'
        keywords='GCP, Google Cloud Platform, Professional Cloud Architect, coding interview, leetcode, study guide, flashcards'
        url='/study-guide'
      />

      <div className='study-guide-content'>
        <h1 className='study-guide-title' data-testid='study-guide-title'>
          study guide
        </h1>

        {!selectedDeck ? (
          <>
            <div className='category-filter'>
              <button
                className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button
                className={`filter-button ${selectedCategory === 'GCP' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('GCP')}
              >
                GCP
              </button>
              <button
                className={`filter-button ${selectedCategory === 'Coding' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Coding')}
              >
                Coding
              </button>
            </div>

            <div className='decks-grid'>
              {filteredDecks.map(deck => (
                <div
                  key={deck.name}
                  className='deck-card'
                  onClick={() => handleDeckSelect(deck)}
                  data-testid={`deck-${deck.name}`}
                >
                  <div className='deck-header'>
                    <span className='deck-category-badge'>{deck.category}</span>
                    <span className='deck-card-count'>
                      {deck.cards.length} cards
                    </span>
                  </div>
                  <h3 className='deck-name'>{deck.name}</h3>
                  <p className='deck-subcategory'>{deck.subcategory}</p>
                </div>
              ))}
            </div>

            <div className='study-guide-info'>
              <p>Select a deck to start studying</p>
              <p className='keyboard-hints'>
                Use keyboard: ← → to navigate, Space to flip, Esc to go back
              </p>
            </div>
          </>
        ) : (
          <>
            <div className='study-header'>
              <button
                className='back-button'
                onClick={() => {
                  setSelectedDeck(null);
                  setIsFlipped(false);
                }}
              >
                ← Back to Decks
              </button>
              <h2 className='deck-title'>{selectedDeck.name}</h2>
              <div className='card-counter'>
                {currentCardIndex + 1} / {selectedDeck.cards.length}
              </div>
            </div>

            {currentCard && (
              <div className='card-container'>
                <div
                  className={`study-card ${isFlipped ? 'flipped' : ''}`}
                  onClick={handleCardFlip}
                  data-testid='study-card'
                >
                  <div className='card-front'>
                    <div className='card-content'>
                      <div className='card-tags'>
                        {currentCard.tags.map(tag => (
                          <span key={tag} className='tag'>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className='card-text'>{currentCard.front}</p>
                      <div className='card-hint'>Click to flip</div>
                    </div>
                  </div>
                  <div className='card-back'>
                    <div className='card-content'>
                      <div className='card-tags'>
                        {currentCard.tags.map(tag => (
                          <span key={tag} className='tag'>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className='card-text'>{currentCard.back}</p>
                      <div className='card-hint'>Click to flip back</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className='card-controls'>
              <button
                className='nav-button'
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
              >
                ← Previous
              </button>
              <button className='flip-button' onClick={handleCardFlip}>
                {isFlipped ? 'Show Question' : 'Show Answer'}
              </button>
              <button
                className='nav-button'
                onClick={handleNextCard}
                disabled={
                  !selectedDeck ||
                  currentCardIndex === selectedDeck.cards.length - 1
                }
              >
                Next →
              </button>
            </div>

            <div className='keyboard-hints'>
              <p>Keyboard shortcuts: ← → navigate | Space flip | Esc back</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudyGuide;
