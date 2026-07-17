import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProductCard } from '../../components/catalog/ProductCard';
import { mockProduct } from '../mocks/handlers';

function renderCard(product = mockProduct) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  );
}

describe('ProductCard', () => {
  it('renders name and price without decimals', () => {
    renderCard();
    expect(screen.getByText('Bolso Tote Milano')).toBeInTheDocument();
    // Formatted price ($ 342.000 in es-AR locale) uses a non-breaking space between
    // symbol and number; match with a regex to sidestep whitespace normalization diffs.
    expect(screen.getByText(/342\.000/)).toBeInTheDocument();
  });

  it('renders wishlist heart (inert)', () => {
    const { container } = renderCard();
    expect(container.querySelector('[data-wishlist]')).not.toBeNull();
  });

  it('links product name and image to /producto/:slug', () => {
    const { container } = renderCard();
    const links = container.querySelectorAll('a[href="/producto/bolso-tote-milano"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});
