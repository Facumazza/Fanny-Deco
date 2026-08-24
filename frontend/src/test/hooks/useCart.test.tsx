import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { CartProvider, useCart } from '../../hooks/useCart';
import type { ReactNode } from 'react';

beforeEach(() => { window.localStorage.clear(); });

const bag = {
  productId: 1, slug: 'bolso-tote-milano', name: 'Bolso Tote Milano',
  imageUrl: 'https://x/b.jpg', priceArs: 342000,
  requiresCompanion: false, isCompanion: true,
};

const accessory = {
  productId: 2, slug: 'llavero-cuero', name: 'Llavero de Cuero',
  imageUrl: 'https://x/a.jpg', priceArs: 25000,
  requiresCompanion: true, isCompanion: false,
};

const vase = {
  productId: 3, slug: 'jarron-terra', name: 'Jarrón Terra',
  imageUrl: 'https://x/v.jpg', priceArs: 90000,
  requiresCompanion: false, isCompanion: false,
};

function setup() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );
  return renderHook(() => useCart(), { wrapper });
}

describe('useCart — regla de acompañante', () => {
  it('un accesorio solo bloquea el checkout', () => {
    const { result } = setup();
    act(() => { result.current.addItem(accessory); });

    expect(result.current.companionMissing).toBe(true);
    expect(result.current.companionBlockedNames).toEqual(['Llavero de Cuero']);
  });

  it('una cartera destraba todos los accesorios del carrito', () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(accessory);
      result.current.addItem({ ...accessory, productId: 4, name: 'Otro llavero' });
      result.current.addItem(bag);
    });

    expect(result.current.companionMissing).toBe(false);
  });

  it('una cerámica no alcanza como acompañante', () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(accessory);
      result.current.addItem(vase);
    });

    expect(result.current.companionMissing).toBe(true);
  });

  it('vuelve a bloquear si se saca la cartera', () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(accessory);
      result.current.addItem(bag);
    });
    expect(result.current.companionMissing).toBe(false);

    act(() => { result.current.removeItem(bag.productId); });
    expect(result.current.companionMissing).toBe(true);
  });

  it('un carrito sin accesorios nunca queda bloqueado', () => {
    const { result } = setup();
    act(() => { result.current.addItem(vase); });

    expect(result.current.companionMissing).toBe(false);
    expect(result.current.companionBlockedNames).toEqual([]);
  });

  it('descarta carritos guardados sin las reglas de compra', () => {
    // Forma vieja (v2): sin requiresCompanion/isCompanion. Si la aceptáramos,
    // un accesorio guardado antes del cambio pasaría el checkout sin cartera.
    window.localStorage.setItem('artesa.cart.v3', JSON.stringify([
      { productId: 9, slug: 's', name: 'Viejo', imageUrl: 'x', priceArs: 1, quantity: 1 },
    ]));

    const { result } = setup();

    expect(result.current.items).toEqual([]);
  });
});
