import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach } from 'vitest';
import HomePage from '../../pages/HomePage';
import { CartProvider } from '../../hooks/useCart';
import { server } from '../setup';
import { mockCategories, mockProductsPage } from '../mocks/handlers';

beforeEach(() => { window.localStorage.clear(); });

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <HomePage />
      </CartProvider>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  it('renders categories and products from the API', async () => {
    renderWithRouter();
    await waitFor(() => {
      // Category names appear both in the categories grid and in the footer TIENDA column.
      expect(screen.getAllByText('Carteras de Cuero').length).toBeGreaterThan(0);
      expect(screen.getByText('Bolso Tote Milano')).toBeInTheDocument();
    });
    for (const c of mockCategories) {
      expect(screen.getAllByText(c.name).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText(/342\.000/)).toHaveLength(mockProductsPage.content.length);
  });

  it('shows retry button on error and recovers on click', async () => {
    server.use(
      http.get('/api/categories', () =>
        HttpResponse.json({ code: 'BOOM', message: 'x', timestamp: 'x' }, { status: 500 })
      ),
    );
    renderWithRouter();

    const retry = await screen.findByRole('button', { name: /reintentar/i });
    expect(retry).toBeInTheDocument();

    server.resetHandlers();
    await userEvent.click(retry);

    await waitFor(() => {
      expect(screen.getByText('Bolso Tote Milano')).toBeInTheDocument();
    });
  });
});
