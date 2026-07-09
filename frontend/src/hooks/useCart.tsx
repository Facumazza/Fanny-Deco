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
  color: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (input: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: number, color: string | null, quantity: number) => void;
  removeItem: (productId: number, color: string | null) => void;
  clear: () => void;
  itemCount: number;   // total units across items
  subtotalArs: number;
}

const STORAGE_KEY = 'artesa.cart.v1';

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

/**
 * Two entries in the cart are the "same line" when they refer to the same product
 * AND the same selected color. Adding an existing (product, color) combo bumps qty.
 */
function sameLine(a: CartItem, productId: number, color: string | null): boolean {
  return a.productId === productId && (a.color ?? null) === (color ?? null);
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
    const qty = Math.max(1, input.quantity ?? 1);
    setItems(list => {
      const idx = list.findIndex(it => sameLine(it, input.productId, input.color));
      if (idx >= 0) {
        const next = [...list];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [
        ...list,
        {
          productId: input.productId,
          slug: input.slug,
          name: input.name,
          imageUrl: input.imageUrl,
          priceArs: input.priceArs,
          color: input.color,
          quantity: qty,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback<CartState['updateQuantity']>((productId, color, quantity) => {
    setItems(list => {
      if (quantity <= 0) {
        return list.filter(it => !sameLine(it, productId, color));
      }
      return list.map(it =>
        sameLine(it, productId, color) ? { ...it, quantity } : it
      );
    });
  }, []);

  const removeItem = useCallback<CartState['removeItem']>((productId, color) => {
    setItems(list => list.filter(it => !sameLine(it, productId, color)));
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
