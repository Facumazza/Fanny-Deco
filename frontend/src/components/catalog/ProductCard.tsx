import { Link } from 'react-router-dom';
import type { ProductSummary } from '../../types/api';
import { StarRating } from './StarRating';
import { formatArs } from '../../lib/price';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="bg-white rounded-card overflow-hidden flex flex-col group">
      <Link to={`/producto/${product.slug}`} className="relative aspect-square bg-cream-card block">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          data-wishlist
          aria-label="Agregar a favoritos"
          onClick={e => e.preventDefault()}
          className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white cursor-default"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </Link>
      <div className="p-4 flex flex-col gap-2">
        <StarRating value={product.ratingAvg} count={product.ratingCount} />
        <Link
          to={`/producto/${product.slug}`}
          className="font-display text-lg leading-snug text-ink hover:text-terracotta transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-terracotta font-semibold">
            {formatArs(product.priceArs)}
          </span>
        </div>
      </div>
    </article>
  );
}
