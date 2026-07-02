import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../../components/catalog/Badge';

describe('Badge', () => {
  it('renders Spanish label for MAS_VENDIDO', () => {
    render(<Badge kind="MAS_VENDIDO" />);
    expect(screen.getByText('MÁS VENDIDO')).toBeInTheDocument();
  });

  it('renders EDICIÓN LIMITADA with accent', () => {
    render(<Badge kind="EDICION_LIMITADA" />);
    expect(screen.getByText('EDICIÓN LIMITADA')).toBeInTheDocument();
  });

  it('renders SET X3 with space', () => {
    render(<Badge kind="SET_X3" />);
    expect(screen.getByText('SET X3')).toBeInTheDocument();
  });
});
