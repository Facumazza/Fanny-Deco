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
  it('renders name, price without decimals, and badge label', () => {
    renderCard();
    expect(screen.getByText('Bolso Tote Milano')).toBeInTheDocument();
    expect(screen.getByText('$285 USD')).toBeInTheDocument();
    expect(screen.getByText('MÁS VENDIDO')).toBeInTheDocument();
  });

  it('renders correct number of color swatches', () => {
    const { container } = renderCard();
    expect(container.querySelectorAll('[data-swatch]')).toHaveLength(3);
  });

  it('renders wishlist heart (inert)', () => {
    const { container } = renderCard();
    expect(container.querySelector('[data-wishlist]')).not.toBeNull();
  });

  it('omits badge when product.badge is null', () => {
    renderCard({ ...mockProduct, badge: null });
    expect(screen.queryByText('MÁS VENDIDO')).not.toBeInTheDocument();
  });

  it('links product name and image to /producto/:slug', () => {
    const { container } = renderCard();
    const links = container.querySelectorAll('a[href="/producto/bolso-tote-milano"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});
