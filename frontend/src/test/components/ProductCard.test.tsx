import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductCard } from '../../components/catalog/ProductCard';
import { mockProduct } from '../mocks/handlers';

describe('ProductCard', () => {
  it('renders name, price without decimals, and badge label', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Bolso Tote Milano')).toBeInTheDocument();
    expect(screen.getByText('$285 USD')).toBeInTheDocument();
    expect(screen.getByText('MÁS VENDIDO')).toBeInTheDocument();
  });

  it('renders correct number of color swatches', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container.querySelectorAll('[data-swatch]')).toHaveLength(3);
  });

  it('renders wishlist heart (inert)', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container.querySelector('[data-wishlist]')).not.toBeNull();
  });

  it('omits badge when product.badge is null', () => {
    render(<ProductCard product={{ ...mockProduct, badge: null }} />);
    expect(screen.queryByText('MÁS VENDIDO')).not.toBeInTheDocument();
  });
});
