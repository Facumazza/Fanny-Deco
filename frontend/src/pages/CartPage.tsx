// Placeholder — full cart page lives in the next chunk (piece B).
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../hooks/useCart';

export default function CartPage() {
  const { items, itemCount, subtotalUsd } = useCart();

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl text-ink mb-6">Tu carrito</h1>
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted mb-4">Todavía no agregaste productos.</p>
            <Link to="/" className="text-terracotta hover:underline">
              Ir a la tienda →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-muted mb-4">
              {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'} · Subtotal: ${subtotalUsd.toFixed(2)} USD
            </p>
            <ul className="space-y-3">
              {items.map(it => (
                <li key={`${it.productId}-${it.color ?? ''}`}
                    className="bg-white p-4 rounded-card flex items-center gap-3">
                  <img src={it.imageUrl} alt="" className="w-16 h-16 object-cover rounded-sm" />
                  <div className="flex-1">
                    <p className="font-medium text-ink">{it.name}</p>
                    {it.color && <p className="text-xs text-muted">Color: {it.color}</p>}
                  </div>
                  <p className="text-sm text-muted">×{it.quantity}</p>
                  <p className="font-semibold text-terracotta">
                    ${(it.priceUsd * it.quantity).toFixed(0)} USD
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted mt-6">
              (Vista mínima — cantidades editables y checkout en la próxima pieza.)
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
