import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

/**
 * A cart item snapshots the product at the moment it was added so the cart survives
 * later price changes on the backend. Real e-commerce revalidates prices at checkout;
 * see backend order flow.
 */
export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  imageUrl: string;
  priceArs: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (input: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  itemCount: number;   // total units across items
  subtotalArs: number;
}

// v2 = colors removed. Old carts (v1) on returning visitors are silently
// dropped instead of migrated — a stale cart is low-cost, and the previous
// shape carried a color per line we no longer track.
const STORAGE_KEY = 'artesa.cart.v2';

const CartContext = createContext<CartState | null>(null);

function loadInitial(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic shape check — drop anything that looks wrong instead of throwing.
    return parsed.filter((it): it is CartItem =>
      it && typeof it.productId === 'number' && typeof it.quantity === 'number'
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('cart persist failed', err);
    }
  }, [items]);

  const addItem = useCallback<CartState['addItem']>((input) => {
    // Every FannyDeco piece is one-of-a-kind (stock = 1). Cap the cart line
    // at qty 1 here so a second click on "Agregar al carrito" is a silent
    // no-op instead of stacking phantom units the shop can't actually ship.
    setItems(list => {
      const idx = list.findIndex(it => it.productId === input.productId);
      if (idx >= 0) return list;
      return [
        ...list,
        {
          productId: input.productId,
          slug: input.slug,
          name: input.name,
          imageUrl: input.imageUrl,
          priceArs: input.priceArs,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback<CartState['updateQuantity']>((productId, quantity) => {
    setItems(list => {
      if (quantity <= 0) {
        return list.filter(it => it.productId !== productId);
      }
      // Same qty=1 cap as addItem — any code path that tries to bump a line
      // above 1 gets clamped back down.
      const clamped = Math.min(1, quantity);
      return list.map(it =>
        it.productId === productId ? { ...it, quantity: clamped } : it
      );
    });
  }, []);

  const removeItem = useCallback<CartState['removeItem']>((productId) => {
    setItems(list => list.filter(it => it.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const derived = useMemo(() => {
    const itemCount = items.reduce((n, it) => n + it.quantity, 0);
    const subtotalArs = items.reduce((s, it) => s + it.quantity * it.priceArs, 0);
    return { itemCount, subtotalArs };
  }, [items]);

  return (
    <CartContext.Provider value={{
      items, addItem, updateQuantity, removeItem, clear, ...derived,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
