import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import PageTransition from './PageTransition';

describe('PageTransition Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <MemoryRouter>
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      </MemoryRouter>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('applies fadeIn class on initial render', () => {
    const { container } = render(
      <MemoryRouter>
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      </MemoryRouter>
    );

    const transitionDiv = container.querySelector('.page-transition');
    expect(transitionDiv).toHaveClass('fadeIn');
  });
});
