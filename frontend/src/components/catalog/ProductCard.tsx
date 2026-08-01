import { Link } from 'react-router-dom';
import type { ProductSummary } from '../../types/api';
import { formatArs } from '../../lib/price';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="bg-white rounded-card overflow-hidden flex flex-col group">
      <Link to={`/producto/${product.slug}`} className="relative aspect-square bg-cream-card block">
        {/* object-contain (not object-cover) so every product photo shows in
            full inside the square regardless of its aspect ratio. With cover
            the varied portrait/landscape shots each cropped to a different
            focal point and the grid looked inconsistent. The cream-card
            background frames the letterboxing so all cards read as one system. */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain"
        />
      </Link>
      <div className="p-4 flex flex-col gap-2">
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
