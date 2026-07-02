import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StarRating } from '../../components/catalog/StarRating';

describe('StarRating', () => {
  it('renders count in parentheses', () => {
    const { getByText } = render(<StarRating value={5} count={128} />);
    expect(getByText('(128)')).toBeInTheDocument();
  });

  it('renders 5 star elements', () => {
    const { container } = render(<StarRating value={4} count={10} />);
    expect(container.querySelectorAll('[data-star]')).toHaveLength(5);
  });

  it('marks fractional rating with fill percentage attribute', () => {
    const { container } = render(<StarRating value={4.5} count={10} />);
    const stars = container.querySelectorAll('[data-star-fill]');
    const fills = Array.from(stars).map(s => s.getAttribute('data-star-fill'));
    expect(fills).toEqual(['1', '1', '1', '1', '0.5']);
  });
});
