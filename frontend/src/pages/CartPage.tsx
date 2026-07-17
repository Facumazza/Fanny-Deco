import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../hooks/useCart';
import type { CartItem } from '../hooks/useCart';

import { formatArs } from '../lib/price';

export default function CartPage() {
  const { items, itemCount, subtotalArs, updateQuantity, removeItem, clear } = useCart();
  const isEmpty = items.length === 0;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-terracotta text-xs tracking-[0.3em] mb-2">CARRITO</p>
        <h1 className="font-display text-4xl text-ink mb-8">
          {isEmpty ? 'Tu carrito está vacío' : `Tu carrito (${itemCount})`}
        </h1>

        {isEmpty ? (
          <div className="bg-white p-12 rounded-card text-center">
            <p className="text-muted mb-6">Todavía no agregaste productos.</p>
            <Link
              to="/"
              className="inline-block bg-brown-dark hover:bg-brown text-white px-6 py-3 text-sm tracking-wider font-semibold"
            >
              IR A LA TIENDA
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <ul className="lg:col-span-2 space-y-4">
              {items.map(it => (
                <CartRow
                  key={it.productId}
                  item={it}
                  onDecrease={() => updateQuantity(it.productId, it.quantity - 1)}
                  onIncrease={() => updateQuantity(it.productId, it.quantity + 1)}
                  onRemove={() => removeItem(it.productId)}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Vaciar el carrito?')) clear();
                }}
                className="text-sm text-muted hover:text-terracotta"
              >
                Vaciar carrito
              </button>
            </ul>

            {/* Summary */}
            <aside className="bg-white rounded-card p-6 h-fit lg:sticky lg:top-6">
              <p className="text-xs tracking-[0.3em] text-muted mb-4">RESUMEN</p>
              <div className="flex justify-between text-ink mb-2">
                <span>Subtotal</span>
                <span className="font-semibold">{formatArs(subtotalArs)}</span>
              </div>
              <p className="text-xs text-muted mb-6">
                Envío y descuentos se calculan en el próximo paso.
              </p>
              <Link
                to="/checkout"
                className="block bg-brown-dark hover:bg-brown text-white text-center py-4 text-sm tracking-wider font-semibold transition-colors"
              >
                CONTINUAR AL CHECKOUT →
              </Link>
              <Link
                to="/"
                className="block text-center text-muted hover:text-terracotta mt-4 text-sm"
              >
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function CartRow({ item, onDecrease, onIncrease, onRemove }: {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  const lineTotal = item.priceArs * item.quantity;

  return (
    <li className="bg-white rounded-card p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
      <Link to={`/producto/${item.slug}`} className="shrink-0">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-sm bg-cream-card"
          loading="lazy"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/producto/${item.slug}`}
          className="font-display text-lg text-ink hover:text-terracotta transition-colors block"
        >
          {item.name}
        </Link>
        <p className="text-sm text-muted mt-1">
          {formatArs(item.priceArs)} c/u
        </p>
      </div>

      {/* Qty stepper */}
      <div className="inline-flex items-center border border-cream-card">
        <button
          type="button"
          onClick={onDecrease}
          aria-label="Disminuir"
          className="px-3 py-2 text-ink hover:bg-cream-card"
        >
          −
        </button>
        <span className="px-4 py-2 min-w-[2.5rem] text-center">{item.quantity}</span>
        <button
          type="button"
          onClick={onIncrease}
          aria-label="Aumentar"
          className="px-3 py-2 text-ink hover:bg-cream-card"
        >
          +
        </button>
      </div>

      <p className="font-semibold text-terracotta w-24 text-right">
        {formatArs(lineTotal)}
      </p>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Eliminar ${item.name}`}
        title="Eliminar"
        className="text-muted hover:text-terracotta text-xl px-2"
      >
        ×
      </button>
    </li>
  );
}
